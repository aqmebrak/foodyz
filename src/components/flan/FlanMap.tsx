"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import Image from "next/image";

import { cn, parseGoogleMapsUrl } from "@/lib/utils";

// Colored div icons: amber for tried, gray for not tried
function makeIcon(tried: boolean) {
  const color = tried ? "#f59e0b" : "#9ca3af";
  const border = tried ? "#d97706" : "#6b7280";
  return L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;background:${color};border:2.5px solid ${border};border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 1px 4px rgba(0,0,0,0.25)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 18],
    popupAnchor: [0, -20],
  });
}

interface Flan {
  id: string;
  name: string;
  location: { name: string; mapsUrl: string };
  photoUrl: string | null;
  rating: number;
  tried: boolean;
  triedAt: Date | null;
  comment: string | null;
}

export interface FlanMapProps {
  flans: Flan[];
}

// Lyon center
const LYON: [number, number] = [45.7640, 4.8357];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={cn("text-sm", s <= rating ? "text-amber-400" : "text-gray-300")}>
          ★
        </span>
      ))}
    </div>
  );
}

export function FlanMap({ flans }: FlanMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const markers = flans
    .map((flan) => {
      const coords = parseGoogleMapsUrl(flan.location.mapsUrl);
      return coords ? { flan, coords } : null;
    })
    .filter(Boolean) as { flan: Flan; coords: [number, number] }[];

  if (!mounted) {
    return (
      <div className="w-full h-full rounded-xl bg-gray-100 animate-pulse flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading map…</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={LYON}
      zoom={13}
      className="w-full h-full rounded-xl z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map(({ flan, coords }) => (
        <Marker key={flan.id} position={coords} icon={makeIcon(flan.tried)}>
          <Popup maxWidth={240} minWidth={180}>
            <div className="space-y-2 py-1">
              {flan.photoUrl && (
                <div className="relative w-full h-32 rounded-md overflow-hidden">
                  <Image
                    src={flan.photoUrl}
                    alt={flan.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 text-sm leading-tight">{flan.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{flan.location.name}</p>
                {!flan.tried && (
                  <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    Not tried yet
                  </span>
                )}
              </div>
              {flan.tried && <StarRow rating={flan.rating} />}
              {flan.comment && (
                <p className="text-xs text-gray-600 italic">{flan.comment}</p>
              )}
              {flan.triedAt && (
                <p className="text-xs text-gray-400">
                  Tried {new Date(flan.triedAt).toLocaleDateString("fr-FR")}
                </p>
              )}
              <a
                href={flan.location.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-600 hover:underline"
              >
                Open in Maps →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
