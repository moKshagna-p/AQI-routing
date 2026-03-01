'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import ParticlesBG from '@/components/ParticlesBG';

/* ── Data ── */
const tickerItems = [
  '2.3M routes analyzed',
  '47 cities worldwide',
  'Live AQI integration',
  '31k active commuters',
  '15m data points / day',
  'Open-source infrastructure',
  'Real-time air quality',
  'OSRM-powered routing',
];

const features = [
  {
    title: 'AQI-First Routing',
    description: 'Every route is scored by real-world air quality data, not just distance. Breathe cleaner air on every commute.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" strokeLinecap="round" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    accent: 'cyan',
  },
  {
    title: 'Corridor Simulation',
    description: 'OSRM-powered path computation generates three distinct corridors: cleanest, fastest, and balanced exposure profiles.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 7l5 5-5 5M6 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    accent: 'blue',
  },
  {
    title: 'Exposure Analytics',
    description: 'PM2.5, PM10, and O3 breakdown for every route variant. Quantified in cigarette-equivalents per day.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 16l4-6 4 4 5-8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    accent: 'yellow',
  },
  {
    title: 'Multi-Modal Support',
    description: 'Walk, bike, or drive. Each transport mode uses optimized speed profiles and real routing infrastructure.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5">
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
        <path d="M6 16V8a2 2 0 012-2h3l2 3h5a2 2 0 012 2v5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    accent: 'red',
  },
];

const stats = [
  { value: '-34%', label: 'Exposure Reduced', sublabel: 'average per route' },
  { value: '+11.8%', label: 'Clean Detour', sublabel: 'minimal time impact' },
  { value: '<9s', label: 'Route Refresh', sublabel: 'real-time computation' },
  { value: '3', label: 'Route Variants', sublabel: 'per query' },
];

/* ── Stagger animation helpers ── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 0.61, 0.36, 1] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8 } },
};

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <ParticlesBG />

      {/* ═══ Navigation ═══ */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed left-0 right-0 top-0 z-50"
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 sm:px-10">
          <Link href="/" className="display-font flex items-center gap-2.5 text-lg tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan/30 bg-cyan/10">
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <path d="M10 2L3 10l7 8 7-8-7-8z" stroke="#00ffd1" strokeWidth="1.5" fill="rgba(0,255,209,0.15)" />
                <circle cx="10" cy="10" r="2" fill="#00ffd1" />
              </svg>
            </span>
            AirRoute
          </Link>

          <div className="hidden items-center gap-8 text-[13px] text-white/50 sm:flex">
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#stats" className="transition-colors hover:text-white">Data</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">GitHub</a>
          </div>

          <Link
            href="/plan"
            className="cyan-button rounded-full px-5 py-2 text-xs font-semibold tracking-wide sm:text-[13px]"
          >
            Launch Planner
          </Link>
        </div>
      </motion.nav>

      {/* ═══ Hero Section ═══ */}
      <section ref={heroRef} className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative flex max-w-[1200px] flex-col items-center text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="tag mb-8"
          >
            <span className="status-dot" />
            Air Quality Intelligence
          </motion.div>

          {/* Headline — oversized editorial */}
          <motion.h1
            variants={stagger}
            initial="hidden"
            animate="show"
            className="display-font text-display-hero"
          >
            <motion.span variants={fadeUp} className="block">
              Breathe
            </motion.span>
            <motion.span variants={fadeUp} className="gradient-text-hero block">
              Better
            </motion.span>
            <motion.span variants={fadeUp} className="block text-white/90">
              Route Smarter
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mx-auto mt-8 max-w-lg text-body-lg text-white/45 sm:max-w-xl"
          >
            AirRoute maps the lowest pollution corridor between any two points,
            blending travel time with real-world AQI risk data.
          </motion.p>

          {/* CTA group */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Link
              href="/plan"
              className="cyan-button group flex items-center gap-3 rounded-full px-8 py-3.5 text-sm font-semibold"
            >
              Plan Clean Route
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1">
                <path d="M4 10h12m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <button
              type="button"
              className="ghost-button flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <polygon points="8,5 16,10 8,15" fill="currentColor" opacity="0.7" />
              </svg>
              Watch Demo
            </button>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute -bottom-32 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-2 text-white/20"
            >
              <span className="text-[10px] uppercase tracking-[0.25em]">Scroll</span>
              <svg viewBox="0 0 16 24" fill="none" className="h-5 w-3">
                <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="1.2" />
                <motion.circle
                  cx="8" cy="8" r="2" fill="currentColor"
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ Ticker / Marquee ═══ */}
      <div className="ticker relative z-10 border-y border-white/[0.06] bg-black/30 py-4">
        <div className="ticker-scroll flex gap-16 whitespace-nowrap px-6">
          {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
            <span key={`${item}-${idx}`} className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-white/30">
              <span className="h-1 w-1 rounded-full bg-cyan/40" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ═══ Features Section — Bento Grid ═══ */}
      <section id="features" className="relative z-10 px-6 py-32 sm:px-10">
        <div className="mx-auto max-w-[1200px]">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="mb-16 max-w-2xl"
          >
            <motion.p variants={fadeUp} className="tag mb-5">
              Capabilities
            </motion.p>
            <motion.h2 variants={fadeUp} className="display-font text-display-lg">
              Routing engineered
              <br />
              <span className="text-white/40">for human lungs</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-5 text-body text-white/40">
              Every feature is designed around a single principle: minimize your exposure to harmful
              airborne particulates during transit.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                className="feature-card group relative rounded-2xl p-6 sm:p-7"
              >
                {/* Subtle number */}
                <span className="absolute right-5 top-4 text-[80px] font-black leading-none text-white/[0.02] display-font">
                  {String(idx + 1).padStart(2, '0')}
                </span>

                <div className={`mb-5 flex h-10 w-10 items-center justify-center rounded-xl border ${
                  feature.accent === 'cyan' ? 'border-cyan/20 bg-cyan/8 text-cyan' :
                  feature.accent === 'blue' ? 'border-blue-400/20 bg-blue-400/8 text-blue-400' :
                  feature.accent === 'yellow' ? 'border-yellow-400/20 bg-yellow-400/8 text-yellow-400' :
                  'border-red-400/20 bg-red-400/8 text-red-400'
                }`}>
                  {feature.icon}
                </div>

                <h3 className="heading-font mb-2.5 text-lg leading-tight">
                  {feature.title}
                </h3>
                <p className="text-body-sm leading-relaxed text-white/35">
                  {feature.description}
                </p>

                {/* Bottom hover line */}
                <div className={`absolute bottom-0 left-6 right-6 h-px transition-opacity duration-500 ${
                  feature.accent === 'cyan' ? 'bg-gradient-to-r from-transparent via-cyan/30 to-transparent' :
                  feature.accent === 'blue' ? 'bg-gradient-to-r from-transparent via-blue-400/30 to-transparent' :
                  feature.accent === 'yellow' ? 'bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent' :
                  'bg-gradient-to-r from-transparent via-red-400/30 to-transparent'
                } opacity-0 group-hover:opacity-100`} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ Stats Section ═══ */}
      <section id="stats" className="relative z-10 px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-[1200px]">
          <div className="section-divider mb-20" />

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-500 hover:border-cyan/15 hover:bg-cyan/[0.03]"
              >
                <div className="stat-shimmer display-font text-5xl font-black leading-none tracking-tight lg:text-[3.5rem]">
                  {stat.value}
                </div>
                <div className="mt-4 text-sm font-medium text-white/70">
                  {stat.label}
                </div>
                <div className="mt-1 text-xs text-white/30">
                  {stat.sublabel}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="section-divider mt-20" />
        </div>
      </section>

      {/* ═══ Preview / CTA Section ═══ */}
      <section className="relative z-10 px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-[1200px]">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]"
          >
            {/* Left text */}
            <div>
              <motion.p variants={fadeUp} className="tag mb-5">
                <span className="status-dot" />
                Live Preview
              </motion.p>
              <motion.h2 variants={fadeUp} className="display-font text-display-lg">
                See the air
                <br />
                <span className="text-white/40">before you move</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 max-w-md text-body text-white/40">
                Three corridor variants scored against pollution data. Choose the path
                that matches your priorities: speed, clean air, or a balanced approach.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8">
                <Link
                  href="/plan"
                  className="cyan-button group inline-flex items-center gap-3 rounded-full px-7 py-3 text-sm font-semibold"
                >
                  Open Planner
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1">
                    <path d="M4 10h12m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </motion.div>
            </div>

            {/* Right — route preview card */}
            <motion.div variants={fadeIn} className="glass-card panel-edge relative rounded-3xl p-6 sm:p-8">
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="status-dot" />
                  <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">Live AQI Corridor</span>
                </div>
                <span className="rounded-full border border-cyan/25 bg-cyan/8 px-3 py-1 text-[10px] font-medium text-cyan">
                  Active
                </span>
              </div>

              {/* Route visualization */}
              <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-black/50 p-1">
                <svg viewBox="0 0 560 180" className="h-full w-full">
                  <defs>
                    <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00FFD1" stopOpacity="0.9" />
                      <stop offset="50%" stopColor="#FFD166" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#FF3B5C" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="routeGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00FFD1" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#00c4ff" stopOpacity="0.2" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Grid lines */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <line key={`h-${i}`} x1="0" y1={i * 25 + 15} x2="560" y2={i * 25 + 15} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  ))}
                  {Array.from({ length: 12 }).map((_, i) => (
                    <line key={`v-${i}`} x1={i * 50 + 10} y1="0" x2={i * 50 + 10} y2="180" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  ))}

                  {/* Route paths */}
                  <path d="M20 130 C80 70, 140 110, 220 80 C280 55, 360 100, 440 60 C480 42, 510 70, 540 50" fill="none" stroke="url(#routeGrad)" strokeWidth="3" filter="url(#glow)" strokeLinecap="round" />
                  <path d="M20 145 C100 105, 180 140, 280 115 C360 92, 420 125, 540 90" fill="none" stroke="url(#routeGrad2)" strokeWidth="1.5" strokeDasharray="6 4" strokeLinecap="round" />
                  <path d="M20 155 C120 125, 240 150, 340 130 C420 112, 480 140, 540 115" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeLinecap="round" />

                  {/* Data points */}
                  <circle cx="20" cy="130" r="4" fill="#00ffd1" opacity="0.8" />
                  <circle cx="220" cy="80" r="3" fill="#ffd166" opacity="0.7" />
                  <circle cx="440" cy="60" r="3" fill="#ff3b5c" opacity="0.7" />
                  <circle cx="540" cy="50" r="4" fill="#00ffd1" opacity="0.8" />
                </svg>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Cleanest', value: 'AQI 38', color: 'text-cyan' },
                  { label: 'Balanced', value: 'AQI 56', color: 'text-warn' },
                  { label: 'Fastest', value: 'AQI 74', color: 'text-danger' },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/[0.06] bg-black/40 p-3">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">{item.label}</div>
                    <div className={`number-display mt-1.5 text-sm font-bold ${item.color}`}>{item.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="relative z-10 border-t border-white/[0.06] px-6 py-10 sm:px-10">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="display-font text-sm text-white/60">AirRoute</span>
            <span className="text-white/15">|</span>
            <span className="text-[11px] text-white/25">Breathe better, route smarter</span>
          </div>

          <div className="flex items-center gap-6 text-[12px] text-white/30">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-white/60">GitHub</a>
            <a href="https://openaq.org/" target="_blank" rel="noreferrer" className="transition-colors hover:text-white/60">OpenAQ</a>
            <a href="https://aqicn.org/api/" target="_blank" rel="noreferrer" className="transition-colors hover:text-white/60">WAQI API</a>
          </div>

          <span className="text-[11px] text-white/20">
            Powered by OpenAQ + WAQI
          </span>
        </div>
      </footer>
    </div>
  );
}
