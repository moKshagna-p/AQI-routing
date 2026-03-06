'use client';

import { useCallback, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Share2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type RouteVariant } from '@/lib/routeUtils';
import { getAQIColor, getAQILevel, toExposureScore, getSensitivityLabel, type SensitivityProfile } from '@/lib/aqiUtils';

type ShareCardProps = {
  route: RouteVariant;
  sourceLabel: string;
  destinationLabel: string;
  sensitivityProfile: SensitivityProfile;
  onClose: () => void;
};

/* ── Static branding footer ── */
const CARD_FOOTER = (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.4)',
  }}>
    <span style={{ fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
      AirRoute
    </span>
    <span>airroute.app</span>
  </div>
);

export default function ShareCard({ route, sourceLabel, destinationLabel, sensitivityProfile, onClose }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const color = getAQIColor(route.avgAQI);
  const level = getAQILevel(route.avgAQI);
  const showAdjusted = sensitivityProfile !== 'normal' && route.adjustedAvgAQI !== route.avgAQI;

  const generateImage = useCallback(async () => {
    if (!cardRef.current) return null;
    setGenerating(true);
    try {
      // Generate at 2x for retina quality
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: '#000000',
      });
      return dataUrl;
    } catch {
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `airroute-${route.label.toLowerCase()}-report.png`;
    link.href = dataUrl;
    link.click();
  }, [generateImage, route.label]);

  const handleShare = useCallback(async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    // Convert data URL to blob for Web Share API
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], `airroute-${route.label.toLowerCase()}-report.png`, { type: 'image/png' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: 'AirRoute Report Card',
          text: `${sourceLabel} → ${destinationLabel} | AQI: ${route.avgAQI} (${level})`,
          files: [file],
        });
      } catch {
        // User cancelled or share failed — ignore
      }
    } else {
      // Fallback to download
      handleDownload();
    }
  }, [generateImage, route, sourceLabel, destinationLabel, level, handleDownload]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mx-4 flex max-w-[420px] flex-col gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── The Card (captured as image) ── */}
          <div
            ref={cardRef}
            style={{
              width: 380,
              background: 'linear-gradient(165deg, #0c0c0c 0%, #000000 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              overflow: 'hidden',
              fontFamily: "'Satoshi', -apple-system, BlinkMacSystemFont, sans-serif",
              color: '#ffffff',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '24px 24px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.16em',
                textTransform: 'uppercase' as const,
                color: 'rgba(255,255,255,0.4)',
                marginBottom: 8,
              }}>
                AQI Report Card
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: 700,
                lineHeight: 1.3,
                letterSpacing: '-0.02em',
              }}>
                {sourceLabel}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.4)',
                margin: '4px 0',
              }}>
                →
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: 700,
                lineHeight: 1.3,
                letterSpacing: '-0.02em',
              }}>
                {destinationLabel}
              </div>
            </div>

            {/* AQI Hero */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <div>
                <div style={{
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase' as const,
                  color: 'rgba(255,255,255,0.45)',
                  marginBottom: 6,
                }}>
                  Average AQI
                </div>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 900,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: 1,
                  color: color,
                  letterSpacing: '-0.04em',
                }}>
                  {route.avgAQI}
                </div>
                {showAdjusted && (
                  <div style={{
                    fontSize: '11px',
                    color: '#fbbf24',
                    marginTop: 4,
                  }}>
                    Adjusted: {route.adjustedAvgAQI} ({getSensitivityLabel(sensitivityProfile)})
                  </div>
                )}
              </div>
              <div style={{
                padding: '6px 14px',
                borderRadius: 9999,
                fontSize: '12px',
                fontWeight: 600,
                color: color,
                border: `1px solid ${color}33`,
                background: `${color}14`,
              }}>
                {level}
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1px',
              background: 'rgba(255,255,255,0.06)',
            }}>
              <StatCell label="Distance" value={`${route.distanceKm.toFixed(1)} km`} />
              <StatCell label="Duration" value={`${route.etaMin} min`} />
              <StatCell label="Cigarette Eq." value={toExposureScore(route.avgAQI)} />
              <StatCell label="Inhaled PM2.5" value={`${route.respiratoryDose.doseUg} μg`} />
            </div>

            {/* Pollutant Breakdown */}
            <div style={{ padding: '16px 24px' }}>
              <div style={{
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.14em',
                textTransform: 'uppercase' as const,
                color: 'rgba(255,255,255,0.4)',
                marginBottom: 10,
              }}>
                Pollutant Breakdown
              </div>
              <PollutantBar label="PM2.5" value={route.breakdown.pm25} />
              <PollutantBar label="PM10" value={route.breakdown.pm10} />
              <PollutantBar label="Ozone" value={route.breakdown.o3} />
            </div>

            {/* Route badge */}
            <div style={{
              padding: '0 24px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <div style={{
                padding: '4px 12px',
                borderRadius: 9999,
                fontSize: '11px',
                fontWeight: 600,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)',
              }}>
                {route.label} Route
              </div>
              <div style={{
                padding: '4px 12px',
                borderRadius: 9999,
                fontSize: '11px',
                fontWeight: 500,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.5)',
              }}>
                {route.respiratoryDose.modeLabel}
              </div>
            </div>

            {CARD_FOOTER}
          </div>

          {/* ── Action Buttons ── */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={generating}
              className="glass-button flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {generating ? 'Generating...' : 'Save PNG'}
            </button>
            <button
              onClick={handleShare}
              disabled={generating}
              className="glass-button flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium disabled:opacity-50"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
            <button
              onClick={onClose}
              className="glass-button--ghost flex items-center justify-center rounded-xl border border-white/20 p-3"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Stat Cell (inline styles for html-to-image compatibility) ── */
function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      padding: '14px 24px',
      background: '#0c0c0c',
    }}>
      <div style={{
        fontSize: '10px',
        fontWeight: 500,
        letterSpacing: '0.12em',
        textTransform: 'uppercase' as const,
        color: 'rgba(255,255,255,0.4)',
        marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '15px',
        fontWeight: 700,
        fontFamily: "'JetBrains Mono', monospace",
        color: 'rgba(255,255,255,0.9)',
      }}>
        {value}
      </div>
    </div>
  );
}

/* ── Pollutant Bar (inline styles for html-to-image) ── */
function PollutantBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, (value / 200) * 100);
  const barColor = getAQIColor(value);

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 4,
      }}>
        <span>{label}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
      </div>
      <div style={{
        height: 6,
        borderRadius: 3,
        background: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          borderRadius: 3,
          width: `${pct}%`,
          background: barColor,
        }} />
      </div>
    </div>
  );
}
