export type AQIComponentBreakdown = {
  pm25: number;
  pm10: number;
  o3: number;
};

export type AQILevel = 'Good' | 'Moderate' | 'Unhealthy';

export function getAQIColor(aqi: number): string {
  if (aqi <= 50) return '#00FFD1';
  if (aqi <= 100) return '#FFD166';
  return '#FF3B5C';
}

export function getAQILevel(aqi: number): AQILevel {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  return 'Unhealthy';
}

export function clampAQI(aqi: number): number {
  return Math.max(0, Math.min(500, Math.round(aqi)));
}

export function toExposureScore(avgAqi: number): string {
  const cigarettes = Math.max(0, (avgAqi / 22) * 0.8);
  return `${cigarettes.toFixed(1)} cig eq/day`;
}

export function aqiBreakdownFromAverage(avgAqi: number): AQIComponentBreakdown {
  const pm25 = clampAQI(avgAqi * 1.05);
  const pm10 = clampAQI(avgAqi * 0.88);
  const o3 = clampAQI(avgAqi * 0.66);
  return { pm25, pm10, o3 };
}
