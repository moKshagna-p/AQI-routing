'use client';

import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { getAQIColor, getAQILevel } from '@/lib/aqiUtils';
import { Badge } from '@/components/ui/badge';

type AQIBadgeProps = {
  value: number;
  compact?: boolean;
};

export default function AQIBadge({ value, compact = false }: AQIBadgeProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const color = getAQIColor(value);
  const level = getAQILevel(value);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 0.8,
      ease: 'easeOut'
    });
    return () => controls.stop();
  }, [count, value]);

  if (compact) {
    return (
      <div className="flex flex-col items-end gap-1">
        <motion.span style={{ color }} className="number-display text-2xl font-black leading-none">
          {rounded}
        </motion.span>
        <Badge variant="secondary" className="text-[10px]" style={{ color }}>
          {level}
        </Badge>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/20 bg-black/40 p-3">
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/55">Average AQI</div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <motion.span style={{ color }} className="number-display text-4xl font-black leading-none">
          {rounded}
        </motion.span>
        <Badge variant="secondary" style={{ color }}>
          {level}
        </Badge>
      </div>
    </div>
  );
}
