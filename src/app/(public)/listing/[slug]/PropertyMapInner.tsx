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
import { Navigation, Loader2, AlertCircle, X, LocateFixed, Search } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function makeIcon(color: string, size: [number, number] = [24, 36]) {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="${size[0]}" height="${size[1]}">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.627 0 12 0z"
            fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`,
    className: "",
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, -size[1]],
  });
}

const PROPERTY_ICON = makeIcon("#2D6A4F", [28, 42]);
const FROM_ICON = makeIcon("#2563EB");
const PLACE_ICON = makeIcon("#EA580C");

function FitBounds({ coords }: { coords: [number, number][] | null }) {
  const map = useMap() as LeafletMap;
  const fitted = useRef(false);
  useEffect(() => {
    if (!coords || coords.length < 2 || fitted.current) return;
    map.fitBounds(coords as [[number, number], [number, number]], { padding: [50, 50] });
    fitted.current = true;
  }, [coords, map]);
  useEffect(() => { if (!coords) fitted.current = false; }, [coords]);
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

export type SelectedPlace = {
  lat: number;
  lng: number;
  name: string;
  distanceM: number;
};

type Props = {
  lat: number;
  lng: number;
  title: string;
  selectedPlace?: SelectedPlace | null;
};

export function PropertyMapInner({ lat, lng, title, selectedPlace }: Props) {
  const [fromMode, setFromMode] = useState<"gps" | "address">("gps");
  const [fromQuery, setFromQuery] = useState("");
  const [fromPos, setFromPos] = useState<[number, number] | null>(null);
  const [fromLabel, setFromLabel] = useState<string | null>(null);
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearRoute = useCallback(() => {
    setRoute(null);
    setRouteInfo(null);
    setFromPos(null);
    setFromLabel(null);
    setError(null);
    setFromQuery("");
  }, []);

  async function fetchRoute(fLat: number, fLng: number) {
    try {
      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${fLng},${fLat};${lng},${lat}?overview=full&geometries=geojson`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      const json = await res.json();
      if (json.code !== "Ok" || !json.routes?.[0]) {
        setError("Could not find a route. Please try again.");
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
  }

  const getDirectionsGPS = useCallback(async () => {
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        setFromPos([uLat, uLng]);
        setFromLabel("Your location");
        await fetchRoute(uLat, uLng);
        setLoading(false);
      },
      (err) => {
        setError(
          err.code === 1
            ? "Location access denied. Enable location permissions and retry."
            : "Could not determine your location."
        );
        setLoading(false);
      },
      { timeout: 10_000, maximumAge: 30_000 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  const getDirectionsAddress = useCallback(async () => {
    if (!fromQuery.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(fromQuery + ", Kerala, India")}`);
      const data = await res.json();
      if (!data.result) {
        setError("Address not found. Try a more specific location.");
        setLoading(false);
        return;
      }
      const { lat: fLat, lng: fLng, displayName } = data.result;
      setFromPos([fLat, fLng]);
      setFromLabel(displayName.split(",").slice(0, 2).join(","));
      await fetchRoute(fLat, fLng);
    } catch {
      setError("Geocoding failed. Check your connection.");
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromQuery, lat, lng]);

  const fitCoords: [number, number][] | null = fromPos
    ? [[lat, lng], fromPos]
    : selectedPlace
    ? [[lat, lng], [selectedPlace.lat, selectedPlace.lng]]
    : null;

  return (
    <div className="space-y-3">
      {/* Direction controls card */}
      <div className="rounded-xl border border-border bg-mist/50 p-3 space-y-2.5">
        {/* Mode tabs */}
        <div className="flex items-center gap-1 bg-cream rounded-lg p-0.5 border border-border w-fit">
          <button
            type="button"
            onClick={() => { setFromMode("gps"); clearRoute(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              fromMode === "gps" ? "bg-emerald-brand text-cream shadow-sm" : "text-muted-foreground hover:text-ink"
            }`}
          >
            <LocateFixed className="w-3.5 h-3.5" />
            My Location
          </button>
          <button
            type="button"
            onClick={() => { setFromMode("address"); clearRoute(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              fromMode === "address" ? "bg-emerald-brand text-cream shadow-sm" : "text-muted-foreground hover:text-ink"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Type address
          </button>
        </div>

        {fromMode === "gps" ? (
          !route ? (
            <button
              type="button"
              onClick={getDirectionsGPS}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-brand text-cream text-sm font-medium hover:bg-leaf disabled:opacity-60 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              {loading ? "Getting route…" : "Get Directions from my location"}
            </button>
          ) : (
            <button
              type="button"
              onClick={clearRoute}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-ink hover:bg-cream transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear route
            </button>
          )
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={fromQuery}
              onChange={(e) => setFromQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && getDirectionsAddress()}
              placeholder="e.g. Trivandrum Central Railway Station"
              className="flex-1 text-sm px-3 py-2 rounded-lg border border-border bg-cream focus:outline-none focus:ring-2 focus:ring-emerald-brand/30"
            />
            {!route ? (
              <button
                type="button"
                onClick={getDirectionsAddress}
                disabled={loading || !fromQuery.trim()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-brand text-cream text-sm font-medium hover:bg-leaf disabled:opacity-60 transition-colors shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                {loading ? "Routing…" : "Go"}
              </button>
            ) : (
              <button
                type="button"
                onClick={clearRoute}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-ink hover:bg-mist transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Route info badges */}
        {routeInfo && (
          <div className="flex items-center gap-2 flex-wrap">
            {fromLabel && (
              <span className="text-xs text-muted-foreground">
                From: <span className="font-medium text-ink">{fromLabel}</span>
              </span>
            )}
            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
              {formatDist(routeInfo.distance)}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-brand/10 text-emerald-brand text-xs font-semibold border border-emerald-brand/20">
              ~{formatDuration(routeInfo.duration)} by road
            </span>
          </div>
        )}

        {/* Selected nearby place info */}
        {selectedPlace && !route && (
          <div className="flex items-center gap-2 text-xs bg-orange-50 border border-orange-100 px-3 py-2 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
            <span className="font-medium text-orange-800">{selectedPlace.name}</span>
            <span className="text-orange-600 ml-auto">{formatDist(selectedPlace.distanceM)}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          scrollWheelZoom={false}
          style={{ height: "360px", zIndex: 0 }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {/* Property marker */}
          <Marker position={[lat, lng]} icon={PROPERTY_ICON}>
            <Popup className="font-sans">
              <div className="text-sm font-semibold max-w-[180px] leading-snug">{title}</div>
            </Popup>
          </Marker>

          {/* From location marker (GPS or geocoded) */}
          {fromPos && (
            <Marker position={fromPos} icon={FROM_ICON}>
              <Popup>
                <div className="text-sm">{fromLabel ?? "Starting point"}</div>
              </Popup>
            </Marker>
          )}

          {/* Selected nearby place marker */}
          {selectedPlace && (
            <>
              <Marker position={[selectedPlace.lat, selectedPlace.lng]} icon={PLACE_ICON}>
                <Popup>
                  <div className="text-sm font-medium">{selectedPlace.name}</div>
                  <div className="text-xs text-gray-500">{formatDist(selectedPlace.distanceM)}</div>
                </Popup>
              </Marker>
              <Polyline
                positions={[[lat, lng], [selectedPlace.lat, selectedPlace.lng]]}
                pathOptions={{ color: "#EA580C", weight: 2, opacity: 0.7, dashArray: "6 6" }}
              />
            </>
          )}

          {/* Route polyline */}
          {route && (
            <Polyline
              positions={route}
              pathOptions={{ color: "#2563EB", weight: 4, opacity: 0.85 }}
            />
          )}

          {fitCoords && <FitBounds coords={fitCoords} />}
        </MapContainer>
      </div>
    </div>
  );
}
