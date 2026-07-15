import { lmsZ } from "@flame-cai/anthro";
import monthLhfa from "@flame-cai/anthro/data/month_lhfa.json";
import monthWfa from "@flame-cai/anthro/data/month_wfa.json";
import monthHcfa from "@/data/month-hcfa.json";
import { anthro } from "@/lib/anthro";
import { parseBirthDate } from "@/utils/age";
import { toDateOnlyString } from "@/utils/date";
import type { Gender } from "@/types";

const DAYS_PER_MONTH = 30.4375;

export type GrowthMetric = "weight" | "height" | "head";

export const CHART_PERCENTILES = [3, 15, 50, 85, 97] as const;

const PERCENTILE_Z: Record<(typeof CHART_PERCENTILES)[number], number> = {
  3: -1.8807936,
  15: -1.0364334,
  50: 0,
  85: 1.0364334,
  97: 1.8807936,
};

type SexKey = "M" | "F";

interface LmsRow {
  i: number[];
  l: number[];
  m: number[];
  s: number[];
}

interface LmsParams {
  L: number;
  M: number;
  S: number;
}

function toSexKey(gender: Gender): SexKey {
  return gender === "female" ? "F" : "M";
}

/** Normalize any date value to yyyy-MM-dd for WHO age lookup. */
export function normalizeGrowthDate(date: string): string {
  return toDateOnlyString(parseBirthDate(date.split("T")[0]));
}

export function isMeasurementAfterBirth(birthDate: string, measurementDate: string): boolean {
  const birth = parseBirthDate(normalizeGrowthDate(birthDate));
  const measured = parseBirthDate(normalizeGrowthDate(measurementDate));
  return measured.getTime() > birth.getTime();
}

export function getAgeInDays(birthDate: string, measurementDate: string): number | null {
  if (!isMeasurementAfterBirth(birthDate, measurementDate)) return null;
  const days = anthro.ageDays(
    normalizeGrowthDate(birthDate),
    normalizeGrowthDate(measurementDate)
  );
  return days == null || days < 0 ? null : days;
}

export function getAgeInMonths(birthDate: string, measurementDate: string): number | null {
  const days = getAgeInDays(birthDate, measurementDate);
  if (days == null) return null;
  return days / DAYS_PER_MONTH;
}

function interpolateLms(table: LmsRow, ageMonths: number): LmsParams | null {
  const months = table.i;
  if (!months.length) return null;

  const clamped = Math.max(0, Math.min(ageMonths, months[months.length - 1]));
  const lowerIdx = Math.floor(clamped);
  const upperIdx = Math.min(lowerIdx + 1, months.length - 1);
  const lowerMonth = months[lowerIdx];
  const upperMonth = months[upperIdx];

  if (lowerMonth === upperMonth) {
    return {
      L: table.l[lowerIdx],
      M: table.m[lowerIdx],
      S: table.s[lowerIdx],
    };
  }

  const t = (clamped - lowerMonth) / (upperMonth - lowerMonth);
  return {
    L: table.l[lowerIdx] + t * (table.l[upperIdx] - table.l[lowerIdx]),
    M: table.m[lowerIdx] + t * (table.m[upperIdx] - table.m[lowerIdx]),
    S: table.s[lowerIdx] + t * (table.s[upperIdx] - table.s[lowerIdx]),
  };
}

function getMetricLms(metric: GrowthMetric, sex: SexKey, ageMonths: number): LmsParams | null {
  const monthTable =
    metric === "head" ? monthHcfa : metric === "weight" ? monthWfa : monthLhfa;
  return interpolateLms(monthTable[sex], ageMonths);
}

export function zToPercentile(z: number): number {
  return normalCdf(z) * 100;
}

function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-ax * ax));
  return sign * y;
}

export function lmsValueAtZ(z: number, { L, M, S }: LmsParams): number {
  if (!isFinite(z) || !isFinite(M) || M <= 0) return NaN;
  if (Math.abs(L) < 1e-10) return M * Math.exp(S * z);
  const base = 1 + L * S * z;
  if (base <= 0) return NaN;
  return M * Math.pow(base, 1 / L);
}

export function computePercentile(
  metric: GrowthMetric,
  gender: Gender,
  birthDate: string,
  measurementDate: string,
  value: number
): number | null {
  const ageMonths = getAgeInMonths(birthDate, measurementDate);
  if (ageMonths == null) return null;

  const sex = toSexKey(gender);
  const dob = normalizeGrowthDate(birthDate);
  const measured = normalizeGrowthDate(measurementDate);

  if (metric === "head") {
    const lms = getMetricLms(metric, sex, ageMonths);
    if (!lms) return null;
    const z = lmsZ(value, lms.L, lms.M, lms.S);
    return z == null ? null : clampPercentile(zToPercentile(z));
  }

  const input = {
    mode: "day" as const,
    sex,
    dob,
    measured,
    ...(metric === "weight" ? { weight_kg: value } : { height_cm: value, measure: "L" as const }),
  };

  const result = anthro.compute(input);
  const z = metric === "weight" ? result.z_wfa : result.z_lhfa;
  return z == null ? null : clampPercentile(zToPercentile(z));
}

function clampPercentile(p: number): number {
  return Math.min(99.9, Math.max(0.1, p));
}

export interface PercentileCurvePoint {
  month: number;
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
}

export function buildPercentileCurves(
  metric: GrowthMetric,
  gender: Gender,
  maxMonths = 24
): PercentileCurvePoint[] {
  const sex = toSexKey(gender);
  const points: PercentileCurvePoint[] = [];

  for (let month = 0; month <= maxMonths; month += 0.5) {
    const lms = getMetricLms(metric, sex, month);
    if (!lms) continue;

    points.push({
      month,
      p3: lmsValueAtZ(PERCENTILE_Z[3], lms),
      p15: lmsValueAtZ(PERCENTILE_Z[15], lms),
      p50: lmsValueAtZ(PERCENTILE_Z[50], lms),
      p85: lmsValueAtZ(PERCENTILE_Z[85], lms),
      p97: lmsValueAtZ(PERCENTILE_Z[97], lms),
    });
  }

  return points;
}

export interface MeasurementPlotPoint {
  id: string;
  month: number;
  value: number;
  percentile: number | null;
  dateLabel: string;
}

export function gramsToKg(grams: number): number {
  return grams / 1000;
}

export function getMetricValue(
  metric: GrowthMetric,
  weightGrams?: number,
  heightCm?: number,
  headCm?: number
): number | null {
  if (metric === "weight") return weightGrams != null ? gramsToKg(weightGrams) : null;
  if (metric === "height") return heightCm ?? null;
  return headCm ?? null;
}

export function formatShortDate(date: string, locale = "he"): string {
  const d = parseBirthDate(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return locale === "he" ? `${dd}.${mm}.${yy}` : `${dd}/${mm}/${yy}`;
}
