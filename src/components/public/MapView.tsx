"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { formatINR } from "@/lib/format";

// Fix default Leaflet icon issue with webpack
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom green brand marker
function createGreenMarker(highlighted = false) {
  const color = highlighted ? "#B5651D" : "#2D6A4F";
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.627 0 12 0z" fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`,
    className: "leaflet-brand-marker",
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });
}

// Re-center map helper
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap() as LeafletMap;
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

// ── Single marker mode ────────────────────────────────────────
type SingleMapProps = {
  mode: "single";
  lat: number;
  lng: number;
  title: string;
  listingId: string;
};

// ── Multi marker mode ─────────────────────────────────────────
type MultiListing = {
  _id: string;
  slug: string;
  title: string;
  askingPrice: number;
  lat: number;
  lng: number;
};

type MultiMapProps = {
  mode: "multi";
  listings: MultiListing[];
  highlightedId?: string;
};

export type MapViewProps = SingleMapProps | MultiMapProps;

export function MapView(props: MapViewProps) {
  if (props.mode === "single") {
    return (
      <MapContainer
        center={[props.lat, props.lng]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: "280px", borderRadius: "12px", zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <RecenterMap lat={props.lat} lng={props.lng} />
        <Marker position={[props.lat, props.lng]} icon={createGreenMarker()}>
          <Popup>
            <div className="text-sm font-semibold">{props.title}</div>
          </Popup>
        </Marker>
      </MapContainer>
    );
  }

  // Multi mode
  if (props.listings.length === 0) return null;

  const center: [number, number] = [
    props.listings[0].lat,
    props.listings[0].lng,
  ];

  return (
    <MapContainer
      center={center}
      zoom={10}
      scrollWheelZoom={false}
      style={{ height: "480px", borderRadius: "12px", zIndex: 0 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {props.listings.map((listing) => (
        <Marker
          key={listing._id}
          position={[listing.lat, listing.lng]}
          icon={createGreenMarker(listing._id === props.highlightedId)}
        >
          <Popup>
            <div>
              <div className="text-sm font-semibold text-forest mb-1 max-w-[180px]">
                {listing.title}
              </div>
              <div className="text-sm font-bold text-emerald-brand mb-2">
                {formatINR(listing.askingPrice)}
              </div>
              <a
                href={`/listing/${listing.slug}`}
                className="text-xs text-emerald-brand hover:underline"
              >
                View details →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
