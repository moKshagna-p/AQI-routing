'use client';

import { Slider } from '@/components/ui/slider';

type SliderControlProps = {
  value: number;
  onChange: (value: number) => void;
};

export default function SliderControl({ value, onChange }: SliderControlProps) {
  const cleanWeight = Math.round(value * 100);
  const speedWeight = 100 - cleanWeight;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-white/60">
        <span>Speed ({speedWeight}%)</span>
        <span>Clean Air ({cleanWeight}%)</span>
      </div>
      <Slider
        value={[value]}
        min={0}
        max={1}
        step={0.01}
        onValueChange={(next) => onChange(next[0] ?? value)}
        aria-label="Speed to clean air preference"
      />
    </div>
  );
}
