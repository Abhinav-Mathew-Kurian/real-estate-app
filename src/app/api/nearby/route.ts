import { NextRequest, NextResponse } from "next/server";

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type OEl = {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function categorize(el: OEl): string | null {
  const a = el.tags?.amenity;
  const s = el.tags?.shop;
  const h = el.tags?.highway;
  if (a === "hospital" || a === "clinic") return "hospital";
  if (a === "pharmacy") return "pharmacy";
  if (a === "school" || a === "college" || a === "university") return "school";
  if (a === "bank" || a === "atm") return "bank";
  if (a === "restaurant" || a === "cafe" || a === "fast_food") return "restaurant";
  if (a === "fuel") return "fuel";
  if (s === "supermarket" || s === "convenience" || s === "grocery") return "grocery";
  if (h === "bus_stop") return "bus";
  if (el.tags?.public_transport === "stop_position" || el.tags?.public_transport === "platform") return "bus";
  return null;
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
];

async function fetchOverpass(query: string, timeoutMs = 14_000): Promise<OEl[]> {
  const body = `data=${encodeURIComponent(query)}`;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "SellKerala/1.0 (kerala real estate platform)",
  };

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body,
        headers,
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) continue;
      const data = await res.json();
      return data.elements ?? [];
    } catch {
      // try next endpoint
    }
  }
  return [];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "Invalid lat/lng" }, { status: 400 });
  }

  // Phase 1: node-only query — fast, covers rural & suburban areas well
  // Phase 2: way-only query for hospital/school/bank/grocery — covers urban buildings
  // Run both in parallel, merge results, deduplicate by OSM id
  const nodeQuery = `[out:json][timeout:12];
(
  node["amenity"~"hospital|clinic"](around:3000,${lat},${lng});
  node["amenity"="pharmacy"](around:2000,${lat},${lng});
  node["amenity"~"school|college|university"](around:2500,${lat},${lng});
  node["amenity"~"bank|atm"](around:1500,${lat},${lng});
  node["amenity"~"restaurant|cafe|fast_food"](around:1500,${lat},${lng});
  node["amenity"="fuel"](around:2000,${lat},${lng});
  node["shop"~"supermarket|convenience|grocery"](around:2000,${lat},${lng});
  node["highway"="bus_stop"](around:1000,${lat},${lng});
  node["public_transport"~"stop_position|platform"](around:1000,${lat},${lng});
);
out;`;

  // Way query covers things like hospital buildings, school campuses, malls — common in cities
  const wayQuery = `[out:json][timeout:12];
(
  way["amenity"~"hospital|clinic"](around:3000,${lat},${lng});
  way["amenity"~"school|college|university"](around:2500,${lat},${lng});
  way["amenity"~"bank"](around:1500,${lat},${lng});
  way["shop"~"supermarket|grocery"](around:2000,${lat},${lng});
  way["amenity"="fuel"](around:2000,${lat},${lng});
);
out center;`;

  const [nodeEls, wayEls] = await Promise.all([
    fetchOverpass(nodeQuery, 14_000),
    fetchOverpass(wayQuery, 14_000),
  ]);

  // Merge, deduplicate by id
  const seen = new Set<number>();
  const elements: OEl[] = [];
  for (const el of [...nodeEls, ...wayEls]) {
    if (!seen.has(el.id)) {
      seen.add(el.id);
      elements.push(el);
    }
  }

  const buckets: Record<string, { name: string; distanceM: number; lat: number; lng: number }[]> = {};

  for (const el of elements) {
    const cat = categorize(el);
    if (!cat) continue;
    const elLat = el.lat ?? el.center?.lat;
    const elLon = el.lon ?? el.center?.lon;
    if (!elLat || !elLon) continue;

    const name =
      el.tags?.name ||
      el.tags?.["name:en"] ||
      el.tags?.["name:ml"] ||
      cat;

    const distanceM = haversineM(lat, lng, elLat, elLon);
    if (!buckets[cat]) buckets[cat] = [];
    buckets[cat].push({ name, distanceM, lat: elLat, lng: elLon });
  }

  const result: Record<string, { name: string; distanceM: number; lat: number; lng: number }[]> = {};
  for (const [cat, places] of Object.entries(buckets)) {
    result[cat] = places
      .sort((a, b) => a.distanceM - b.distanceM)
      .slice(0, 5);
  }

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
