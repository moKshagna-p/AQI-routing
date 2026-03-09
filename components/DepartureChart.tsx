'use client';

import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { getAQIColor } from '@/lib/aqiUtils';
import { type HourlyForecastPoint } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type DepartureChartProps = {
  forecast: HourlyForecastPoint[];
  className?: string;
};

export default function DepartureChart({ forecast, className }: DepartureChartProps) {
  // Show up to 12 hours for readability
  const displayData = forecast.slice(0, 12);

  const { maxAQI, bestHour, bestAQI } = useMemo(() => {
    if (!displayData.length) return { maxAQI: 0, bestHour: '', bestAQI: 0 };

    let maxVal = 0;
    let bestIdx = 0;
    let bestVal = Infinity;

    for (let i = 0; i < displayData.length; i++) {
      const aqi = displayData[i].avgAQI;
      if (aqi > maxVal) maxVal = aqi;
      if (aqi < bestVal) {
        bestVal = aqi;
        bestIdx = i;
      }
    }

    return { maxAQI: maxVal, bestHour: displayData[bestIdx].hour, bestAQI: bestVal };
  }, [displayData]);

  if (!forecast.length) return null;

  const chartHeight = 72;

  return (
    <Card className={cn('w-full border-white/20 bg-black/80 backdrop-blur sm:w-[420px]', className)}>
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Clock className="h-4 w-4 text-white/60" />
          Best Time to Leave
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        {/* Best hour highlight */}
        <div className="mb-3 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
          <span className="text-white/50">Optimal departure: </span>
          <span className="font-semibold text-green-400">{bestHour}</span>
          <span className="text-white/50"> — Avg AQI </span>
          <span className="number-display font-semibold" style={{ color: getAQIColor(bestAQI) }}>
            {bestAQI}
          </span>
        </div>

        {/* SVG bar chart */}
        <div className="overflow-hidden rounded-md">
          <svg
            viewBox={`0 0 ${displayData.length * 32} ${chartHeight + 18}`}
            className="w-full"
            role="img"
            aria-label={`AQI forecast chart. Best time to leave: ${bestHour} with AQI ${bestAQI}`}
          >
            {displayData.map((point, i) => {
              const barHeight = maxAQI > 0 ? (point.avgAQI / maxAQI) * chartHeight : 4;
              const x = i * 32 + 4;
              const y = chartHeight - barHeight;
              const isBest = point.hour === bestHour;

              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width={24}
                    height={barHeight}
                    rx={3}
                    fill={getAQIColor(point.avgAQI)}
                    opacity={isBest ? 1 : 0.6}
                    stroke={isBest ? '#fff' : 'none'}
                    strokeWidth={isBest ? 1.5 : 0}
                  />
                  {/* Hour label */}
                  <text
                    x={x + 12}
                    y={chartHeight + 13}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.4)"
                    fontSize="7"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {point.hour.replace(/\s?(AM|PM)/, (_, p) => p[0].toLowerCase())}
                  </text>
                  {/* AQI value on bar */}
                  {barHeight > 14 && (
                    <text
                      x={x + 12}
                      y={y + barHeight / 2 + 3}
                      textAnchor="middle"
                      fill="rgba(0,0,0,0.7)"
                      fontSize="7"
                      fontWeight="600"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {point.avgAQI}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
