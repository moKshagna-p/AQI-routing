'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import RoutePanel from '@/components/RoutePanel';
import ResultPanel from '@/components/ResultPanel';
import { generateRouteVariants } from '@/lib/routeUtils';
import { usePlanStore } from '@/lib/store';
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
    loading,
    error,
    setLoading,
    setResult,
    selectRoute,
    setError
  } = usePlanStore();

  const [showAQIInfo, setShowAQIInfo] = useState(false);

  const sourcePoint = useMemo<[number, number]>(() => source ?? [40.758, -73.9855], [source]);
  const destinationPoint = useMemo<[number, number]>(() => destination ?? [40.7061, -74.0086], [destination]);

  const handleFindRoute = async ({ source, destination }: { source: [number, number]; destination: [number, number] }) => {
    try {
      setLoading(true);
      const result = await generateRouteVariants({
        source,
        destination,
        userPreference: preference,
        transportMode
      });
      setResult(result.routes, result.coordinates);
    } catch {
      setError('Route computation failed. Check the location names and try again.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <header className="absolute left-1/2 top-4 z-[1200] -translate-x-1/2 sm:top-5">
        <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/75 p-1.5 backdrop-blur">
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/">
              <ArrowLeft className="mr-1 h-4 w-4" /> Home
            </Link>
          </Button>

          <div className="h-4 w-px bg-white/20" />

          <Dialog open={showAQIInfo} onOpenChange={setShowAQIInfo}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full">
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
                <div className="rounded-md border border-emerald-400/40 bg-emerald-400/10 p-3">
                  <p className="font-semibold text-emerald-300">0-50: Good</p>
                  <p className="text-white/70">Air quality is considered satisfactory.</p>
                </div>
                <div className="rounded-md border border-amber-300/40 bg-amber-300/10 p-3">
                  <p className="font-semibold text-amber-200">51-100: Moderate</p>
                  <p className="text-white/70">Acceptable for most people.</p>
                </div>
                <div className="rounded-md border border-rose-400/40 bg-rose-400/10 p-3">
                  <p className="font-semibold text-rose-300">101+: Unhealthy</p>
                  <p className="text-white/70">Sensitive groups should limit exposure.</p>
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

      <RoutePanel onFindRoute={handleFindRoute} />
      <ResultPanel routes={routes} selectedRouteId={selectedRouteId} onSelect={selectRoute} />

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

      {!routes.length && !loading && !error && (
        <div className="absolute bottom-20 left-4 z-[1200] max-w-sm rounded-lg border border-white/20 bg-black/75 px-4 py-3 text-sm text-white/70 backdrop-blur sm:bottom-7 sm:left-7">
          Enter origin and destination, then compare cleanest, fastest, and balanced routes using live AQI samples.
        </div>
      )}
    </motion.div>
  );
}
