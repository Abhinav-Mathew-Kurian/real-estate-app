"use client";

import dynamic from "next/dynamic";

// Dynamically import map with SSR disabled
const MapView = dynamic(
  () => import("@/components/map/MapView").then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded-xl bg-mist flex items-center justify-center text-muted-foreground text-sm animate-pulse">
        Loading map…
      </div>
    ),
  }
);

type MapPlaceholderProps = {
  lat: number;
  lng: number;
  title: string;
  listingId: string;
};

export function MapPlaceholder({ lat, lng, title, listingId }: MapPlaceholderProps) {
  return (
    <div className="mt-4">
      <MapView
        mode="single"
        lat={lat}
        lng={lng}
        title={title}
        listingId={listingId}
      />
    </div>
  );
}
