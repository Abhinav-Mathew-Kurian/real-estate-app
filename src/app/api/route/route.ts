import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

function roundCoord(n: number) {
  return Math.round(n * 1000) / 1000; // round to 3 decimal places for cache key
}

async function fetchRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
) {
  const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;

  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error("OSRM unavailable");

  const data = await res.json();
  const route = data.routes?.[0];
  if (!route) throw new Error("No route found");

  return {
    distanceKm: +(route.distance / 1000).toFixed(1),
    durationMin: Math.round(route.duration / 60),
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fromLat = parseFloat(searchParams.get("fromLat") ?? "0");
  const fromLng = parseFloat(searchParams.get("fromLng") ?? "0");
  const toLat = parseFloat(searchParams.get("toLat") ?? "0");
  const toLng = parseFloat(searchParams.get("toLng") ?? "0");

  if (!fromLat || !fromLng || !toLat || !toLng) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  const rFromLat = roundCoord(fromLat);
  const rFromLng = roundCoord(fromLng);
  const rToLat = roundCoord(toLat);
  const rToLng = roundCoord(toLng);

  try {
    const cachedFetch = unstable_cache(
      () => fetchRoute(rFromLat, rFromLng, rToLat, rToLng),
      [`route-${rFromLat}-${rFromLng}-${rToLat}-${rToLng}`],
      { revalidate: 60 * 60 * 24 } // 1 day
    );

    const result = await cachedFetch();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Route API error:", err);
    return NextResponse.json({ error: "Routing unavailable" }, { status: 503 });
  }
}
