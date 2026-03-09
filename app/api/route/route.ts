import { NextRequest, NextResponse } from 'next/server';

type OSRMRoute = {
  distance: number;
  duration: number;
  geometry: {
    coordinates: [number, number][];
  };
};

type OSRMResponse = {
  code?: string;
  message?: string;
  routes?: OSRMRoute[];
};

const OSRM_BASE_URL = process.env.NEXT_PUBLIC_OSRM_BASE_URL ?? 'https://router.project-osrm.org';
const VALID_PROFILES = new Set(['driving', 'cycling', 'walking']);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const profile = searchParams.get('profile') ?? 'driving';
  const sourceLat = Number(searchParams.get('sourceLat'));
  const sourceLng = Number(searchParams.get('sourceLng'));
  const destinationLat = Number(searchParams.get('destinationLat'));
  const destinationLng = Number(searchParams.get('destinationLng'));

  if (
    !VALID_PROFILES.has(profile) ||
    [sourceLat, sourceLng, destinationLat, destinationLng].some((value) => Number.isNaN(value))
  ) {
    return NextResponse.json(
      { code: 'InvalidQuery', message: 'Invalid routing parameters.' },
      { status: 400 }
    );
  }

  const coordinates = `${sourceLng},${sourceLat};${destinationLng},${destinationLat}`;
  const url = new URL(`${OSRM_BASE_URL}/route/v1/${profile}/${coordinates}`);
  url.searchParams.set('overview', 'full');
  url.searchParams.set('alternatives', 'true');
  url.searchParams.set('geometries', 'geojson');
  url.searchParams.set('steps', 'false');

  try {
    const response = await fetch(url.toString(), {
      cache: 'no-store',
      headers: {
        Accept: 'application/json'
      }
    });

    const data = (await response.json()) as OSRMResponse;
    if (!response.ok) {
      return NextResponse.json(
        { code: data.code ?? 'RouteError', message: data.message ?? 'Routing provider request failed.' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch {
    return NextResponse.json(
      { code: 'RouteUnavailable', message: 'Routing provider is unavailable.' },
      { status: 503 }
    );
  }
}
