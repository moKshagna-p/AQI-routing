import axios from 'axios';
import { clampAQI, toExposureScore, adjustedAQI, computeRespiratoryDose, type SensitivityProfile } from './aqiUtils';

export type TransportMode = 'walk' | 'bike' | 'car';
export type RouteVariantLabel = 'Cleanest' | 'Fastest' | 'Balanced';

export type Waypoint = {
  lat: number;
  lng: number;
  aqi: number;
};

export type RouteVariant = {
  id: string;
  label: RouteVariantLabel;
  distanceKm: number;
  etaMin: number;
  avgAQI: number;
  adjustedAvgAQI: number;
  exposureScore: string;
  score: number;
  waypoints: Waypoint[];
  geometry: [number, number][];
  geometryAQI: number[];
  breakdown: {
    pm25: number;
    pm10: number;
    o3: number;
  };
  respiratoryDose: {
    doseUg: number;
    modeLabel: string;
    ventilationRate: number;
    comparisonToCar: number;
  };
};

type ProviderRoute = {
  distanceKm: number;
  durationMin: number;
  coordinates: [number, number][];
};

type OSRMResponse = {
  code?: string;
  message?: string;
  routes: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: [number, number][];
    };
  }>;
};

type OpenMeteoAQIResponse = {
  hourly: {
    us_aqi: Array<number | null>;
    pm2_5: Array<number | null>;
    pm10: Array<number | null>;
    ozone: Array<number | null>;
  };
};

const profileByMode: Record<TransportMode, string> = {
  walk: 'walking',
  bike: 'cycling',
  car: 'driving'
};

const modeSpeedKmh: Record<TransportMode, number> = {
  walk: 5,
  bike: 18,
  car: 42
};

const aqiCache = new Map<string, { aqi: number; pm25: number; pm10: number; o3: number }>();

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalize(value: number, max: number): number {
  return max <= 0 ? 0 : value / max;
}

function toLatLngCoordinates(coords: [number, number][]): [number, number][] {
  return coords.map(([lng, lat]) => [lat, lng]);
}

function coordinateKey([lat, lng]: [number, number]) {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

function safeNumber(value: number | null | undefined, fallback = 0): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return value;
}

function syntheticAQI([lat, lng]: [number, number]) {
  const drift = Math.abs(Math.sin(lat * 0.18) + Math.cos(lng * 0.11));
  const aqi = clampAQI(38 + drift * 42);
  return {
    aqi,
    pm25: clampAQI(aqi * 0.9),
    pm10: clampAQI(aqi * 0.75),
    o3: clampAQI(aqi * 0.58)
  };
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

function createFallbackRoute(source: [number, number], destination: [number, number], transportMode: TransportMode): ProviderRoute {
  const distanceKm = Math.max(0.5, haversineKm(source, destination) * 1.22);
  const durationMin = Math.max(1, Math.round((distanceKm / modeSpeedKmh[transportMode]) * 60));
  const mid: [number, number] = [(source[0] + destination[0]) / 2 + 0.01, (source[1] + destination[1]) / 2 - 0.01];

  return {
    distanceKm,
    durationMin,
    coordinates: [source, mid, destination]
  };
}

function pickSampleIndexes(totalPoints: number, maxSamples = 36): number[] {
  if (totalPoints <= 1) return [0];
  if (totalPoints <= maxSamples) return Array.from({ length: totalPoints }, (_, idx) => idx);

  const last = totalPoints - 1;
  const indexes = new Set<number>([0, last]);

  for (let i = 1; i < maxSamples - 1; i += 1) {
    const idx = Math.round((i / (maxSamples - 1)) * last);
    indexes.add(idx);
  }

  return [...indexes].sort((a, b) => a - b);
}

function interpolateGeometryAQI(totalPoints: number, sampledIndexes: number[], sampledAQI: number[]): number[] {
  if (!totalPoints) return [];
  if (!sampledIndexes.length) return Array.from({ length: totalPoints }, () => 50);
  if (sampledIndexes.length === 1) return Array.from({ length: totalPoints }, () => sampledAQI[0] ?? 50);

  const full = new Array<number>(totalPoints).fill(sampledAQI[0] ?? 50);

  for (let segment = 0; segment < sampledIndexes.length - 1; segment += 1) {
    const leftIdx = sampledIndexes[segment];
    const rightIdx = sampledIndexes[segment + 1];
    const leftAqi = sampledAQI[segment] ?? sampledAQI[0] ?? 50;
    const rightAqi = sampledAQI[segment + 1] ?? leftAqi;
    const width = Math.max(1, rightIdx - leftIdx);

    for (let i = leftIdx; i <= rightIdx; i += 1) {
      const t = (i - leftIdx) / width;
      full[i] = clampAQI(leftAqi + (rightAqi - leftAqi) * t);
    }
  }

  return full;
}

async function fetchAQIAtCoordinate(point: [number, number]) {
  const key = coordinateKey(point);
  const cached = aqiCache.get(key);
  if (cached) return cached;

  try {
    const { data } = await axios.get<OpenMeteoAQIResponse>('https://air-quality-api.open-meteo.com/v1/air-quality', {
      params: {
        latitude: point[0],
        longitude: point[1],
        hourly: 'us_aqi,pm2_5,pm10,ozone',
        timezone: 'auto',
        forecast_days: 1,
        past_days: 1
      },
      timeout: 4500
    });

    const aqiSeries = data.hourly?.us_aqi ?? [];
    const pm25Series = data.hourly?.pm2_5 ?? [];
    const pm10Series = data.hourly?.pm10 ?? [];
    const o3Series = data.hourly?.ozone ?? [];

    let latestIndex = aqiSeries.length - 1;
    while (latestIndex >= 0 && aqiSeries[latestIndex] == null) latestIndex -= 1;

    if (latestIndex < 0) {
      const synthetic = syntheticAQI(point);
      aqiCache.set(key, synthetic);
      return synthetic;
    }

    const result = {
      aqi: clampAQI(safeNumber(aqiSeries[latestIndex])),
      pm25: clampAQI(safeNumber(pm25Series[latestIndex])),
      pm10: clampAQI(safeNumber(pm10Series[latestIndex])),
      o3: clampAQI(safeNumber(o3Series[latestIndex]))
    };

    aqiCache.set(key, result);
    return result;
  } catch {
    const synthetic = syntheticAQI(point);
    aqiCache.set(key, synthetic);
    return synthetic;
  }
}

async function fetchRoutesFromOSRM(
  source: [number, number],
  destination: [number, number],
  transportMode: TransportMode
): Promise<ProviderRoute[]> {
  const profile = profileByMode[transportMode];
  const { data } = await axios.get<OSRMResponse>('/api/route', {
    params: {
      profile,
      sourceLat: source[0],
      sourceLng: source[1],
      destinationLat: destination[0],
      destinationLng: destination[1]
    },
    timeout: 12000
  });

  if (data.code && data.code !== 'Ok') {
    throw new Error(data.message ?? 'Routing provider returned an error.');
  }

  return (data.routes ?? []).slice(0, 3).map((route) => ({
    distanceKm: route.distance / 1000,
    durationMin: Math.max(1, Math.round(route.duration / 60)),
    coordinates: toLatLngCoordinates(route.geometry.coordinates)
  }));
}

function routeScore(
  route: { avgAQI: number; distanceKm: number; etaMin: number },
  maxDistance: number,
  maxDuration: number,
  userPreference: number
) {
  const normalizedAQI = route.avgAQI / 500;
  const normalizedDuration = normalize(route.etaMin, maxDuration);
  const normalizedDistance = normalize(route.distanceKm, maxDistance);
  const timeCost = normalizedDuration * 0.65 + normalizedDistance * 0.35;
  return userPreference * normalizedAQI + (1 - userPreference) * timeCost;
}

function pickIndexesByIntent(
  routes: Array<{ avgAQI: number; etaMin: number; score: number }>
): { cleanest: number; fastest: number; balanced: number } {
  const cleanest = routes.reduce((best, route, index, all) => (route.avgAQI < all[best].avgAQI ? index : best), 0);
  const fastest = routes.reduce((best, route, index, all) => (route.etaMin < all[best].etaMin ? index : best), 0);
  const balanced = routes.reduce((best, route, index, all) => (route.score < all[best].score ? index : best), 0);

  const chosen = new Set([cleanest, fastest, balanced]);
  if (chosen.size === 3) return { cleanest, fastest, balanced };

  for (let i = 0; i < routes.length; i += 1) {
    if (!chosen.has(i)) {
      if (cleanest === fastest) return { cleanest, fastest: i, balanced };
      if (cleanest === balanced) return { cleanest, fastest, balanced: i };
      if (fastest === balanced) return { cleanest, fastest, balanced: i };
    }
  }

  return { cleanest, fastest, balanced };
}

export async function generateRouteVariants(params: {
  source: [number, number];
  destination: [number, number];
  transportMode: TransportMode;
  userPreference: number;
  sensitivityProfile?: SensitivityProfile;
}): Promise<{ routes: RouteVariant[]; coordinates: [number, number][] }> {
  const { source, destination, transportMode, userPreference, sensitivityProfile = 'normal' } = params;

  let providerRoutes: ProviderRoute[] = [];

  try {
    providerRoutes = await fetchRoutesFromOSRM(source, destination, transportMode);
  } catch {
    providerRoutes = [createFallbackRoute(source, destination, transportMode)];
  }

  if (!providerRoutes.length) {
    providerRoutes = [createFallbackRoute(source, destination, transportMode)];
  }

  const withAQI = await Promise.all(
    providerRoutes.map(async (route, index) => {
      const sampledIndexes = pickSampleIndexes(route.coordinates.length, 36);
      const sampledCoordinates = sampledIndexes.map((idx) => route.coordinates[idx]);
      const readings = await Promise.all(sampledCoordinates.map((point) => fetchAQIAtCoordinate(point)));

      const sampledAQI = readings.map((reading) => reading.aqi);
      const geometryAQI = interpolateGeometryAQI(route.coordinates.length, sampledIndexes, sampledAQI);

      const waypoints: Waypoint[] = sampledCoordinates.map((point, pointIndex) => ({
        lat: point[0],
        lng: point[1],
        aqi: readings[pointIndex].aqi
      }));

      return {
        id: `route-${index + 1}`,
        distanceKm: route.distanceKm,
        etaMin: route.durationMin,
        avgAQI: clampAQI(average(sampledAQI)),
        breakdown: {
          pm25: clampAQI(average(readings.map((item) => item.pm25))),
          pm10: clampAQI(average(readings.map((item) => item.pm10))),
          o3: clampAQI(average(readings.map((item) => item.o3)))
        },
        geometry: route.coordinates,
        geometryAQI,
        waypoints
      };
    })
  );

  const maxDistance = Math.max(...withAQI.map((route) => route.distanceKm));
  const maxDuration = Math.max(...withAQI.map((route) => route.etaMin));

  const scored = withAQI.map((route) => ({
    ...route,
    score: routeScore(
      { ...route, avgAQI: adjustedAQI(route.avgAQI, sensitivityProfile) },
      maxDistance,
      maxDuration,
      userPreference
    )
  }));

  const { cleanest, fastest, balanced } = pickIndexesByIntent(scored);
  const labelsByIndex = new Map<number, RouteVariantLabel>([
    [cleanest, 'Cleanest'],
    [fastest, 'Fastest'],
    [balanced, 'Balanced']
  ]);

  const routes = scored
    .map((route, index): RouteVariant => ({
      id: route.id,
      label: labelsByIndex.get(index) ?? 'Balanced',
      distanceKm: route.distanceKm,
      etaMin: route.etaMin,
      avgAQI: route.avgAQI,
      adjustedAvgAQI: adjustedAQI(route.avgAQI, sensitivityProfile),
      exposureScore: toExposureScore(route.avgAQI),
      score: route.score,
      waypoints: route.waypoints,
      geometry: route.geometry,
      geometryAQI: route.geometryAQI,
      breakdown: route.breakdown,
      respiratoryDose: computeRespiratoryDose(route.breakdown.pm25, route.etaMin, transportMode)
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  const topCoordinates = routes[0]?.geometry ?? providerRoutes[0].coordinates;

  return { routes, coordinates: topCoordinates };
}

/* ══════════════════════════════════════════
   "Best Time to Leave" — Hourly AQI Forecast
   ══════════════════════════════════════════ */

type HourlyForecastPoint = {
  hour: string;
  avgAQI: number;
};

type OpenMeteoForecastResponse = {
  hourly: {
    time: string[];
    us_aqi: Array<number | null>;
  };
};

/**
 * Sample AQI forecasts along a route's geometry for the next 24 hours.
 * Uses up to 6 sample points from the route to keep API calls reasonable (async-parallel).
 */
export async function fetchHourlyRouteForecast(
  geometry: [number, number][]
): Promise<HourlyForecastPoint[]> {
  const sampleIndexes = pickSampleIndexes(geometry.length, 6);
  const samplePoints = sampleIndexes.map((idx) => geometry[idx]);

  // Fetch forecast for all sample points in parallel (async-parallel)
  const forecasts = await Promise.all(
    samplePoints.map(async (point) => {
      try {
        const { data } = await axios.get<OpenMeteoForecastResponse>(
          'https://air-quality-api.open-meteo.com/v1/air-quality',
          {
            params: {
              latitude: point[0],
              longitude: point[1],
              hourly: 'us_aqi',
              timezone: 'auto',
              forecast_days: 2
            },
            timeout: 5000
          }
        );
        return data.hourly;
      } catch {
        return null;
      }
    })
  );

  const validForecasts = forecasts.filter(
    (f): f is { time: string[]; us_aqi: Array<number | null> } => f !== null
  );
  if (!validForecasts.length) return [];

  // Use the first forecast's time array as reference
  const times = validForecasts[0].time;
  const now = new Date();

  // Average AQI across all sample points for each hour
  const hourlyData: HourlyForecastPoint[] = [];

  for (let i = 0; i < times.length && hourlyData.length < 24; i++) {
    const time = new Date(times[i]);
    if (time < now) continue;

    let sum = 0;
    let count = 0;
    for (const forecast of validForecasts) {
      const val = forecast.us_aqi[i];
      if (val !== null && val !== undefined) {
        sum += val;
        count++;
      }
    }

    if (count > 0) {
      hourlyData.push({
        hour: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        avgAQI: clampAQI(sum / count)
      });
    }
  }

  return hourlyData;
}
