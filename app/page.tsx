import Link from 'next/link';
import { Wind, Route, ShieldCheck, Navigation } from 'lucide-react';
import ParticlesBG from '@/components/ParticlesBG';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    title: 'Real AQI Sampling',
    description: 'Route scoring uses live AQI data from Open-Meteo, so no AQI API key is required.',
    icon: Wind
  },
  {
    title: 'No-Signup Routing',
    description: 'Routing runs on OSRM public endpoints with fallback geometry when routing is unavailable.',
    icon: Route
  },
  {
    title: 'Health-Weighted Ranking',
    description: 'Pick the cleanest, fastest, or balanced option based on travel time and pollutant exposure.',
    icon: ShieldCheck
  }
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <ParticlesBG />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 sm:px-10">
        <header className="mb-16 flex items-center justify-between">
          <div className="display-font text-xl">AirRoute</div>
          <Button asChild>
            <Link href="/plan">Open Planner</Link>
          </Button>
        </header>

        <section className="grid flex-1 items-center gap-10 pb-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <Badge variant="secondary" className="mb-5">
              Fully Open Provider Stack
            </Badge>
            <h1 className="display-font text-5xl leading-[0.95] sm:text-6xl">
              Cleaner routes,
              <br />
              no credit card required.
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/70">
              Plan routes like a standard navigation app, but with integrated air-quality risk scoring to reduce
              long-term exposure.
            </p>

            <div className="mt-8 flex gap-3">
              <Button asChild size="lg">
                <Link href="/plan">
                  <Navigation className="mr-2 h-4 w-4" /> Start Routing
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noreferrer">
                  AQI API Docs
                </a>
              </Button>
            </div>
          </div>

          <Card className="border-white/25 bg-black/70">
            <CardHeader>
              <CardTitle>What Changed</CardTitle>
              <CardDescription>The demo model has been replaced with a working route analysis flow.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="rounded-lg border border-white/20 bg-black/45 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <Icon className="h-4 w-4" />
                      {feature.title}
                    </div>
                    <p className="text-sm text-white/65">{feature.description}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
