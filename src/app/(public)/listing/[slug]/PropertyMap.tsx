"use client";

import dynamic from "next/dynamic";
import type { SelectedPlace } from "./PropertyMapInner";

const PropertyMapInner = dynamic(
  () => import("./PropertyMapInner").then((m) => ({ default: m.PropertyMapInner })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[360px] rounded-2xl bg-mist animate-pulse flex items-center justify-center text-muted-foreground text-sm">
        Loading map…
      </div>
    ),
  }
);

type Props = {
  lat: number;
  lng: number;
  title: string;
  selectedPlace?: SelectedPlace | null;
};

export function PropertyMap({ lat, lng, title, selectedPlace }: Props) {
  return <PropertyMapInner lat={lat} lng={lng} title={title} selectedPlace={selectedPlace} />;
}
