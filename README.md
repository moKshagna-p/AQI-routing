# AirRoute

AirRoute is a Next.js 14 planner that finds routes with lower air-pollution exposure while preserving practical travel time.

## Stack

- Next.js 14 (App Router)
- Tailwind CSS
- shadcn/ui components
- Framer Motion
- Leaflet + react-leaflet
- Zustand
- React Hook Form
- Axios

## Core features

- Real place-to-place planning (no demo city lock)
- Geocoding via Nominatim, with Photon fallback
- Routing via OSRM (no signup, no credit card)
- Live AQI sampling from Open-Meteo Air Quality API (no API key required)
- Route comparison with `Cleanest`, `Fastest`, and `Balanced` labels
- AQI exposure scoring + PM2.5/PM10/Ozone breakdowns
- Interactive map with selected-route AQI overlay

## Getting started

1. Install dependencies:

```bash
bun install
```

2. Configure environment values in `.env`:

```bash
NEXT_PUBLIC_OSRM_BASE_URL=https://router.project-osrm.org
```

3. Start development server:

```bash
bun run dev
```

4. Open `http://localhost:3000`.

## Notes

- You do not need OpenAQ, WAQI, or Mapbox keys.
- Base map uses free CARTO tiles and route computation uses OSRM.
- AQI data is fetched from Open-Meteo and cached per rounded coordinate in memory.
