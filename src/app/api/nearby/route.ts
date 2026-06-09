import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { unstable_cache } from "next/cache";

type Amenity = {
  id: number;
  lat: number;
  lng: number;
  name: string;
  type: string;
  distance: number;
};

type GroupedAmenities = Record<string, Amenity[]>;

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dPhi = ((lat2 - lat1) * Math.PI) / 180;
  const dLambda = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

async function fetchNearby(
  listingId: string,
  radius: number
): Promise<GroupedAmenities> {
  await connectDB();
  const listing = await Listing.findById(listingId).select("geo").lean();

  if (!listing?.geo?.coordinates) {
    return {};
  }

  const [lng, lat] = listing.geo.coordinates;

  const overpassQuery = `[out:json][timeout:10];(
    node["amenity"~"hospital|school|college|bank|bus_stop|supermarket|place_of_worship"](around:${radius},${lat},${lng});
  );out body;`;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(overpassQuery)}`,
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok) return {};

  const data = await res.json();
  const elements = data.elements ?? [];

  const amenities: Amenity[] = elements.map(
    (el: { id: number; lat: number; lon: number; tags?: Record<string, string> }) => ({
      id: el.id,
      lat: el.lat,
      lng: el.lon,
      name: el.tags?.name ?? el.tags?.amenity ?? "Unknown",
      type: el.tags?.amenity ?? "unknown",
      distance: haversineDistance(lat, lng, el.lat, el.lon),
    })
  );

  // Group by type and sort nearest first
  const grouped: GroupedAmenities = {};
  for (const a of amenities) {
    if (!grouped[a.type]) grouped[a.type] = [];
    grouped[a.type].push(a);
  }

  for (const type of Object.keys(grouped)) {
    grouped[type].sort((a, b) => a.distance - b.distance);
    grouped[type] = grouped[type].slice(0, 5); // max 5 per type
  }

  return grouped;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");
  const radius = Math.min(5000, Math.max(100, parseInt(searchParams.get("radius") ?? "1500")));

  if (!listingId) {
    return NextResponse.json({ error: "listingId required" }, { status: 400 });
  }

  try {
    const cachedFetch = unstable_cache(
      () => fetchNearby(listingId, radius),
      [`nearby-${listingId}-${radius}`],
      { revalidate: 60 * 60 * 24 * 7 } // 7 days
    );

    const grouped = await cachedFetch();
    return NextResponse.json({ grouped });
  } catch (err) {
    console.error("Nearby API error:", err);
    return NextResponse.json({ grouped: {} });
  }
}
