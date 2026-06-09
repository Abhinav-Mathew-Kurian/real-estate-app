"use client";

import { useState } from "react";
import { PropertyMap } from "./PropertyMap";
import { NearbyPlaces } from "./NearbyPlaces";
import type { SelectedPlace } from "./PropertyMapInner";

type Props = {
  lat: number;
  lng: number;
  title: string;
  listingId: string;
  landmarks: string[];
  village: string;
  taluk: string;
  district: string;
  address?: string;
};

export function PropertySection({
  lat,
  lng,
  title,
  landmarks,
  village,
  taluk,
  district,
  address,
}: Props) {
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);

  return (
    <>
      {/* Location card */}
      <div className="bg-cream rounded-2xl border border-border p-6">
        <h2 className="font-display text-xl font-semibold text-forest mb-4">Location</h2>
        <div className="space-y-1.5 text-sm text-ink/80 mb-4">
          <p><span className="font-medium text-ink">Village:</span> {village}</p>
          <p><span className="font-medium text-ink">Taluk:</span> {taluk}</p>
          <p><span className="font-medium text-ink">District:</span> {district}</p>
          {address && <p><span className="font-medium text-ink">Address:</span> {address}</p>}
        </div>
        <PropertyMap lat={lat} lng={lng} title={title} selectedPlace={selectedPlace} />
      </div>

      {/* Nearby places card */}
      <div className="bg-cream rounded-2xl border border-border p-6">
        <h2 className="font-display text-xl font-semibold text-forest mb-4">Nearby Places</h2>
        <NearbyPlaces
          lat={lat}
          lng={lng}
          landmarks={landmarks}
          selectedPlace={selectedPlace}
          onSelectPlace={setSelectedPlace}
        />
      </div>
    </>
  );
}
