"use client";

import { useState } from "react";
import { LayoutGrid, Map } from "lucide-react";
import dynamic from "next/dynamic";
import { ListingCard } from "@/components/public/ListingCard";
import type { IListing } from "@/models/Listing";
import type { MultiListing } from "@/components/public/MapView";

const MapView = dynamic(
  () => import("@/components/public/MapView").then((m) => ({ default: m.MapView })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[520px] rounded-2xl bg-mist animate-pulse flex items-center justify-center text-muted-foreground text-sm">
        Loading map…
      </div>
    ),
  }
);

type Props = {
  listings: IListing[];
};

export function SearchResultsView({ listings }: Props) {
  const [view, setView] = useState<"list" | "map">("list");
  const [hoveredId, setHoveredId] = useState<string | undefined>();

  const geoListings: MultiListing[] = listings
    .filter(
      (l) =>
        l.geo?.coordinates?.[0] !== undefined &&
        l.geo?.coordinates?.[1] !== undefined &&
        l.geo.coordinates[0] !== 0 &&
        l.geo.coordinates[1] !== 0
    )
    .map((l) => ({
      _id: (l._id as unknown as string) ?? "",
      slug: l.slug,
      title: l.title,
      askingPrice: l.askingPrice,
      monthlyRent: l.monthlyRent,
      type: l.type,
      lat: l.geo!.coordinates[1],
      lng: l.geo!.coordinates[0],
    }));

  return (
    <div>
      {/* View toggle */}
      <div className="flex items-center gap-1 p-0.5 bg-mist rounded-xl border border-border w-fit mb-5">
        <button
          onClick={() => setView("list")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-xs font-semibold transition-all ${
            view === "list"
              ? "bg-cream shadow-sm text-ink"
              : "text-muted-foreground hover:text-ink"
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          List
        </button>
        <button
          onClick={() => setView("map")}
          disabled={geoListings.length === 0}
          title={geoListings.length === 0 ? "No geo-tagged listings in results" : undefined}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-xs font-semibold transition-all ${
            view === "map"
              ? "bg-cream shadow-sm text-ink"
              : "text-muted-foreground hover:text-ink"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <Map className="w-3.5 h-3.5" />
          Map
          {geoListings.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-brand/10 text-emerald-brand font-bold">
              {geoListings.length}
            </span>
          )}
        </button>
      </div>

      {view === "list" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {listings.map((listing) => (
            <div
              key={(listing._id as unknown as string) ?? listing.slug}
              onMouseEnter={() => setHoveredId((listing._id as unknown as string) ?? "")}
              onMouseLeave={() => setHoveredId(undefined)}
            >
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
          <MapView
            mode="multi"
            listings={geoListings}
            highlightedId={hoveredId}
          />
          {geoListings.length < listings.length && (
            <p className="text-xs text-muted-foreground text-center px-4 py-2 bg-mist border-t border-border">
              {listings.length - geoListings.length} listing
              {listings.length - geoListings.length !== 1 ? "s" : ""} without coordinates not shown on map.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
