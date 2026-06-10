"use client";

import { useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { formatINR } from "@/lib/format";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CARTO_VOYAGER = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const CARTO_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

function makeMarker(highlighted = false) {
  const color = highlighted ? "#C25B3B" : "#2D6A4F";
  const scale = highlighted ? "1.25" : "1";
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36" style="transform:scale(${scale});transform-origin:bottom center">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.627 0 12 0z"
            fill="${color}" stroke="white" stroke-width="1.5" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.25))"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`,
    className: "",
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -40],
  });
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap() as LeafletMap;
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

function MapMoveHandler({ onMoveEnd }: { onMoveEnd?: (bounds: L.LatLngBounds) => void }) {
  useMapEvents({
    moveend(e) {
      onMoveEnd?.(e.target.getBounds());
    },
  });
  return null;
}

// ── Single marker mode ────────────────────────────────────────
type SingleMapProps = {
  mode: "single";
  lat: number;
  lng: number;
  title: string;
  listingId?: string;
};

// ── Multi marker mode ─────────────────────────────────────────
export type MultiListing = {
  _id: string;
  slug: string;
  title: string;
  askingPrice: number;
  monthlyRent?: number;
  type?: string;
  lat: number;
  lng: number;
};

type MultiMapProps = {
  mode: "multi";
  listings: MultiListing[];
  highlightedId?: string;
  onMoveEnd?: (bounds: L.LatLngBounds) => void;
};

export type MapViewProps = SingleMapProps | MultiMapProps;

export function MapView(props: MapViewProps) {
  if (props.mode === "single") {
    return (
      <MapContainer
        center={[props.lat, props.lng]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: "360px", borderRadius: "14px", zIndex: 0 }}
      >
        <TileLayer url={CARTO_VOYAGER} attribution={CARTO_ATTR} />
        <RecenterMap lat={props.lat} lng={props.lng} />
        <Marker position={[props.lat, props.lng]} icon={makeMarker()}>
          <Popup>
            <div className="text-sm font-semibold max-w-[180px]">{props.title}</div>
          </Popup>
        </Marker>
      </MapContainer>
    );
  }

  if (props.listings.length === 0) return null;

  const avgLat = props.listings.reduce((s, l) => s + l.lat, 0) / props.listings.length;
  const avgLng = props.listings.reduce((s, l) => s + l.lng, 0) / props.listings.length;
  const center: [number, number] = [avgLat, avgLng];
  const isRentOrLease = (t?: string) => t === "RENT" || t === "LEASE";

  return (
    <MapContainer
      center={center}
      zoom={props.listings.length === 1 ? 14 : 9}
      scrollWheelZoom={true}
      style={{ height: "520px", borderRadius: "14px", zIndex: 0 }}
    >
      <TileLayer url={CARTO_VOYAGER} attribution={CARTO_ATTR} />
      {props.onMoveEnd && <MapMoveHandler onMoveEnd={props.onMoveEnd} />}
      {props.listings.map((listing) => (
        <Marker
          key={listing._id}
          position={[listing.lat, listing.lng]}
          icon={makeMarker(listing._id === props.highlightedId)}
        >
          <Popup>
            <div className="min-w-[160px]">
              <div className="text-sm font-semibold text-forest leading-snug mb-1.5 max-w-[200px]">
                {listing.title}
              </div>
              <div className="text-base font-bold text-emerald-brand mb-3">
                {isRentOrLease(listing.type) && listing.monthlyRent
                  ? `${formatINR(listing.monthlyRent)}/mo`
                  : listing.askingPrice > 0
                  ? formatINR(listing.askingPrice)
                  : "Price on request"}
              </div>
              <a
                href={`/listing/${listing.slug}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-brand hover:underline"
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
