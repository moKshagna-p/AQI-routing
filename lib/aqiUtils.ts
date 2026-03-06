import { type TransportMode } from './routeUtils';

export type AQIComponentBreakdown = {
  pm25: number;
  pm10: number;
  o3: number;
};

export type AQILevel = 'Good' | 'Moderate' | 'USG' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';

export type SensitivityProfile = 'normal' | 'asthmatic' | 'child' | 'elderly' | 'pregnant';

/* ── EPA 6-tier AQI color scale (dark-background optimized) ── */

const AQI_TIERS = [
  { max: 50, color: '#00E400', label: 'Good' as const },
  { max: 100, color: '#FFD166', label: 'Moderate' as const },
  { max: 150, color: '#FF7E00', label: 'USG' as const },
  { max: 200, color: '#FF3B5C', label: 'Unhealthy' as const },
  { max: 300, color: '#8F3F97', label: 'Very Unhealthy' as const },
  { max: 500, color: '#7E0023', label: 'Hazardous' as const }
] as const;

export { AQI_TIERS };

export function getAQIColor(aqi: number): string {
  for (const tier of AQI_TIERS) {
    if (aqi <= tier.max) return tier.color;
  }
  return AQI_TIERS[AQI_TIERS.length - 1].color;
}

export function getAQILevel(aqi: number): AQILevel {
  for (const tier of AQI_TIERS) {
    if (aqi <= tier.max) return tier.label;
  }
  return 'Hazardous';
}

export function clampAQI(aqi: number): number {
  return Math.max(0, Math.min(500, Math.round(aqi)));
}

/* ── Sensitivity multipliers (EPA-based) ── */

const SENSITIVITY_MULTIPLIERS: Record<SensitivityProfile, number> = {
  normal: 1.0,
  asthmatic: 2.5,
  child: 1.8,
  elderly: 1.6,
  pregnant: 2.0
};

const SENSITIVITY_LABELS: Record<SensitivityProfile, string> = {
  normal: 'Normal',
  asthmatic: 'Asthmatic',
  child: 'Child',
  elderly: 'Elderly',
  pregnant: 'Pregnant'
};

export function getSensitivityLabel(profile: SensitivityProfile): string {
  return SENSITIVITY_LABELS[profile];
}

export function getSensitivityMultiplier(profile: SensitivityProfile): number {
  return SENSITIVITY_MULTIPLIERS[profile];
}

export function adjustedAQI(rawAQI: number, profile: SensitivityProfile): number {
  return clampAQI(rawAQI * SENSITIVITY_MULTIPLIERS[profile]);
}

/* ── Cigarette equivalence (Berkeley Earth, 2018) ── */

export function toExposureScore(avgAqi: number): string {
  const cigarettes = Math.max(0, (avgAqi / 22) * 0.8);
  return `${cigarettes.toFixed(1)} cig eq/day`;
}

/* ── Respiratory dose calculator ── */
/* EPA Exposure Factors Handbook ventilation rates (L/min) */

const VENTILATION_RATES: Record<TransportMode, number> = {
  walk: 25,
  bike: 40,
  car: 10
};

const MODE_LABELS: Record<TransportMode, string> = {
  walk: 'Walking',
  bike: 'Cycling',
  car: 'Driving'
};

export type RespiratoryDose = {
  doseUg: number;
  modeLabel: string;
  ventilationRate: number;
  comparisonToCar: number;
};

/**
 * Compute inhaled PM2.5 dose for a trip.
 * Dose (ug) = Concentration (ug/m3) * VentilationRate (L/min) * Duration (min) * 0.001 (L→m3)
 */
export function computeRespiratoryDose(
  avgPM25: number,
  durationMin: number,
  mode: TransportMode
): RespiratoryDose {
  const ventilationRate = VENTILATION_RATES[mode];
  const carVentilation = VENTILATION_RATES.car;
  const doseUg = avgPM25 * ventilationRate * durationMin * 0.001;
  const carDose = avgPM25 * carVentilation * durationMin * 0.001;

  return {
    doseUg: Math.round(doseUg * 10) / 10,
    modeLabel: MODE_LABELS[mode],
    ventilationRate,
    comparisonToCar: carDose > 0 ? Math.round((doseUg / carDose) * 10) / 10 : 1
  };
}

export function aqiBreakdownFromAverage(avgAqi: number): AQIComponentBreakdown {
  const pm25 = clampAQI(avgAqi * 1.05);
  const pm10 = clampAQI(avgAqi * 0.88);
  const o3 = clampAQI(avgAqi * 0.66);
  return { pm25, pm10, o3 };
}
