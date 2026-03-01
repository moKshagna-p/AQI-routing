export type Waypoint = {
  lat: number;
  lng: number;
  aqi: number;
};

export const demoCities = [
  'San Francisco, CA',
  'Oakland, CA',
  'Berkeley, CA',
  'San Jose, CA',
  'Palo Alto, CA',
  'Sacramento, CA',
  'Los Angeles, CA',
  'Seattle, WA'
];

export const mockWaypoints: Waypoint[] = [
  { lat: 37.7749, lng: -122.4194, aqi: 52 },
  { lat: 37.781, lng: -122.409, aqi: 43 },
  { lat: 37.789, lng: -122.395, aqi: 61 },
  { lat: 37.8044, lng: -122.2711, aqi: 75 },
  { lat: 37.823, lng: -122.25, aqi: 49 },
  { lat: 37.8715, lng: -122.273, aqi: 46 }
];
