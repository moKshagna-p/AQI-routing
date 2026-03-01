import axios from 'axios';
import { aqiBreakdownFromAverage, clampAQI } from './aqiUtils';
import { type Waypoint } from './mockData';

export type TransportMode = 'walk' | 'bike' | 'car';

export type RouteVariantLabel = 'Cleanest' | 'Fastest' | 'Balanced';

export type RouteVariant = {
  id: string;
  label: RouteVariantLabel;
  distanceKm: number;
  etaMin: number;
  avgAQI: number;
  exposureScore: string;
  score: number;
  waypoints: Waypoint[];
  breakdown: {
    pm25: number;
    pm10: number;
    o3: number;
  };
};

const speedByMode: Record<TransportMode, number> = {
  walk: 5,
  bike: 18,
  car: 38
};

type OSRMRoute = {
  routes: Array<{
    distance: number;
    geometry: {
      coordinates: [number, number][];
    };
  }>;
};

async function fetchBaseRoute(
  source: [number, number],
  destination: [number, number],
  transportMode: TransportMode
): Promise<{ distanceKm: number; coordinates: [number, number][] }> {
  const profile = transportMode === 'car' ? 'driving' : transportMode === 'bike' ? 'cycling' : 'walking';
  const url = `https://router.project-osrm.org/route/v1/${profile}/${source[1]},${source[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`;

  try {
    const { data } = await axios.get<OSRMRoute>(url, { timeout: 4000 });
    const route = data.routes?.[0];
    if (!route) throw new Error('Missing route');
    return {
      distanceKm: route.distance / 1000,
      coordinates: route.geometry.coordinates.map(([lng, lat]) => [lat, lng])
    };
  } catch {
    const fallbackDistance = haversineKm(source, destination) * 1.2;
    return {
      distanceKm: fallbackDistance,
      coordinates: [source, midpoint(source, destination), destination]
    };
  }
}

function haversineKm([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function midpoint([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]): [number, number] {
  return [(lat1 + lat2) / 2, (lng1 + lng2) / 2];
}

function average(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0) / Math.max(values.length, 1);
}

function normalizeDist(distance: number, maxDistance: number): number {
  return maxDistance === 0 ? 0 : distance / maxDistance;
}

// Score a route based on distance and AQI exposure.
export function scoreRoute(
  distance: number,
  maxDistance: number,
  waypoints: Waypoint[],
  userPreference: number
): number {
  const avgAQI = average(waypoints.map((w) => w.aqi));
  const normalizedAQI = avgAQI / 500;
  const normalizedDist = normalizeDist(distance, maxDistance);
  return userPreference * normalizedAQI + (1 - userPreference) * normalizedDist;
}

function synthesizeWaypoints(base: [number, number][], aqiOffset: number): Waypoint[] {
  if (!base.length) return [];
  const stride = Math.max(1, Math.floor(base.length / 6));
  const seed = [43, 58, 76, 63, 49, 54, 88, 71];

  return base.filter((_, idx) => idx % stride === 0).slice(0, 8).map(([lat, lng], idx) => {
    const raw = seed[idx % seed.length] + aqiOffset;
    return { lat, lng, aqi: clampAQI(raw) };
  });
}

export async function generateRouteVariants(params: {
  source: [number, number];
  destination: [number, number];
  transportMode: TransportMode;
  userPreference: number;
}): Promise<{ routes: RouteVariant[]; coordinates: [number, number][] }> {
  const { source, destination, transportMode, userPreference } = params;
  const base = await fetchBaseRoute(source, destination, transportMode);
  const baseDistance = base.distanceKm;

  const variants = [
    {
      id: 'cleanest',
      label: 'Cleanest' as const,
      distanceKm: baseDistance * 1.14,
      waypoints: synthesizeWaypoints(base.coordinates, -18)
    },
    {
      id: 'fastest',
      label: 'Fastest' as const,
      distanceKm: baseDistance,
      waypoints: synthesizeWaypoints(base.coordinates, 12)
    },
    {
      id: 'balanced',
      label: 'Balanced' as const,
      distanceKm: baseDistance * 1.06,
      waypoints: synthesizeWaypoints(base.coordinates, -2)
    }
  ];

  const maxDistance = Math.max(...variants.map((v) => v.distanceKm));
  const speed = speedByMode[transportMode];

  const routes = variants
    .map((variant) => {
      const avgAQI = average(variant.waypoints.map((w) => w.aqi));
      const etaMin = Math.max(1, Math.round((variant.distanceKm / speed) * 60));
      const score = scoreRoute(variant.distanceKm, maxDistance, variant.waypoints, userPreference);
      return {
        ...variant,
        avgAQI: clampAQI(avgAQI),
        etaMin,
        score,
        exposureScore: `${Math.max(0.1, avgAQI / 28).toFixed(1)} cig eq/day`,
        breakdown: aqiBreakdownFromAverage(avgAQI)
      };
    })
    .sort((a, b) => a.score - b.score);

  return { routes, coordinates: base.coordinates };
}
