'use client';

import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import SliderControl from './SliderControl';
import { demoCities } from '@/lib/mockData';
import { usePlanStore } from '@/lib/store';
import { type TransportMode } from '@/lib/routeUtils';

type RouteFormValues = {
  source: string;
  destination: string;
};

type RoutePanelProps = {
  onFindRoute: (values: { source: [number, number]; destination: [number, number] }) => Promise<void>;
};

const cityCoordinates: Record<string, [number, number]> = {
  'San Francisco, CA': [37.7749, -122.4194],
  'Oakland, CA': [37.8044, -122.2711],
  'Berkeley, CA': [37.8715, -122.273],
  'San Jose, CA': [37.3382, -121.8863],
  'Palo Alto, CA': [37.4419, -122.143],
  'Sacramento, CA': [38.5816, -121.4944],
  'Los Angeles, CA': [34.0522, -118.2437],
  'Seattle, WA': [47.6062, -122.3321],
};

const modeMeta: Array<{ mode: TransportMode; label: string; icon: JSX.Element }> = [
  {
    mode: 'walk',
    label: 'Walk',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
        <circle cx="10" cy="4" r="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M8 8h4l1 4-2 2v4M9 12l-2 2v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    mode: 'bike',
    label: 'Bike',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
        <circle cx="5" cy="14" r="3" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="15" cy="14" r="3" stroke="currentColor" strokeWidth="1.3" />
        <path d="M5 14l5-8 2 4h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    mode: 'car',
    label: 'Car',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
        <path d="M3 12l1.5-5h11L17 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="2" y="12" width="16" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="6" cy="16" r="1" fill="currentColor" />
        <circle cx="14" cy="16" r="1" fill="currentColor" />
      </svg>
    ),
  },
];

export default function RoutePanel({ onFindRoute }: RoutePanelProps) {
  const {
    sourceLabel,
    destinationLabel,
    preference,
    transportMode,
    loading,
    setLocations,
    setPreference,
    setTransportMode,
    setError,
  } = usePlanStore();

  const { register, handleSubmit, formState } = useForm<RouteFormValues>({
    defaultValues: {
      source: sourceLabel,
      destination: destinationLabel,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const source = cityCoordinates[values.source.trim()];
    const destination = cityCoordinates[values.destination.trim()];

    if (!source || !destination) {
      setError('Use one of the suggested cities in this demo.');
      return;
    }

    setLocations({
      sourceLabel: values.source,
      destinationLabel: values.destination,
      source,
      destination,
    });

    await onFindRoute({ source, destination });
  });

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0.1 }}
      className="glass panel-edge absolute left-3 top-20 z-[1000] w-[calc(100%-1.5rem)] rounded-2xl p-4 sm:left-6 sm:top-24 sm:w-[380px] sm:rounded-3xl sm:p-5"
    >
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="display-font text-xl leading-tight tracking-tight sm:text-2xl">
            Plan Route
          </h2>
          <p className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-white/30">
            Air quality aware navigation
          </p>
        </div>
        <div className="tag">
          <span className="status-dot" style={{ width: 4, height: 4 }} />
          Demo
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/35">
            <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
              <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="6" cy="6" r="1" fill="currentColor" />
            </svg>
            Origin
          </span>
          <input
            {...register('source', { required: true })}
            list="cities"
            autoComplete="off"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/20 transition-all hover:border-white/15 focus:border-white/30 focus:bg-white/[0.04] focus:outline-none"
            placeholder="e.g., San Francisco, CA"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/35">
            <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
              <path d="M6 2v8M2 6l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Destination
          </span>
          <input
            {...register('destination', { required: true })}
            list="cities"
            autoComplete="off"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/20 transition-all hover:border-white/15 focus:border-white/30 focus:bg-white/[0.04] focus:outline-none"
            placeholder="e.g., Berkeley, CA"
          />
        </label>

        <datalist id="cities">
          {demoCities.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>
      </div>

      {/* Preference Slider */}
      <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
        <SliderControl value={preference} onChange={setPreference} />
      </div>

      {/* Transport Mode */}
      <div className="mt-4">
        <div className="mb-2.5 text-[10px] uppercase tracking-[0.18em] text-white/30">Transport Mode</div>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Transport mode">
          {modeMeta.map(({ mode, label, icon }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTransportMode(mode)}
              className={`group flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-[11px] transition-all duration-300 ${
                transportMode === mode
                  ? 'border-white/30 bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.08)]'
                  : 'border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/15 hover:text-white/60'
              }`}
              aria-pressed={transportMode === mode}
            >
              {icon}
              <span className="uppercase tracking-[0.12em]">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || formState.isSubmitting}
        className="glass-button mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? (
          <>
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
              <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Computing corridor...
          </>
        ) : (
          <>
            Find Clean Route
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
              <path d="M3 8h10m-3-3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </button>
    </motion.form>
  );
}
