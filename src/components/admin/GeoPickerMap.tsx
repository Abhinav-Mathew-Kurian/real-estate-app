"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const PIN_ICON = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.627 0 12 0z"
          fill="#2D6A4F" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5" fill="white"/>
  </svg>`,
  className: "",
  iconSize: [28, 42],
  iconAnchor: [14, 42],
  popupAnchor: [0, -42],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const prev = useRef<[number, number] | null>(null);
  useEffect(() => {
    const same = prev.current?.[0] === lat && prev.current?.[1] === lng;
    if (!same) {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 14), { duration: 0.8 });
      prev.current = [lat, lng];
    }
  }, [lat, lng, map]);
  return null;
}

type Props = {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
};

const DEFAULT_CENTER: [number, number] = [10.5276, 76.2144]; // Kerala center

export function GeoPickerMap({ lat, lng, onPick }: Props) {
  const hasPin = lat !== null && lng !== null && lat !== 0 && lng !== 0;
  const center: [number, number] = hasPin ? [lat!, lng!] : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={hasPin ? 14 : 8}
      scrollWheelZoom={true}
      style={{ height: "260px", borderRadius: "12px", zIndex: 0, cursor: "crosshair" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
      />
      <ClickHandler onPick={onPick} />
      {hasPin && (
        <>
          <Marker position={[lat!, lng!]} icon={PIN_ICON} />
          <FlyTo lat={lat!} lng={lng!} />
        </>
      )}
    </MapContainer>
  );
}
