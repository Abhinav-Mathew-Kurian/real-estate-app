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

export function PropertySection({ lat, lng, title, landmarks, village, taluk, district, address }: Props) {
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);

  return (
    <>
      {/* Location card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
        <h2 className="font-display text-xl font-bold text-forest mb-4">Location</h2>

        {/* Clean location info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          <div className="bg-mist rounded-xl p-3">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Village</div>
            <div className="text-sm font-semibold text-ink">{village}</div>
          </div>
          <div className="bg-mist rounded-xl p-3">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Taluk</div>
            <div className="text-sm font-semibold text-ink">{taluk}</div>
          </div>
          <div className="bg-mist rounded-xl p-3">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">District</div>
            <div className="text-sm font-semibold text-ink">{district}</div>
          </div>
          {address && (
            <div className="bg-mist rounded-xl p-3 col-span-2 sm:col-span-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Address</div>
              <div className="text-sm font-semibold text-ink">{address}</div>
            </div>
          )}
        </div>

        <PropertyMap lat={lat} lng={lng} title={title} selectedPlace={selectedPlace} />
      </div>

      {/* Nearby places card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
        <h2 className="font-display text-xl font-bold text-forest mb-4">Nearby Places</h2>
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
