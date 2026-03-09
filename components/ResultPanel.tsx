'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import AQIBadge from './AQIBadge';
import { getAQIColor } from '@/lib/aqiUtils';
import { type RouteVariant } from '@/lib/routeUtils';
import { usePlanStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Wind, Share2 } from 'lucide-react';

const ShareCard = dynamic(() => import('./ShareCard'), { ssr: false });

type ResultPanelProps = {
  routes: RouteVariant[];
  selectedRouteId: string | null;
  onSelect: (id: string) => void;
  className?: string;
};

function BreakdownBar({ label, value, maxValue = 200 }: { label: string; value: number; maxValue?: number }) {
  const percentage = Math.min(100, (value / maxValue) * 100);
  const color = getAQIColor(value);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px] text-white/60">
        <span>{label}</span>
        <span className="tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
}

export default function ResultPanel({ routes, selectedRouteId, onSelect, className }: ResultPanelProps) {
  const sensitivityProfile = usePlanStore((s) => s.sensitivityProfile);
  const sourceLabel = usePlanStore((s) => s.sourceLabel);
  const destinationLabel = usePlanStore((s) => s.destinationLabel);
  const [shareRoute, setShareRoute] = useState<RouteVariant | null>(null);

  if (!routes.length) return null;

  return (
    <>
    <Card className={cn('result-panel-shell max-h-[calc(100dvh-8.5rem)] w-full overflow-y-auto border-white/20 bg-black/72 backdrop-blur sm:max-h-[min(68vh,48rem)] sm:w-[430px]', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="mono-font mb-2 text-[10px] uppercase tracking-[0.3em] text-white/35">Analysis deck</div>
            <CardTitle className="display-font tracking-[-0.05em]">Route Analysis</CardTitle>
            <CardDescription className="mt-1">Select a route to preview it on the map.</CardDescription>
          </div>
          <Badge variant="secondary">{routes.length} routes</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {routes.map((route) => {
          const selected = selectedRouteId === route.id;
          const showAdjusted = sensitivityProfile !== 'normal' && route.adjustedAvgAQI !== route.avgAQI;

          return (
            <button
              key={route.id}
              onClick={() => onSelect(route.id)}
              className={cn(
                'w-full rounded-[24px] border p-4 text-left transition-all duration-300',
                selected ? 'border-white/45 bg-white/[0.09] shadow-[0_24px_70px_-34px_rgba(255,255,255,0.24)]' : 'border-white/12 bg-white/[0.03] hover:bg-white/[0.06]'
              )}
            >
              <div className="mb-3 grid grid-cols-[minmax(0,1fr)_4.75rem] items-start gap-3">
                <div className="min-w-0">
                  <div className="text-base font-semibold text-white">{route.label}</div>
                  <div className="text-sm text-white/65">
                    {route.distanceKm.toFixed(1)} km &middot; {route.etaMin} min
                  </div>
                  <div className="mt-1 text-xs text-white/45">Exposure: {route.exposureScore}</div>
                  {showAdjusted && (
                    <div className="mt-0.5 text-[10px] text-amber-400/80">
                      Adjusted AQI: {route.adjustedAvgAQI} ({sensitivityProfile})
                    </div>
                  )}
                </div>
                <div className="flex w-[4.75rem] justify-end">
                  <AQIBadge value={showAdjusted ? route.adjustedAvgAQI : route.avgAQI} compact />
                </div>
              </div>

              {/* Respiratory dose */}
              <div className="mb-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[11px]">
                <Wind className="h-3.5 w-3.5 shrink-0 text-white/50" />
                <div className="flex-1 text-white/60">
                  Inhaled PM2.5: <span className="number-display font-medium text-white/90">{route.respiratoryDose.doseUg} ug</span>
                  {route.respiratoryDose.comparisonToCar > 1.1 && (
                    <span className="ml-1 text-amber-400/80">
                      ({route.respiratoryDose.comparisonToCar}x vs driving)
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <BreakdownBar label="PM2.5" value={route.breakdown.pm25} />
                <BreakdownBar label="PM10" value={route.breakdown.pm10} />
                <BreakdownBar label="Ozone" value={route.breakdown.o3} />
              </div>

              {/* Share button */}
              {selected && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShareRoute(route); }}
                    className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-white/60 transition-colors hover:border-white/25 hover:text-white/80"
                  >
                    <Share2 className="h-3 w-3" />
                    Share Report
                  </button>
                </div>
              )}
            </button>
          );
        })}
      </CardContent>
    </Card>

    {shareRoute && (
      <ShareCard
        route={shareRoute}
        sourceLabel={sourceLabel}
        destinationLabel={destinationLabel}
        sensitivityProfile={sensitivityProfile}
        onClose={() => setShareRoute(null)}
      />
    )}
    </>
  );
}
