"use client";

import { useEffect, useState } from "react";

type Amenity = {
  id: number;
  lat: number;
  lng: number;
  name: string;
  type: string;
  distance: number;
};

type GroupedAmenities = Record<string, Amenity[]>;

const AMENITY_ICONS: Record<string, string> = {
  hospital: "🏥",
  school: "🏫",
  college: "🎓",
  bank: "🏦",
  bus_stop: "🚌",
  supermarket: "🛒",
  place_of_worship: "⛪",
};

const AMENITY_LABELS: Record<string, string> = {
  hospital: "Hospitals",
  school: "Schools",
  college: "Colleges",
  bank: "Banks",
  bus_stop: "Bus Stops",
  supermarket: "Supermarkets",
  place_of_worship: "Places of Worship",
};

function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)}m`;
  return `${(metres / 1000).toFixed(1)}km`;
}

type NearbyPanelProps = {
  listingId: string;
};

export function NearbyPanel({ listingId }: NearbyPanelProps) {
  const [data, setData] = useState<GroupedAmenities | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/nearby?listingId=${listingId}&radius=1500`);
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        if (!cancelled) setData(json.grouped ?? {});
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [listingId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-mist rounded animate-pulse w-32" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-mist rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-muted-foreground py-2">
        Nearby amenities unavailable
      </div>
    );
  }

  const entries = Object.entries(data ?? {}).filter(([, items]) => items.length > 0);

  if (entries.length === 0) {
    return (
      <div className="text-xs text-muted-foreground py-2">
        No nearby amenities found within 1.5km
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-forest mb-3">
        Nearby Amenities
      </h3>
      <div className="space-y-4">
        {entries.map(([type, amenities]) => (
          <div key={type}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-base">{AMENITY_ICONS[type] ?? "📍"}</span>
              <span className="text-xs font-semibold text-ink">
                {AMENITY_LABELS[type] ?? type}
              </span>
            </div>
            <ul className="space-y-1.5">
              {amenities.slice(0, 3).map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between text-xs bg-mist rounded-lg px-3 py-2"
                >
                  <span className="text-ink truncate max-w-[160px]">{a.name}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">
                    {formatDistance(a.distance)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
