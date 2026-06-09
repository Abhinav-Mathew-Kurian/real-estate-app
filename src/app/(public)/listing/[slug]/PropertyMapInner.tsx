"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Navigation, Loader2, AlertCircle, X } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function makeIcon(color: string) {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.627 0 12 0z"
            fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`,
    className: "",
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });
}

const PROPERTY_ICON = makeIcon("#2D6A4F");
const USER_ICON = makeIcon("#2563EB");

function FitBounds({
  coords,
}: {
  coords: [[number, number], [number, number]] | null;
}) {
  const map = useMap() as LeafletMap;
  const fitted = useRef(false);

  useEffect(() => {
    if (!coords || fitted.current) return;
    map.fitBounds(coords, { padding: [50, 50] });
    fitted.current = true;
  }, [coords, map]);

  useEffect(() => {
    if (!coords) fitted.current = false;
  }, [coords]);

  return null;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.ceil((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function formatDist(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

type Props = {
  lat: number;
  lng: number;
  title: string;
};

export function PropertyMapInner({ lat, lng, title }: Props) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearRoute = useCallback(() => {
    setRoute(null);
    setRouteInfo(null);
    setUserPos(null);
    setError(null);
  }, []);

  const getDirections = useCallback(async () => {
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        setUserPos([uLat, uLng]);

        try {
          const url =
            `https://router.project-osrm.org/route/v1/driving/` +
            `${uLng},${uLat};${lng},${lat}?overview=full&geometries=geojson`;

          const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
          const json = await res.json();

          if (json.code !== "Ok" || !json.routes?.[0]) {
            setError("Could not find a route. Please try again.");
            setLoading(false);
            return;
          }

          const r = json.routes[0];
          const coords: [number, number][] = r.geometry.coordinates.map(
            ([lo, la]: [number, number]) => [la, lo]
          );
          setRoute(coords);
          setRouteInfo({ distance: r.distance, duration: r.duration });
        } catch {
          setError("Routing service unavailable. Please try again later.");
        }

        setLoading(false);
      },
      (err) => {
        if (err.code === 1) {
          setError("Location access denied. Enable location permissions and retry.");
        } else {
          setError("Could not determine your location.");
        }
        setLoading(false);
      },
      { timeout: 10_000, maximumAge: 30_000 }
    );
  }, [lat, lng]);

  const fitBoundsCoords: [[number, number], [number, number]] | null =
    userPos ? [[lat, lng], userPos] : null;

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {!route ? (
          <button
            onClick={getDirections}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-brand text-cream text-sm font-medium hover:bg-emerald-brand/90 disabled:opacity-60 transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            {loading ? "Getting route…" : "Get Directions"}
          </button>
        ) : (
          <button
            onClick={clearRoute}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-ink hover:bg-mist transition-colors"
          >
            <X className="w-4 h-4" />
            Clear route
          </button>
        )}

        {routeInfo && (
          <div className="flex items-center gap-3 text-sm">
            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-medium">
              {formatDist(routeInfo.distance)}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-brand/10 text-emerald-brand font-medium">
              ~{formatDuration(routeInfo.duration)} drive
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: "360px", borderRadius: "14px", zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Property marker */}
        <Marker position={[lat, lng]} icon={PROPERTY_ICON}>
          <Popup>
            <div className="text-sm font-semibold max-w-[180px]">{title}</div>
          </Popup>
        </Marker>

        {/* User location marker */}
        {userPos && (
          <Marker position={userPos} icon={USER_ICON}>
            <Popup>
              <div className="text-sm">Your location</div>
            </Popup>
          </Marker>
        )}

        {/* Route line */}
        {route && (
          <Polyline
            positions={route}
            pathOptions={{ color: "#2563EB", weight: 4, opacity: 0.85, dashArray: undefined }}
          />
        )}

        {fitBoundsCoords && <FitBounds coords={fitBoundsCoords} />}
      </MapContainer>

      <p className="text-xs text-muted-foreground">
        Routing via OSRM &middot; Map data &copy; OpenStreetMap contributors
      </p>
    </div>
  );
}
