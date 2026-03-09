'use client';

import { Car, Bike, PersonStanding, Loader2, Route, Heart, Stethoscope, Baby, Users } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import SliderControl from './SliderControl';
import { usePlanStore } from '@/lib/store';
import { geocodePlace } from '@/lib/geocoding';
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

  const { register, handleSubmit, formState } = useForm<RouteFormValues>({
    defaultValues: {
      source: sourceLabel,
      destination: destinationLabel
    }
  });

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
    <Card className={cn('w-full border-white/30 bg-black/75 backdrop-blur-sm sm:w-[420px] sm:backdrop-blur', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="display-font flex items-center gap-2 text-2xl">
          <Route className="h-5 w-5" />
          Route Planner
        </CardTitle>
        <CardDescription>
          Enter any two places. The app computes routes and ranks them by live AQI exposure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source">Origin</Label>
            <Input id="source" placeholder="e.g., Times Square, New York..." autoComplete="off" {...register('source', { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input id="destination" placeholder="e.g., Brooklyn Bridge..." autoComplete="off" {...register('destination', { required: true })} />
          </div>

          <div className="rounded-lg border border-white/20 bg-black/35 p-3">
            <SliderControl value={preference} onChange={setPreference} />
          </div>

          <div className="space-y-2">
            <Label>Transport</Label>
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
            <Label>Health Profile</Label>
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
