'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import RoutePanel from '@/components/RoutePanel';
import ResultPanel from '@/components/ResultPanel';
import { generateRouteVariants } from '@/lib/routeUtils';
import { usePlanStore } from '@/lib/store';

const LeafletMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="grid h-screen place-items-center bg-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-2xl border border-cyan/20 bg-cyan/5" />
          <div className="absolute inset-0 animate-pulse-ring rounded-2xl border border-cyan/30" />
        </div>
        <span className="text-[13px] text-white/40">Initializing map engine</span>
      </div>
    </div>
  ),
});

function AQIModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1400] grid place-items-center overscroll-contain p-4"
        >
          <button
            type="button"
            aria-label="Close AQI information"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="glass panel-edge relative z-10 w-full max-w-lg rounded-3xl p-6 sm:p-8"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="display-font text-2xl">AQI Scale</h2>
                <p className="mt-1 text-xs text-white/35">Air Quality Index breakdown</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/50 transition-colors hover:border-white/20 hover:text-white"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                  <path d="M4 4l8 8m0-8l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <p className="text-body-sm leading-relaxed text-white/45">
              The AQI converts pollutant concentrations into a 0-500 scale. Lower values
              indicate cleaner air and reduced long-term exposure risk.
            </p>

            <div className="mt-5 space-y-2.5">
              <div className="flex items-center gap-3 rounded-xl border border-cyan/15 bg-cyan/5 p-3.5">
                <div className="h-3 w-3 rounded-full bg-cyan shadow-[0_0_8px_rgba(0,255,209,0.5)]" />
                <div>
                  <div className="text-sm font-medium text-cyan">0 - 50: Good</div>
                  <div className="text-[11px] text-white/30">Air quality is satisfactory</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-warn/15 bg-warn/5 p-3.5">
                <div className="h-3 w-3 rounded-full bg-warn shadow-[0_0_8px_rgba(255,209,102,0.5)]" />
                <div>
                  <div className="text-sm font-medium text-warn">51 - 100: Moderate</div>
                  <div className="text-[11px] text-white/30">Acceptable for most individuals</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-danger/15 bg-danger/5 p-3.5">
                <div className="h-3 w-3 rounded-full bg-danger shadow-[0_0_8px_rgba(255,59,92,0.5)]" />
                <div>
                  <div className="text-sm font-medium text-danger">101+: Unhealthy</div>
                  <div className="text-[11px] text-white/30">Sensitive groups should limit exposure</div>
                </div>
              </div>
            </div>

            <p className="mt-5 text-[11px] text-white/25">
              Data attribution: OpenAQ + WAQI. Current app uses a blended mock-prototype model.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

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
    setError,
  } = usePlanStore();

  const [showAQIInfo, setShowAQIInfo] = useState(false);

  const sourcePoint = useMemo<[number, number]>(() => source ?? [37.7749, -122.4194], [source]);
  const destinationPoint = useMemo<[number, number]>(() => destination ?? [37.8715, -122.273], [destination]);

  const handleFindRoute = async ({ source, destination }: { source: [number, number]; destination: [number, number] }) => {
    try {
      setLoading(true);
      const result = await generateRouteVariants({
        source,
        destination,
        userPreference: preference,
        transportMode,
      });
      setResult(result.routes, result.coordinates);
    } catch {
      setError('Route computation failed. Try again in a moment.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* ═══ Floating Header ═══ */}
      <header className="absolute left-1/2 top-4 z-[1200] -translate-x-1/2 sm:top-5">
        <div className="glass panel-edge flex items-center gap-1 rounded-full px-2 py-1.5 sm:gap-2 sm:px-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] text-white/50 transition-colors hover:bg-white/5 hover:text-white"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
              <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </Link>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-2 px-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-md border border-cyan/25 bg-cyan/8">
              <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5">
                <path d="M6 1L2 6l4 5 4-5-4-5z" stroke="#00ffd1" strokeWidth="1" fill="rgba(0,255,209,0.2)" />
              </svg>
            </span>
            <span className="display-font text-[13px] tracking-tight sm:text-sm">AirRoute</span>
          </div>

          <div className="h-4 w-px bg-white/10" />

          <button
            type="button"
            onClick={() => setShowAQIInfo(true)}
            className="rounded-full px-3 py-1.5 text-[12px] text-white/50 transition-colors hover:bg-white/5 hover:text-white"
          >
            AQI Info
          </button>
        </div>
      </header>

      {/* ═══ Map ═══ */}
      <LeafletMap
        source={sourcePoint}
        destination={destinationPoint}
        routes={routes}
        selectedRouteId={selectedRouteId}
        mapCoordinates={mapCoordinates}
        loading={loading}
      />

      {/* ═══ Panels ═══ */}
      <RoutePanel onFindRoute={handleFindRoute} />
      <ResultPanel routes={routes} selectedRouteId={selectedRouteId} onSelect={selectRoute} />

      {/* ═══ Error / Empty State ═══ */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass panel-edge absolute bottom-20 left-4 z-[1200] max-w-sm rounded-2xl px-4 py-3 sm:bottom-7 sm:left-7"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-danger shadow-[0_0_6px_rgba(255,59,92,0.5)]" />
              <span className="text-[13px] text-danger">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!routes.length && !loading && !error && (
        <div
          className="glass panel-edge absolute bottom-20 left-4 z-[1200] max-w-xs rounded-2xl px-4 py-3 sm:bottom-7 sm:left-7"
          role="status"
          aria-live="polite"
        >
          <p className="text-[12px] leading-relaxed text-white/40">
            Select source and destination cities, then compare Cleanest, Fastest, and Balanced routes by AQI exposure.
          </p>
        </div>
      )}

      {/* ═══ AQI Modal ═══ */}
      <AQIModal open={showAQIInfo} onClose={() => setShowAQIInfo(false)} />
    </motion.div>
  );
}
