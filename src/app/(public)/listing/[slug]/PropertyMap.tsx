"use client";

import dynamic from "next/dynamic";

const PropertyMapInner = dynamic(
  () => import("./PropertyMapInner").then((m) => ({ default: m.PropertyMapInner })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[320px] rounded-xl bg-mist animate-pulse flex items-center justify-center text-muted-foreground text-sm">
        Loading map…
      </div>
    ),
  }
);

type Props = {
  lat: number;
  lng: number;
  title: string;
  listingId: string;
};

export function PropertyMap({ lat, lng, title }: Props) {
  return <PropertyMapInner lat={lat} lng={lng} title={title} />;
}
