"use client";

import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMap,ZoomControl } from "react-leaflet";

import type { FlanItem } from "@/lib/flan-filters";
import { parseGoogleMapsUrl } from "@/lib/utils";

import "leaflet/dist/leaflet.css";

// Lyon center
const LYON: [number, number] = [45.764, 4.8357];
const FOCUS_ZOOM = 16;

// Tried = yolk fill; to-try = white fill with ink outline. Selected = larger, basil ring.
function makeIcon(tried: boolean, selected: boolean) {
  const size = selected ? 26 : 20;
  const fill = tried ? "#F2B630" : "#FFFFFF";
  const border = "#1C2420";
  const ring = selected ? ",0 0 0 3px #2F6B47" : "";
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;background:${fill};border:2.5px solid ${border};border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 1px 4px rgba(0,0,0,0.3)${ring}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
}

export interface FlanMapProps {
  flans: FlanItem[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Pixels at the bottom of the map hidden by a sheet; focused markers are centred above it. */
  bottomInset?: number;
}

function FocusController({
  target,
  bottomInset,
}: {
  target: [number, number] | null;
  bottomInset: number;
}) {
  const map = useMap();
  const lat = target?.[0];
  const lng = target?.[1];

  useEffect(() => {
    if (lat === undefined || lng === undefined) return;
    const zoom = Math.max(map.getZoom(), FOCUS_ZOOM);
    // Shift the centre down so the marker sits in the middle of the visible area.
    const point = map.project([lat, lng], zoom);
    point.y += bottomInset / 2;
    const center = map.unproject(point, zoom);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) map.setView(center, zoom, { animate: false });
    else map.flyTo(center, zoom, { duration: 0.8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-focus only when the target changes
  }, [lat, lng, map]);

  return null;
}

export function FlanMap({ flans, selectedId = null, onSelect, bottomInset = 0 }: FlanMapProps) {
  const markers = useMemo(
    () =>
      flans
        .map((flan) => {
          const coords = parseGoogleMapsUrl(flan.location.mapsUrl);
          return coords ? { flan, coords } : null;
        })
        .filter((m): m is { flan: FlanItem; coords: [number, number] } => m !== null),
    [flans],
  );

  const selected = markers.find((m) => m.flan.id === selectedId);

  return (
    <MapContainer
      center={LYON}
      zoom={13}
      className="h-full w-full max-md:[&_.leaflet-control-zoom]:hidden"
      scrollWheelZoom={true}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="topright" />
      <FocusController target={selected?.coords ?? null} bottomInset={bottomInset} />
      {markers.map(({ flan, coords }) => (
        <Marker
          key={`${flan.id}-${flan.id === selectedId}`}
          position={coords}
          icon={makeIcon(flan.tried, flan.id === selectedId)}
          zIndexOffset={flan.id === selectedId ? 1000 : 0}
          eventHandlers={{ click: () => onSelect?.(flan.id) }}
        />
      ))}
    </MapContainer>
  );
}
