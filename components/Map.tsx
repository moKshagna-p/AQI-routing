'use client';

import L from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { Layers, Loader2 } from 'lucide-react';
import { AQI_TIERS, getAQIColor } from '@/lib/aqiUtils';
import { type RouteVariant } from '@/lib/routeUtils';
import { Button } from '@/components/ui/button';

const sourceIcon = L.divIcon({
  html: `<div style="width:14px;height:14px;border-radius:999px;background:#0ea5e9;border:2px solid white;box-shadow:0 0 0 4px rgba(14,165,233,.25)"></div>`,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const destIcon = L.divIcon({
  html: `<div style="width:14px;height:14px;border-radius:999px;background:#22c55e;border:2px solid white;box-shadow:0 0 0 4px rgba(34,197,94,.25)"></div>`,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

/* ── Static AQI Legend (hoisted outside component per rendering-hoist-jsx) ── */
const AQILegend = (
  <div className="absolute bottom-5 right-5 z-[1000] rounded-lg border border-white/15 bg-black/80 p-2.5 backdrop-blur-sm">
    <div className="mb-1.5 text-[9px] uppercase tracking-widest text-white/50">AQI Scale</div>
    <div className="flex flex-col gap-1">
      {AQI_TIERS.map((tier, i) => {
        const prevMax = i > 0 ? AQI_TIERS[i - 1].max + 1 : 0;
        return (
          <div key={tier.label} className="flex items-center gap-2 text-[10px] text-white/70">
            <span
              className="inline-block h-2.5 w-5 rounded-sm"
              style={{ backgroundColor: tier.color }}
            />
            <span className="number-display">{prevMax}-{tier.max}</span>
          </div>
        );
      })}
    </div>
  </div>
);

type MapProps = {
  source: [number, number];
  destination: [number, number];
  routes: RouteVariant[];
  selectedRouteId: string | null;
  mapCoordinates: [number, number][];
  loading: boolean;
};

function FitToBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length < 2) return;
    const bounds = L.latLngBounds(points.map((point) => [point[0], point[1]]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [map, points]);

  return null;
}

export default function Map({ source, destination, routes, selectedRouteId, mapCoordinates, loading }: MapProps) {
  const [showHeatmap, setShowHeatmap] = useState(true);

  const selectedRoute = useMemo(
    () => routes.find((route) => route.id === selectedRouteId) ?? routes[0],
    [routes, selectedRouteId]
  );

  const fitPoints = useMemo(() => {
    const base = selectedRoute?.geometry?.length ? selectedRoute.geometry : mapCoordinates;
    return [source, destination, ...base];
  }, [source, destination, selectedRoute, mapCoordinates]);

  const selectedSegments = useMemo(() => {
    if (!selectedRoute?.geometry.length || !selectedRoute.geometryAQI.length) return [];

    return selectedRoute.geometry.slice(0, -1).map((point, idx) => {
      const next = selectedRoute.geometry[idx + 1];
      const aqiA = selectedRoute.geometryAQI[idx] ?? selectedRoute.avgAQI;
      const aqiB = selectedRoute.geometryAQI[idx + 1] ?? aqiA;
      return {
        positions: [
          [point[0], point[1]],
          [next[0], next[1]]
        ] as [number, number][],
        color: getAQIColor((aqiA + aqiB) / 2)
      };
    });
  }, [selectedRoute]);

  return (
    <div className="relative h-screen w-full">
      <MapContainer center={source} zoom={11} className="h-full w-full" zoomControl={false}>
        <FitToBounds points={fitPoints} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <Marker position={source} icon={sourceIcon}>
          <Popup>Origin</Popup>
        </Marker>

        <Marker position={destination} icon={destIcon}>
          <Popup>Destination</Popup>
        </Marker>

        {routes
          .filter((route) => route.id !== selectedRoute?.id)
          .map((route) => (
            <Polyline
              key={route.id}
              positions={route.geometry}
              pathOptions={{ color: '#6b7280', weight: 5, opacity: 0.55 }}
            />
          ))}

        {selectedRoute?.geometry?.length ? (
          <>
            <Polyline
              positions={selectedRoute.geometry}
              pathOptions={{ color: '#111827', weight: 14, opacity: 0.92, lineCap: 'round', lineJoin: 'round' }}
            />
            <Polyline
              positions={selectedRoute.geometry}
              pathOptions={{ color: '#ffffff', weight: 10, opacity: 0.75, lineCap: 'round', lineJoin: 'round' }}
            />
          </>
        ) : null}

        {selectedSegments.map((segment, idx) => (
          <Polyline
            key={`segment-${idx}`}
            positions={segment.positions}
            pathOptions={{ color: segment.color, weight: 7, opacity: 0.96, lineCap: 'round', lineJoin: 'round' }}
            className="route-stroke"
          />
        ))}

        {showHeatmap &&
          selectedRoute?.waypoints.map((point, index) => (
            <CircleMarker
              key={`${point.lat}-${point.lng}-${index}`}
              center={[point.lat, point.lng]}
              radius={10}
              pathOptions={{
                color: getAQIColor(point.aqi),
                fillColor: getAQIColor(point.aqi),
                fillOpacity: 0.2,
                weight: 0.8
              }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                AQI {point.aqi}
              </Tooltip>
            </CircleMarker>
          ))}
      </MapContainer>

      {/* Controls row */}
      <div className="absolute bottom-5 left-5 z-[1000] flex rounded-lg border border-white/20 bg-black/70 p-1 backdrop-blur">
        <Button variant={showHeatmap ? 'secondary' : 'ghost'} size="sm" onClick={() => setShowHeatmap(true)}>
          <Layers className="mr-1 h-3.5 w-3.5" /> AQI Overlay
        </Button>
        <Button variant={!showHeatmap ? 'secondary' : 'ghost'} size="sm" onClick={() => setShowHeatmap(false)}>
          Clean Route View
        </Button>
      </div>

      {/* AQI Legend */}
      {showHeatmap && routes.length > 0 && AQILegend}

      {loading ? (
        <div className="absolute inset-0 z-[1100] grid place-items-center bg-black/65 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-black/80 px-4 py-3 text-sm text-white">
            <Loader2 className="h-4 w-4 animate-spin" />
            Computing AQI-aware routes...
          </div>
        </div>
      ) : null}
    </div>
  );
}
