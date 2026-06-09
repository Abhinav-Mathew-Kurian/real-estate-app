"use client";

import { useEffect, useState } from "react";
import {
  Hospital,
  Pill,
  ShoppingCart,
  GraduationCap,
  Landmark,
  Utensils,
  Fuel,
  Bus,
  Loader2,
  MapPin,
  Navigation,
  AlertCircle,
} from "lucide-react";

type Place = { name: string; distanceM: number };
type CategoryResult = {
  key: string;
  icon: React.ElementType;
  label: string;
  color: string;
  places: Place[];
};

const CAT_META: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  hospital:   { icon: Hospital,     label: "Hospitals & Clinics",    color: "text-red-600 bg-red-50 border-red-100" },
  pharmacy:   { icon: Pill,         label: "Pharmacies",             color: "text-purple-600 bg-purple-50 border-purple-100" },
  grocery:    { icon: ShoppingCart, label: "Grocery & Supermarkets", color: "text-green-600 bg-green-50 border-green-100" },
  school:     { icon: GraduationCap,label: "Schools & Colleges",     color: "text-blue-600 bg-blue-50 border-blue-100" },
  bank:       { icon: Landmark,     label: "Banks & ATMs",           color: "text-yellow-700 bg-yellow-50 border-yellow-100" },
  restaurant: { icon: Utensils,     label: "Restaurants & Cafes",    color: "text-orange-600 bg-orange-50 border-orange-100" },
  fuel:       { icon: Fuel,         label: "Petrol Stations",        color: "text-slate-600 bg-slate-50 border-slate-100" },
  bus:        { icon: Bus,          label: "Bus Stops",              color: "text-emerald-700 bg-emerald-50 border-emerald-100" },
};

function formatDist(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function ManualLandmarks({ landmarks }: { landmarks: string[] }) {
  if (landmarks.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {landmarks.map((lm, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest/8 border border-forest/15 text-forest text-xs font-medium"
        >
          <Navigation className="w-3 h-3 shrink-0" />
          {lm}
        </span>
      ))}
    </div>
  );
}

function OverpassResults({ lat, lng }: { lat: number; lng: number }) {
  const [results, setResults] = useState<CategoryResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setFailed(false);
      try {
        const res = await fetch(`/api/nearby?lat=${lat}&lng=${lng}`);
        if (!res.ok) throw new Error("failed");
        const data: Record<string, Place[]> = await res.json();

        if (cancelled) return;

        const out: CategoryResult[] = Object.entries(data)
          .filter(([, places]) => places.length > 0)
          .map(([key, places]) => {
            const meta = CAT_META[key] ?? {
              icon: MapPin,
              label: key,
              color: "text-gray-600 bg-gray-50 border-gray-100",
            };
            return { key, ...meta, places };
          })
          .sort((a, b) => {
            // sort by category order
            const order = Object.keys(CAT_META);
            return order.indexOf(a.key) - order.indexOf(b.key);
          });

        setResults(out);
      } catch {
        if (!cancelled) setFailed(true);
      }
      if (!cancelled) setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="flex items-center gap-2.5 py-4 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin shrink-0 text-emerald-brand" />
        Detecting nearby places from map data…
      </div>
    );
  }

  if (failed) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2.5 rounded-xl border border-amber-200">
        <AlertCircle className="w-4 h-4 shrink-0" />
        Could not load nearby places right now. Try refreshing.
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        No nearby places found within the search radius.
      </p>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Auto-detected from map data
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {results.map((cat) => {
          const Icon = cat.icon;
          const [textColor, bgColor, borderColor] = cat.color.split(" ");
          return (
            <div
              key={cat.key}
              className={`rounded-xl p-4 border ${bgColor} ${borderColor}`}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <span className={`p-1.5 rounded-lg bg-white/70 ${textColor}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className={`text-xs font-semibold ${textColor}`}>{cat.label}</span>
              </div>
              <ul className="space-y-1.5">
                {cat.places.map((place, i) => (
                  <li key={i} className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5 min-w-0">
                      <MapPin className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-xs text-ink/80 truncate">{place.name}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground shrink-0 tabular-nums">
                      {formatDist(place.distanceM)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type Props = {
  lat: number;
  lng: number;
  landmarks?: string[];
};

export function NearbyPlaces({ lat, lng, landmarks = [] }: Props) {
  return (
    <div>
      <ManualLandmarks landmarks={landmarks} />
      <OverpassResults lat={lat} lng={lng} />
    </div>
  );
}
