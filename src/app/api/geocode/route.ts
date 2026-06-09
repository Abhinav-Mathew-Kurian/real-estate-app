import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q?.trim()) {
    return NextResponse.json({ error: "Missing q" }, { status: 400 });
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "in");
    url.searchParams.set("addressdetails", "1");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "SellKerala/1.0 (kerala real estate platform)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Geocode service unavailable" }, { status: 502 });
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ result: null });
    }

    const first = data[0];
    return NextResponse.json({
      result: {
        lat: parseFloat(first.lat),
        lng: parseFloat(first.lon),
        displayName: first.display_name,
      },
    });
  } catch {
    return NextResponse.json({ error: "Geocode failed" }, { status: 500 });
  }
}
