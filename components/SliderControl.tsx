'use client';

import { motion } from 'framer-motion';

type SliderControlProps = {
  value: number;
  onChange: (value: number) => void;
};

export default function SliderControl({ value, onChange }: SliderControlProps) {
  const cleanWeight = Math.round(value * 100);
  const speedWeight = 100 - cleanWeight;

  return (
    <div className="flex w-full flex-col gap-2.5">
      {/* Labels */}
      <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-white/30">
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 10 10" fill="none" className="h-2.5 w-2.5 text-danger">
            <path d="M5 1l3 5H2l3-5z" fill="currentColor" opacity="0.6" />
          </svg>
          Speed
        </span>
        <span className="flex items-center gap-1.5">
          Clean Air
          <svg viewBox="0 0 10 10" fill="none" className="h-2.5 w-2.5 text-cyan">
            <circle cx="5" cy="5" r="3" fill="currentColor" opacity="0.6" />
          </svg>
        </span>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          aria-label="Speed to clean air preference"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full border border-white/[0.08] bg-transparent
            [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-cyan/60 [&::-webkit-slider-thumb]:bg-cyan [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(0,255,209,0.6)]
            [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-cyan/60 [&::-moz-range-thumb]:bg-cyan"
          style={{
            background: `linear-gradient(90deg, rgba(255,59,92,0.3) 0%, rgba(255,209,102,0.3) 50%, rgba(0,255,209,0.4) 100%)`,
          }}
        />
      </div>

      {/* Value pills */}
      <div className="flex items-center justify-between">
        <span className="mono-font rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] tabular-nums text-white/40">
          {speedWeight}%
        </span>
        <motion.span
          key={cleanWeight}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mono-font rounded-md border border-cyan/20 bg-cyan/8 px-2 py-0.5 text-[10px] tabular-nums font-semibold text-cyan"
        >
          {cleanWeight}%
        </motion.span>
      </div>
    </div>
  );
}
