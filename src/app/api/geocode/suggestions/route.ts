import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q?.trim() || q.trim().length < 3) {
    return NextResponse.json([]);
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", `${q}, Kerala, India`);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "5");
    url.searchParams.set("countrycodes", "in");
    url.searchParams.set("addressdetails", "0");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "SellKerala/1.0 (kerala real estate platform)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return NextResponse.json([]);

    const data = await res.json();
    if (!Array.isArray(data)) return NextResponse.json([]);

    return NextResponse.json(
      data.map((item) => ({
        displayName: item.display_name as string,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      })),
      { headers: { "Cache-Control": "public, s-maxage=300" } }
    );
  } catch {
    return NextResponse.json([]);
  }
}
