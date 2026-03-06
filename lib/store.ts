import { create } from 'zustand';
import { type RouteVariant, type TransportMode } from './routeUtils';
import { type SensitivityProfile } from './aqiUtils';

export type HourlyForecastPoint = {
  hour: string;
  avgAQI: number;
};

type PlanState = {
  sourceLabel: string;
  destinationLabel: string;
  source: [number, number] | null;
  destination: [number, number] | null;
  transportMode: TransportMode;
  preference: number;
  sensitivityProfile: SensitivityProfile;
  loading: boolean;
  routes: RouteVariant[];
  selectedRouteId: string | null;
  mapCoordinates: [number, number][];
  error: string | null;
  hourlyForecast: HourlyForecastPoint[] | null;
  setLocations: (payload: {
    sourceLabel: string;
    destinationLabel: string;
    source: [number, number];
    destination: [number, number];
  }) => void;
  setPreference: (value: number) => void;
  setTransportMode: (mode: TransportMode) => void;
  setSensitivityProfile: (profile: SensitivityProfile) => void;
  setLoading: (state: boolean) => void;
  setResult: (routes: RouteVariant[], mapCoordinates: [number, number][]) => void;
  selectRoute: (id: string) => void;
  setError: (message: string | null) => void;
  setHourlyForecast: (forecast: HourlyForecastPoint[] | null) => void;
};

export const usePlanStore = create<PlanState>((set) => ({
  sourceLabel: 'San Francisco, CA',
  destinationLabel: 'Berkeley, CA',
  source: [37.7749, -122.4194],
  destination: [37.8715, -122.273],
  transportMode: 'car',
  preference: 0.75,
  sensitivityProfile: 'normal',
  loading: false,
  routes: [],
  selectedRouteId: null,
  mapCoordinates: [],
  error: null,
  hourlyForecast: null,
  setLocations: ({ sourceLabel, destinationLabel, source, destination }) =>
    set({ sourceLabel, destinationLabel, source, destination }),
  setPreference: (preference) => set({ preference }),
  setTransportMode: (transportMode) => set({ transportMode }),
  setSensitivityProfile: (sensitivityProfile) => set({ sensitivityProfile }),
  setLoading: (loading) => set({ loading }),
  setResult: (routes, mapCoordinates) =>
    set({ routes, mapCoordinates, selectedRouteId: routes[0]?.id ?? null, loading: false, error: null }),
  selectRoute: (selectedRouteId) => set({ selectedRouteId }),
  setError: (error) => set({ error, loading: false }),
  setHourlyForecast: (hourlyForecast) => set({ hourlyForecast })
}));

/* ── URL param helpers ── */

export function storeToURLParams(state: PlanState): string {
  const params = new URLSearchParams();
  if (state.source) params.set('from', `${state.source[0]},${state.source[1]}`);
  if (state.destination) params.set('to', `${state.destination[0]},${state.destination[1]}`);
  params.set('fromName', state.sourceLabel);
  params.set('toName', state.destinationLabel);
  params.set('mode', state.transportMode);
  params.set('pref', String(Math.round(state.preference * 100)));
  if (state.sensitivityProfile !== 'normal') params.set('profile', state.sensitivityProfile);
  return params.toString();
}

export function parseURLParams(search: string): {
  source: [number, number] | null;
  destination: [number, number] | null;
  sourceLabel: string | null;
  destinationLabel: string | null;
  mode: TransportMode | null;
  preference: number | null;
  sensitivityProfile: SensitivityProfile | null;
} | null {
  const params = new URLSearchParams(search);
  const from = params.get('from');
  const to = params.get('to');

  if (!from || !to) return null;

  const [fromLat, fromLng] = from.split(',').map(Number);
  const [toLat, toLng] = to.split(',').map(Number);

  if ([fromLat, fromLng, toLat, toLng].some((v) => Number.isNaN(v))) return null;

  const validModes: TransportMode[] = ['walk', 'bike', 'car'];
  const modeParam = params.get('mode');
  const mode = modeParam && validModes.includes(modeParam as TransportMode) ? (modeParam as TransportMode) : null;

  const prefParam = params.get('pref');
  const preference = prefParam ? Math.max(0, Math.min(100, Number(prefParam))) / 100 : null;

  const validProfiles: SensitivityProfile[] = ['normal', 'asthmatic', 'child', 'elderly', 'pregnant'];
  const profileParam = params.get('profile');
  const sensitivityProfile = profileParam && validProfiles.includes(profileParam as SensitivityProfile)
    ? (profileParam as SensitivityProfile)
    : null;

  return {
    source: [fromLat, fromLng],
    destination: [toLat, toLng],
    sourceLabel: params.get('fromName'),
    destinationLabel: params.get('toName'),
    mode,
    preference,
    sensitivityProfile
  };
}
