# AirRoute

AirRoute is a Next.js 14 frontend prototype that prioritizes cleaner air exposure over raw travel time.

## Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Framer Motion
- Leaflet + react-leaflet
- Zustand
- React Hook Form
- Axios

## Features in this phase

- Cinematic landing page with animated AQI particles, ticker, and CTA
- Full-screen planner with floating glass panels
- Source/destination autocomplete (demo city list)
- Speed vs Clean Air preference slider
- Transport modes: Walk, Bike, Car
- Route simulation variants:
  - Cleanest (longer distance, lower AQI)
  - Fastest (shortest distance, higher AQI)
  - Balanced (middle ground)
- AQI-based route scoring algorithm
- Animated route draw + AQI heat points
- AQI info modal and designed empty/error states

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open `http://localhost:3000`.

## Project structure

```text
app/
  page.tsx
  plan/page.tsx
  layout.tsx
components/
  Map.tsx
  RoutePanel.tsx
  ResultPanel.tsx
  AQIBadge.tsx
  SliderControl.tsx
  ParticlesBG.tsx
lib/
  aqiUtils.ts
  routeUtils.ts
  mockData.ts
  store.ts
styles/
  globals.css
```

## Data notes

- Routing is fetched from OSRM demo server (`router.project-osrm.org`) with graceful fallback to local distance approximation.
- AQI route waypoints are demo-simulated for this phase.
- WAQI/OpenAQ integration points are ready for expansion in backend phase.
