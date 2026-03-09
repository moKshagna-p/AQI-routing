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

export type LocationSuggestion = GeocodedPlace;

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

async function searchWithPhoton(query: string, limit: number): Promise<LocationSuggestion[]> {
  const { data } = await axios.get<PhotonResponse>('https://photon.komoot.io/api', {
    params: { q: query, limit },
    timeout: 5000
  });

  return (
    data.features
      ?.map((feature) => {
        const coords = feature.geometry?.coordinates;
        if (!coords) return null;
        return {
          label: formatPhotonLabel(feature),
          coordinates: [coords[1], coords[0]] as [number, number]
        };
      })
      .filter((item): item is LocationSuggestion => Boolean(item)) ?? []
  );
}

async function searchWithNominatim(query: string, limit: number): Promise<LocationSuggestion[]> {
  const { data } = await axios.get<NominatimResult[]>('https://nominatim.openstreetmap.org/search', {
    params: {
      q: query,
      format: 'jsonv2',
      limit,
      addressdetails: 1
    },
    timeout: 5000
  });

  return data.map((item) => ({
    label: item.display_name,
    coordinates: [Number(item.lat), Number(item.lon)]
  }));
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

export async function searchPlaces(query: string, limit = 5): Promise<LocationSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  try {
    const photonResults = await searchWithPhoton(trimmed, limit);
    if (photonResults.length) return photonResults.slice(0, limit);
  } catch {
    // Fall through to backup provider.
  }

  try {
    return (await searchWithNominatim(trimmed, limit)).slice(0, limit);
  } catch {
    return [];
  }
}
