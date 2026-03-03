import axios from 'axios';

export type GeocodedPlace = {
  label: string;
  coordinates: [number, number];
};

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

type PhotonResult = {
  properties?: {
    name?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  geometry?: {
    coordinates?: [number, number];
  };
};

type PhotonResponse = {
  features?: PhotonResult[];
};

function formatPhotonLabel(result: PhotonResult): string {
  const parts = [
    result.properties?.name,
    result.properties?.city,
    result.properties?.state,
    result.properties?.country
  ].filter(Boolean);

  return parts.join(', ') || 'Selected location';
}

async function geocodeWithNominatim(query: string): Promise<GeocodedPlace | null> {
  const { data } = await axios.get<NominatimResult[]>('https://nominatim.openstreetmap.org/search', {
    params: {
      q: query,
      format: 'jsonv2',
      limit: 1,
      addressdetails: 1
    },
    timeout: 5000
  });

  const first = data?.[0];
  if (!first) return null;

  return {
    label: first.display_name,
    coordinates: [Number(first.lat), Number(first.lon)]
  };
}

async function geocodeWithPhoton(query: string): Promise<GeocodedPlace | null> {
  const { data } = await axios.get<PhotonResponse>('https://photon.komoot.io/api', {
    params: {
      q: query,
      limit: 1
    },
    timeout: 5000
  });

  const first = data.features?.[0];
  const coords = first?.geometry?.coordinates;
  if (!first || !coords) return null;

  return {
    label: formatPhotonLabel(first),
    coordinates: [coords[1], coords[0]]
  };
}

export async function geocodePlace(query: string): Promise<GeocodedPlace | null> {
  if (!query.trim()) return null;

  try {
    const fromNominatim = await geocodeWithNominatim(query);
    if (fromNominatim) return fromNominatim;
  } catch {
    // Fall through to backup provider.
  }

  try {
    return await geocodeWithPhoton(query);
  } catch {
    return null;
  }
}
