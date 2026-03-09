import Link from 'next/link';
import { Wind, Route, ShieldCheck, Navigation, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[44vh] bg-[radial-gradient(ellipse_65%_45%_at_50%_0%,rgba(255,255,255,0.1),transparent)]" />
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/8" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 sm:px-10">
        <header className="mb-16 flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-4">
            <div className="display-font text-xl tracking-[-0.08em]">AirRoute</div>
            <div className="hidden h-4 w-px bg-white/15 sm:block" />
            <div className="mono-font hidden text-[10px] uppercase tracking-[0.32em] text-white/45 sm:block">
              AQI-aware urban routing
            </div>
          </div>
          <Button asChild>
            <Link href="/plan">Open Planner</Link>
          </Button>
        </header>

        <section className="grid flex-1 gap-14 pb-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <Badge variant="secondary" className="border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[10px] uppercase tracking-[0.32em] text-white/80">
              Open data stack
            </Badge>

            <h1 className="display-font max-w-4xl text-6xl leading-[0.84] tracking-[-0.08em] sm:text-7xl lg:text-[6.2rem]">
              Breathe smarter,
              <span className="block text-white/58">not just faster.</span>
            </h1>

            <p className="max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
              AirRoute compares real routes by pollutant exposure so your next trip can trade a few minutes for cleaner air.
            </p>

            <div className="flex flex-wrap gap-3">
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

          <div className="self-end border-l border-white/15 pl-6 sm:pl-8">
            <div className="mono-font mb-6 text-[10px] uppercase tracking-[0.3em] text-white/40">What makes it different</div>
            <div className="space-y-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="group">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                      <Icon className="h-4 w-4 text-white/60" />
                      {feature.title}
                    </div>
                    <p className="text-sm leading-6 text-white/55">{feature.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Built for polluted cities
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
