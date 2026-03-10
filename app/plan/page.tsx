'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Info, Link2, Check } from 'lucide-react';
import RoutePanel from '@/components/RoutePanel';
import ResultPanel from '@/components/ResultPanel';
import { generateRouteVariants, fetchHourlyRouteForecast } from '@/lib/routeUtils';
import { usePlanStore, storeToURLParams, parseURLParams } from '@/lib/store';
import DepartureChart from '@/components/DepartureChart';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

const LeafletMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="grid h-screen place-items-center bg-black">
      <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-black/80 px-4 py-3 text-sm text-white/80">
        Initializing map engine...
      </div>
    </div>
  )
});

export default function PlanPage() {
  const {
    source,
    destination,
    routes,
    selectedRouteId,
    mapCoordinates,
    transportMode,
    preference,
    sensitivityProfile,
    loading,
    error,
    hourlyForecast,
    setLoading,
    setResult,
    selectRoute,
    setError,
    setLocations,
    setTransportMode,
    setPreference,
    setSensitivityProfile,
    setHourlyForecast
  } = usePlanStore();

  const [showAQIInfo, setShowAQIInfo] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const urlInitRef = useRef(false);

  const sourcePoint = useMemo<[number, number]>(() => source ?? [40.758, -73.9855], [source]);
  const destinationPoint = useMemo<[number, number]>(() => destination ?? [40.7061, -74.0086], [destination]);

  const handleFindRoute = useCallback(async ({ source, destination }: { source: [number, number]; destination: [number, number] }) => {
    try {
      setLoading(true);
      setHourlyForecast(null);
      const result = await generateRouteVariants({
        source,
        destination,
        userPreference: preference,
        transportMode,
        sensitivityProfile
      });
      setResult(result.routes, result.coordinates);

      // Update URL with route params (async-defer-await: only update after success)
      const state = usePlanStore.getState();
      const params = storeToURLParams(state);
      window.history.replaceState(null, '', `/plan?${params}`);

      // Fetch forecast non-blocking (don't delay route results)
      const topGeometry = result.routes[0]?.geometry;
      if (topGeometry?.length) {
        fetchHourlyRouteForecast(topGeometry).then((forecast) => {
          if (forecast.length) setHourlyForecast(forecast);
        });
      }
    } catch {
      setError('Route computation failed. Check the location names and try again.');
    }
  }, [preference, transportMode, sensitivityProfile, setLoading, setResult, setError, setHourlyForecast]);

  /* ── Initialize from URL params on first mount ── */
  useEffect(() => {
    if (urlInitRef.current) return;
    urlInitRef.current = true;

    const parsed = parseURLParams(window.location.search);
    if (!parsed?.source || !parsed?.destination) return;

    setLocations({
      sourceLabel: parsed.sourceLabel ?? 'Origin',
      destinationLabel: parsed.destinationLabel ?? 'Destination',
      source: parsed.source,
      destination: parsed.destination
    });
    if (parsed.mode) setTransportMode(parsed.mode);
    if (parsed.preference !== null) setPreference(parsed.preference);
    if (parsed.sensitivityProfile) setSensitivityProfile(parsed.sensitivityProfile);

    // Auto-trigger route computation from URL
    handleFindRoute({ source: parsed.source, destination: parsed.destination });
  }, [handleFindRoute, setLocations, setTransportMode, setPreference, setSensitivityProfile]);

  const handleCopyLink = useCallback(() => {
    const state = usePlanStore.getState();
    const params = storeToURLParams(state);
    const url = `${window.location.origin}/plan?${params}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="relative h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute inset-0 z-[900]">
        <div className="planner-orb left-[-10rem] top-[6rem]" />
        <div className="planner-orb planner-orb-secondary right-[-6rem] top-[-4rem]" />
        <div className="planner-grid absolute inset-0" />
      </div>

      <header className="absolute left-1/2 top-4 z-[1200] -translate-x-1/2 sm:top-5">
        <div className="flex items-center gap-2 rounded-full border border-[#7a7979] bg-[#3f3f3f]/85 p-1.5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.85)] backdrop-blur">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-full border border-[#858484] bg-[#616060] text-white hover:bg-[#6f6e6e]"
          >
            <Link href="/">
              <ArrowLeft className="mr-1 h-4 w-4" /> Home
            </Link>
          </Button>

          <div className="h-4 w-px bg-[#8f8e8e]" />

          <Dialog open={showAQIInfo} onOpenChange={setShowAQIInfo}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full border border-[#858484] bg-[#616060] text-white hover:bg-[#6f6e6e]"
              >
                <Info className="mr-1 h-4 w-4" /> AQI Scale
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>AQI Breakdown</DialogTitle>
                <DialogDescription>
                  Air Quality Index (AQI) blends pollutant concentrations into a 0-500 score.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 text-sm">
                <div className="rounded-md border p-3" style={{ borderColor: 'rgba(0,228,0,0.4)', background: 'rgba(0,228,0,0.08)' }}>
                  <p className="font-semibold" style={{ color: '#00E400' }}>0-50: Good</p>
                  <p className="text-white/70">Air quality is satisfactory.</p>
                </div>
                <div className="rounded-md border p-3" style={{ borderColor: 'rgba(255,209,102,0.4)', background: 'rgba(255,209,102,0.08)' }}>
                  <p className="font-semibold" style={{ color: '#FFD166' }}>51-100: Moderate</p>
                  <p className="text-white/70">Acceptable for most people.</p>
                </div>
                <div className="rounded-md border p-3" style={{ borderColor: 'rgba(255,126,0,0.4)', background: 'rgba(255,126,0,0.08)' }}>
                  <p className="font-semibold" style={{ color: '#FF7E00' }}>101-150: Unhealthy for Sensitive Groups</p>
                  <p className="text-white/70">Sensitive groups may experience effects.</p>
                </div>
                <div className="rounded-md border p-3" style={{ borderColor: 'rgba(255,59,92,0.4)', background: 'rgba(255,59,92,0.08)' }}>
                  <p className="font-semibold" style={{ color: '#FF3B5C' }}>151-200: Unhealthy</p>
                  <p className="text-white/70">Everyone may begin to experience effects.</p>
                </div>
                <div className="rounded-md border p-3" style={{ borderColor: 'rgba(143,63,151,0.4)', background: 'rgba(143,63,151,0.08)' }}>
                  <p className="font-semibold" style={{ color: '#8F3F97' }}>201-300: Very Unhealthy</p>
                  <p className="text-white/70">Health alert: serious risk for everyone.</p>
                </div>
                <div className="rounded-md border p-3" style={{ borderColor: 'rgba(126,0,35,0.4)', background: 'rgba(126,0,35,0.08)' }}>
                  <p className="font-semibold" style={{ color: '#FF4466' }}>301-500: Hazardous</p>
                  <p className="text-white/70">Emergency conditions. Avoid all outdoor activity.</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <LeafletMap
        source={sourcePoint}
        destination={destinationPoint}
        routes={routes}
        selectedRouteId={selectedRouteId}
        mapCoordinates={mapCoordinates}
        loading={loading}
      />

      <div className="pointer-events-none absolute inset-0 z-[1200]">
        <div className="absolute bottom-3 left-3 right-3 top-20 md:bottom-6 md:left-auto md:right-6 md:top-24 md:w-[430px]">
          <div className="pointer-events-auto h-full overflow-y-auto rounded-[32px] border border-white/18 bg-black/52 p-3 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.95)] backdrop-blur-sm">
              <div className="flex flex-col gap-3">
                <RoutePanel onFindRoute={handleFindRoute} className="w-full sm:w-full" />

                {hourlyForecast && hourlyForecast.length > 0 ? (
                  <DepartureChart forecast={hourlyForecast} />
                ) : null}

                {routes.length > 0 ? (
                  <div className="flex w-full justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyLink}
                      className="rounded-full border border-emerald-200/35 bg-emerald-500/10 text-emerald-50 hover:bg-emerald-400/20"
                    >
                      {linkCopied ? (
                        <><Check className="mr-1 h-3.5 w-3.5 text-green-300" /> Copied</>
                      ) : (
                        <><Link2 className="mr-1 h-3.5 w-3.5" /> Copy Link</>
                      )}
                    </Button>
                  </div>
                ) : null}

                {routes.length > 0 ? (
                  <ResultPanel
                    routes={routes}
                    selectedRouteId={selectedRouteId}
                    onSelect={selectRoute}
                    className="!max-h-none !w-full !overflow-visible sm:!w-full"
                  />
                ) : null}
              </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 left-4 z-[1200] max-w-md rounded-lg border border-danger/40 bg-black/80 px-4 py-3 text-sm text-danger backdrop-blur sm:bottom-7 sm:left-7"
            role="status"
            aria-live="polite"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
