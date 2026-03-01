'use client';

import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { getAQIColor, getAQILevel } from '@/lib/aqiUtils';

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
      ease: 'easeOut',
    });
    return () => controls.stop();
  }, [count, value]);

  if (compact) {
    return (
      <div className="flex flex-col items-end gap-0.5">
        <motion.span
          style={{ color }}
          className="number-display text-2xl font-black leading-none"
        >
          {rounded}
        </motion.span>
        <span
          style={{ color }}
          className="text-[9px] font-semibold uppercase tracking-[0.15em] opacity-70"
        >
          {level}
        </span>
      </div>
    );
  }

  return (
    <div className="panel-edge relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="text-[9px] uppercase tracking-[0.22em] text-white/30">Avg AQI</div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <motion.span
          style={{ color }}
          className="number-display text-4xl font-black leading-none"
        >
          {rounded}
        </motion.span>
        <span
          style={{ color }}
          className="pb-1 text-[10px] font-semibold uppercase tracking-[0.15em] opacity-70"
        >
          {level}
        </span>
      </div>

      {/* Glow ring */}
      <div
        className="absolute -right-1 -top-1 h-3 w-3 rounded-full"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 12px ${color}80, 0 0 4px ${color}`,
          opacity: 0.6,
        }}
      />
    </div>
  );
}
