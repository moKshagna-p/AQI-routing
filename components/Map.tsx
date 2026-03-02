'use client';

import L from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { getAQIColor } from '@/lib/aqiUtils';
import { type RouteVariant } from '@/lib/routeUtils';

const sourceIcon = L.divIcon({
  html: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" fill="#000000" stroke="#FFFFFF" stroke-width="1.5" opacity="0.9"/>
    <circle cx="16" cy="16" r="5" fill="#FFFFFF"/>
    <circle cx="16" cy="16" r="8" stroke="#FFFFFF" stroke-width="0.5" opacity="0.3"/>
  </svg>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const destIcon = L.divIcon({
  html: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" fill="#000000" stroke="#FFFFFF" stroke-width="1.5" opacity="0.9"/>
    <circle cx="16" cy="16" r="5" fill="#FFFFFF"/>
    <circle cx="16" cy="16" r="8" stroke="#FFFFFF" stroke-width="0.5" opacity="0.3"/>
  </svg>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

type MapProps = {
  source: [number, number];
  destination: [number, number];
  routes: RouteVariant[];
  selectedRouteId: string | null;
  mapCoordinates: [number, number][];
  loading: boolean;
};

export default function Map({ source, destination, routes, selectedRouteId, mapCoordinates, loading }: MapProps) {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [drawCount, setDrawCount] = useState(0);

  const selectedRoute = useMemo(
    () => routes.find((route) => route.id === selectedRouteId) ?? routes[0],
    [routes, selectedRouteId]
  );

  useEffect(() => {
    if (!mapCoordinates.length) return;
    setDrawCount(2);
    const timer = setInterval(() => {
      setDrawCount((prev) => {
        if (prev >= mapCoordinates.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 2;
      });
    }, 14);

    return () => clearInterval(timer);
  }, [mapCoordinates]);

  const drawn = mapCoordinates.slice(0, drawCount);

  const routeGradientSegments = useMemo(() => {
    if (!selectedRoute?.waypoints.length) return [];
    return selectedRoute.waypoints.slice(0, -1).map((point, idx) => {
      const next = selectedRoute.waypoints[idx + 1];
      const avgAQI = (point.aqi + next.aqi) / 2;
      return {
        positions: [
          [point.lat, point.lng],
          [next.lat, next.lng],
        ] as [number, number][],
        color: getAQIColor(avgAQI),
      };
    });
  }, [selectedRoute]);

  return (
    <div className="relative h-screen w-full">
      <MapContainer center={source} zoom={11} className="h-full w-full" zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={source} icon={sourceIcon}>
          <Popup>
            <span style={{ color: '#ffffff', fontWeight: 600, fontSize: 12 }}>Origin</span>
          </Popup>
        </Marker>
        <Marker position={destination} icon={destIcon}>
          <Popup>
            <span style={{ color: '#ffffff', fontWeight: 600, fontSize: 12 }}>Destination</span>
          </Popup>
        </Marker>

        {drawn.length > 1 && (
          <Polyline
            positions={drawn}
            pathOptions={{ color: '#ffffff', weight: 3, opacity: 0.15 }}
            className="route-stroke"
          />
        )}

        {routeGradientSegments.map((segment, idx) => (
          <Polyline
            key={`segment-${idx}`}
            positions={segment.positions}
            pathOptions={{ color: segment.color, weight: 6, opacity: 0.9 }}
            className="route-stroke"
          />
        ))}

        {selectedRoute?.waypoints.map((point, index) => (
          <CircleMarker
            key={`${point.lat}-${point.lng}-${index}`}
            center={[point.lat, point.lng]}
            radius={showHeatmap ? 18 : 6}
            pathOptions={{
              color: getAQIColor(point.aqi),
              fillColor: getAQIColor(point.aqi),
              fillOpacity: showHeatmap ? 0.2 : 0.8,
              weight: showHeatmap ? 0.5 : 2,
            }}
          >
            <Tooltip direction="top" offset={[0, -10]}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>AQI {point.aqi}</span>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Ambient map overlay */}
      <div className="pointer-events-none absolute inset-0 z-[900]">
        {/* Edge vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)]" />
      </div>

      {/* Heatmap toggle */}
      <div className="glass absolute bottom-5 left-5 z-[1000] flex items-center gap-1 rounded-full p-1">
        {[
          { active: showHeatmap, label: 'Heatmap', onClick: () => setShowHeatmap(true) },
          { active: !showHeatmap, label: 'Points', onClick: () => setShowHeatmap(false) },
        ].map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={btn.onClick}
            className={`rounded-full px-4 py-1.5 text-[11px] font-medium transition-all duration-300 ${
              btn.active
                ? 'bg-white/15 text-white shadow-[0_0_12px_rgba(255,255,255,0.08)]'
                : 'text-white/40 hover:bg-white/5 hover:text-white/70'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Selected route info */}
      <AnimatePresence>
        {selectedRoute && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="glass absolute right-4 top-20 z-[1000] rounded-xl px-4 py-3 sm:right-6 sm:top-24"
          >
            <div className="mb-1 text-[9px] uppercase tracking-[0.2em] text-white/30">Active Route</div>
            <div className="heading-font text-sm font-semibold text-white">{selectedRoute.label}</div>
            <div className="number-display mt-0.5 text-xs font-black" style={{ color: getAQIColor(selectedRoute.avgAQI) }}>
              AQI {selectedRoute.avgAQI}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-[1100] grid place-items-center bg-black/60 backdrop-blur-md"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-12 w-12 rounded-2xl border border-white/20 bg-white/5" />
                <div className="absolute inset-0 animate-pulse-ring rounded-2xl border border-white/40" />
              </div>
              <span className="mono-font text-[12px] uppercase tracking-[0.2em] text-white/50">Analyzing Air Corridor</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
