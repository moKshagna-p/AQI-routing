'use client';

import { motion } from 'framer-motion';
import AQIBadge from './AQIBadge';
import { getAQIColor } from '@/lib/aqiUtils';
import { type RouteVariant } from '@/lib/routeUtils';

type ResultPanelProps = {
  routes: RouteVariant[];
  selectedRouteId: string | null;
  onSelect: (id: string) => void;
};

const labelIcons: Record<string, JSX.Element> = {
  Cleanest: (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
      <path d="M8 2C5 5 3 7 3 10a5 5 0 0010 0c0-3-2-5-5-8z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.1" />
    </svg>
  ),
  Fastest: (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
      <path d="M9 2L5 9h4l-1 5 5-8H9l1-4z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.1" />
    </svg>
  ),
  Balanced: (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
};

function BreakdownBar({ label, value, maxValue = 220 }: { label: string; value: number; maxValue?: number }) {
  const percentage = Math.min(100, (value / maxValue) * 100);
  const color = getAQIColor(value);

  return (
    <div className="group">
      <div className="mb-1 flex items-center justify-between">
        <span className="mono-font text-[9px] uppercase tracking-[0.15em] text-white/30">{label}</span>
        <span className="mono-font text-[10px] tabular-nums text-white/40">{value}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1], delay: 0.2 }}
          className="h-full rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}

export default function ResultPanel({ routes, selectedRouteId, onSelect }: ResultPanelProps) {
  if (!routes.length) return null;

  return (
    <motion.aside
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0.15 }}
      className="glass panel-edge absolute bottom-3 right-3 z-[1000] max-h-[calc(100vh-6rem)] w-[calc(100%-1.5rem)] overflow-y-auto rounded-2xl p-4 sm:bottom-6 sm:right-6 sm:w-[420px] sm:rounded-3xl sm:p-5"
    >
      {/* Header */}
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h3 className="display-font text-lg leading-tight sm:text-xl">Route Analysis</h3>
          <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/30">
            Select to preview on map
          </p>
        </div>
        <span className="mono-font rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] tabular-nums text-white/35">
          {routes.length} variants
        </span>
      </div>

      {/* Route cards */}
      <div className="space-y-2.5">
        {routes.map((route, idx) => {
          const selected = selectedRouteId === route.id;
          return (
            <motion.button
              key={route.id}
              onClick={() => onSelect(route.id)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.08 }}
              className={`group w-full rounded-2xl border p-4 text-left transition-all duration-300 ${
                selected
                  ? 'border-white/25 bg-white/[0.06] shadow-[0_0_30px_rgba(255,255,255,0.06)]'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.03]'
              }`}
            >
              {/* Card header */}
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${
                    selected
                      ? 'border-white/30 bg-white/10 text-white'
                      : 'border-white/10 bg-white/[0.04] text-white/40 group-hover:text-white/60'
                  }`}>
                    {labelIcons[route.label] ?? labelIcons.Balanced}
                  </div>
                  <div>
                    <div className="heading-font text-[15px] leading-tight">{route.label}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] tabular-nums text-white/35">
                      <span>{route.distanceKm.toFixed(1)} km</span>
                      <span className="text-white/15">|</span>
                      <span>{route.etaMin} min</span>
                    </div>
                  </div>
                </div>
                <AQIBadge value={route.avgAQI} compact />
              </div>

              {/* Exposure score */}
              <div className="mb-3 flex items-center gap-2">
                <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3 text-white/25">
                  <path d="M6 1v10M3 4l3-3 3 3M3 8l3 3 3-3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="mono-font text-[11px] text-white/40">
                  Exposure: {route.exposureScore}
                </span>
              </div>

              {/* Breakdown bars */}
              <div className="space-y-2">
                <BreakdownBar label="PM 2.5" value={route.breakdown.pm25} />
                <BreakdownBar label="PM 10" value={route.breakdown.pm10} />
                <BreakdownBar label="Ozone" value={route.breakdown.o3} />
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.aside>
  );
}
