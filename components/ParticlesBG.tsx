'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';

type Orb = {
  id: number;
  left: string;
  top: string;
  size: number;
  blur: number;
  opacity: number;
  duration: number;
  delay: number;
  color: string;
};

const palette = [
  'rgba(255, 255, 255, 0.06)',
  'rgba(255, 255, 255, 0.04)',
  'rgba(255, 255, 255, 0.03)',
  'rgba(255, 255, 255, 0.05)',
  'rgba(255, 255, 255, 0.02)',
];

export default function ParticlesBG() {
  const reduceMotion = useReducedMotion();

  const orbs = useMemo<Orb[]>(
    () =>
      Array.from({ length: 5 }, (_, id) => ({
        id,
        left: `${15 + Math.random() * 70}%`,
        top: `${10 + Math.random() * 80}%`,
        size: 200 + Math.random() * 400,
        blur: 80 + Math.random() * 60,
        opacity: 0.12 + Math.random() * 0.08,
        duration: 20 + Math.random() * 15,
        delay: Math.random() * 5,
        color: palette[id % palette.length],
      })),
    []
  );

  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, id) => ({
        id,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.4 + 0.05,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 8,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Subtle dot grid */}
      <div className="dot-grid absolute inset-0 opacity-30" />

      {/* Ambient orbs — large, soft, blurred color fields */}
      {orbs.map((orb) => (
        <motion.div
          key={`orb-${orb.id}`}
          className="absolute rounded-full"
          style={{
            left: orb.left,
            top: orb.top,
            width: orb.size,
            height: orb.size,
            opacity: orb.opacity,
            filter: `blur(${orb.blur}px)`,
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, 30, -20, 0],
                  y: [0, -25, 15, 0],
                  scale: [1, 1.1, 0.95, 1],
                }
          }
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Micro particles — tiny floating dots */}
      {particles.map((p) => (
        <motion.span
          key={`p-${p.id}`}
          className="absolute rounded-full bg-white"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -15, 8, 0],
                  x: [0, 8, -6, 0],
                  opacity: [p.opacity * 0.3, p.opacity, p.opacity * 0.5],
                }
          }
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
