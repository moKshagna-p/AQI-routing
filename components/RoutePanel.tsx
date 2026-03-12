'use client';

import { Car, Bike, PersonStanding, Loader2, Route, Heart, Stethoscope, Baby, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import SliderControl from './SliderControl';
import { usePlanStore } from '@/lib/store';
import { geocodePlace, searchPlaces, type LocationSuggestion } from '@/lib/geocoding';
import { type TransportMode } from '@/lib/routeUtils';
import { type SensitivityProfile, getSensitivityLabel } from '@/lib/aqiUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

type RouteFormValues = {
  source: string;
  destination: string;
};

type RoutePanelProps = {
  onFindRoute: (values: { source: [number, number]; destination: [number, number] }) => Promise<void>;
  className?: string;
};

const modeMeta: Array<{ mode: TransportMode; label: string; icon: JSX.Element }> = [
  {
    mode: 'walk',
    label: 'Walk',
    icon: <PersonStanding className="h-4 w-4" />
  },
  {
    mode: 'bike',
    label: 'Bike',
    icon: <Bike className="h-4 w-4" />
  },
  {
    mode: 'car',
    label: 'Car',
    icon: <Car className="h-4 w-4" />
  }
];

const profileMeta: Array<{ profile: SensitivityProfile; icon: JSX.Element }> = [
  { profile: 'normal', icon: <Heart className="h-3.5 w-3.5" /> },
  { profile: 'asthmatic', icon: <Stethoscope className="h-3.5 w-3.5" /> },
  { profile: 'child', icon: <Baby className="h-3.5 w-3.5" /> },
  { profile: 'elderly', icon: <Users className="h-3.5 w-3.5" /> },
  { profile: 'pregnant', icon: <Heart className="h-3.5 w-3.5" /> }
];

export default function RoutePanel({ onFindRoute, className }: RoutePanelProps) {
  const {
    sourceLabel,
    destinationLabel,
    preference,
    transportMode,
    sensitivityProfile,
    loading,
    setLocations,
    setPreference,
    setTransportMode,
    setSensitivityProfile,
    setError
  } = usePlanStore();

  const [resolving, setResolving] = useState(false);
  const [sourceSuggestions, setSourceSuggestions] = useState<LocationSuggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [searchingSource, setSearchingSource] = useState(false);
  const [searchingDestination, setSearchingDestination] = useState(false);

  const { register, handleSubmit, formState, watch, setValue } = useForm<RouteFormValues>({
    defaultValues: {
      source: sourceLabel,
      destination: destinationLabel
    }
  });
  const sourceValue = watch('source');
  const destinationValue = watch('destination');

  useEffect(() => {
    if (!showSourceSuggestions) return;
    const query = sourceValue?.trim() ?? '';
    if (query.length < 2) {
      setSourceSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingSource(true);
      const results = await searchPlaces(query);
      setSourceSuggestions(results);
      setSearchingSource(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [sourceValue, showSourceSuggestions]);

  useEffect(() => {
    if (!showDestinationSuggestions) return;
    const query = destinationValue?.trim() ?? '';
    if (query.length < 2) {
      setDestinationSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingDestination(true);
      const results = await searchPlaces(query);
      setDestinationSuggestions(results);
      setSearchingDestination(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [destinationValue, showDestinationSuggestions]);

  const onSubmit = handleSubmit(async (values) => {
    if (values.source.trim().toLowerCase() === values.destination.trim().toLowerCase()) {
      setError('Source and destination must be different places.');
      return;
    }

    setResolving(true);
    const [resolvedSource, resolvedDestination] = await Promise.all([
      geocodePlace(values.source),
      geocodePlace(values.destination)
    ]);
    setResolving(false);

    if (!resolvedSource || !resolvedDestination) {
      setError('Could not find one of the locations. Use a more specific address or city name.');
      return;
    }

    setLocations({
      sourceLabel: resolvedSource.label,
      destinationLabel: resolvedDestination.label,
      source: resolvedSource.coordinates,
      destination: resolvedDestination.coordinates
    });

    await onFindRoute({ source: resolvedSource.coordinates, destination: resolvedDestination.coordinates });
  });

  return (
    <Card className={cn('route-panel-shell w-full border-white/20 bg-black/70 backdrop-blur-sm sm:backdrop-blur', className)}>
      <CardHeader className="pb-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="mono-font text-[10px] uppercase tracking-[0.3em] text-white/35">Route input</div>
          <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/55">
            live geocoding
          </div>
        </div>
        <CardTitle className="display-font flex items-center gap-2 text-2xl tracking-[-0.05em]">
          <Route className="h-5 w-5" />
          Build your path
        </CardTitle>
        <CardDescription className="max-w-sm leading-6">
          Enter any two places. The app computes route variants and ranks them by live AQI exposure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="relative space-y-2">
            <Label htmlFor="source" className="text-[11px] uppercase tracking-[0.22em] text-white/55">Origin</Label>
            <Input
              id="source"
              placeholder="e.g., Times Square, New York..."
              autoComplete="off"
              {...register('source', { required: true })}
              onFocus={() => setShowSourceSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSourceSuggestions(false), 120)}
            />
            {showSourceSuggestions && (sourceSuggestions.length > 0 || searchingSource) && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-20 overflow-hidden rounded-xl border border-white/15 bg-black/95 shadow-2xl backdrop-blur">
                {searchingSource ? (
                  <div className="px-3 py-2 text-xs text-white/60">Searching places...</div>
                ) : (
                  sourceSuggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.label}-${suggestion.coordinates[0]}-${suggestion.coordinates[1]}`}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        setValue('source', suggestion.label, { shouldDirty: true });
                        setShowSourceSuggestions(false);
                      }}
                      className="w-full border-b border-white/10 px-3 py-2.5 text-left text-xs text-white/75 transition-colors last:border-b-0 hover:bg-white/[0.08]"
                    >
                      {suggestion.label}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="relative space-y-2">
            <Label htmlFor="destination" className="text-[11px] uppercase tracking-[0.22em] text-white/55">Destination</Label>
            <Input
              id="destination"
              placeholder="e.g., Brooklyn Bridge..."
              autoComplete="off"
              {...register('destination', { required: true })}
              onFocus={() => setShowDestinationSuggestions(true)}
              onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 120)}
            />
            {showDestinationSuggestions && (destinationSuggestions.length > 0 || searchingDestination) && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-20 overflow-hidden rounded-xl border border-white/15 bg-black/95 shadow-2xl backdrop-blur">
                {searchingDestination ? (
                  <div className="px-3 py-2 text-xs text-white/60">Searching places...</div>
                ) : (
                  destinationSuggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.label}-${suggestion.coordinates[0]}-${suggestion.coordinates[1]}`}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        setValue('destination', suggestion.label, { shouldDirty: true });
                        setShowDestinationSuggestions(false);
                      }}
                      className="w-full border-b border-white/10 px-3 py-2.5 text-left text-xs text-white/75 transition-colors last:border-b-0 hover:bg-white/[0.08]"
                    >
                      {suggestion.label}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="rounded-[20px] border border-white/12 bg-white/[0.03] p-4">
            <SliderControl value={preference} onChange={setPreference} />
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-[0.22em] text-white/55">Transport</Label>
            <ToggleGroup
              type="single"
              value={transportMode}
              onValueChange={(value) => {
                if (value) setTransportMode(value as TransportMode);
              }}
              className="grid grid-cols-3 gap-2"
            >
              {modeMeta.map((mode) => (
                <ToggleGroupItem
                  key={mode.mode}
                  value={mode.mode}
                  variant="outline"
                  className="flex h-10 items-center justify-center gap-1.5 data-[state=on]:bg-white data-[state=on]:text-black"
                >
                  {mode.icon}
                  <span className="text-xs">{mode.label}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Health Profile selector */}
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-[0.22em] text-white/55">Health Profile</Label>
            <ToggleGroup
              type="single"
              value={sensitivityProfile}
              onValueChange={(value) => {
                if (value) setSensitivityProfile(value as SensitivityProfile);
              }}
              className="grid grid-cols-5 gap-1.5"
            >
              {profileMeta.map((p) => (
                <ToggleGroupItem
                  key={p.profile}
                  value={p.profile}
                  variant="outline"
                  className="flex h-9 flex-col items-center justify-center gap-0.5 text-[9px] data-[state=on]:bg-white data-[state=on]:text-black"
                  title={getSensitivityLabel(p.profile)}
                >
                  {p.icon}
                  <span className="leading-none">{getSensitivityLabel(p.profile).slice(0, 5)}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            {sensitivityProfile !== 'normal' && (
              <p className="text-[10px] text-white/50">
                AQI thresholds adjusted for {getSensitivityLabel(sensitivityProfile).toLowerCase()} sensitivity
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading || formState.isSubmitting || resolving}>
            {loading || resolving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {resolving ? 'Resolving Places...' : 'Analyzing Routes...'}
              </>
            ) : (
              'Find Lowest AQI Route'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
