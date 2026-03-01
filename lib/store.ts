import { create } from 'zustand';
import { type RouteVariant, type TransportMode } from './routeUtils';

type PlanState = {
  sourceLabel: string;
  destinationLabel: string;
  source: [number, number] | null;
  destination: [number, number] | null;
  transportMode: TransportMode;
  preference: number;
  loading: boolean;
  routes: RouteVariant[];
  selectedRouteId: string | null;
  mapCoordinates: [number, number][];
  error: string | null;
  setLocations: (payload: {
    sourceLabel: string;
    destinationLabel: string;
    source: [number, number];
    destination: [number, number];
  }) => void;
  setPreference: (value: number) => void;
  setTransportMode: (mode: TransportMode) => void;
  setLoading: (state: boolean) => void;
  setResult: (routes: RouteVariant[], mapCoordinates: [number, number][]) => void;
  selectRoute: (id: string) => void;
  setError: (message: string | null) => void;
};

export const usePlanStore = create<PlanState>((set) => ({
  sourceLabel: 'San Francisco, CA',
  destinationLabel: 'Berkeley, CA',
  source: [37.7749, -122.4194],
  destination: [37.8715, -122.273],
  transportMode: 'car',
  preference: 0.75,
  loading: false,
  routes: [],
  selectedRouteId: null,
  mapCoordinates: [],
  error: null,
  setLocations: ({ sourceLabel, destinationLabel, source, destination }) =>
    set({ sourceLabel, destinationLabel, source, destination }),
  setPreference: (preference) => set({ preference }),
  setTransportMode: (transportMode) => set({ transportMode }),
  setLoading: (loading) => set({ loading }),
  setResult: (routes, mapCoordinates) =>
    set({ routes, mapCoordinates, selectedRouteId: routes[0]?.id ?? null, loading: false, error: null }),
  selectRoute: (selectedRouteId) => set({ selectedRouteId }),
  setError: (error) => set({ error, loading: false })
}));
