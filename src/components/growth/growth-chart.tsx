"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Gender } from "@/types";
import {
  buildPercentileCurves,
  type GrowthMetric,
  type MeasurementPlotPoint,
} from "@/utils/growth-percentile";

const CURVE_COLORS: Record<string, string> = {
  p97: "#f59e0b",
  p85: "#fdba74",
  p50: "#64748b",
  p15: "#93c5fd",
  p3: "#3b82f6",
};

interface GrowthChartProps {
  metric: GrowthMetric;
  gender: Gender;
  points: MeasurementPlotPoint[];
}

function CustomTooltip({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ payload: MeasurementPlotPoint & { percentileLabel?: string } }>;
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (data?.percentile == null) return null;

  return (
    <div className="rounded-lg border border-[var(--stroke)] bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-bold text-[var(--grass-deep)]">אחוזון {data.percentile.toFixed(1)}</p>
      <p className="text-muted-foreground">
        {data.dateLabel} · {data.value} {unit}
      </p>
    </div>
  );
}

export function GrowthChart({ metric, gender, points }: GrowthChartProps) {
  const t = useTranslations("growth");
  const tc = useTranslations("common");

  const unit = metric === "weight" ? tc("kg") : tc("cm");
  const curves = useMemo(() => buildPercentileCurves(metric, gender), [metric, gender]);

  const scatterData = useMemo(
    () =>
      points
        .filter((p) => p.percentile != null)
        .map((p) => ({
          ...p,
          percentile: p.percentile!,
        })),
    [points]
  );

  const yDomain = useMemo(() => {
    const values = [
      ...curves.flatMap((c) => [c.p3, c.p97]),
      ...scatterData.map((p) => p.value),
    ].filter((v) => isFinite(v));
    if (!values.length) return [0, 10] as [number, number];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min) * 0.08 || 1;
    return [Math.max(0, min - pad), max + pad] as [number, number];
  }, [curves, scatterData]);

  const metricLabel =
    metric === "weight" ? t("weightCurve") : metric === "height" ? t("heightCurve") : t("headCurve");

  return (
    <div className="space-y-3">
      <h3 className="text-center font-[family-name:var(--font-display)] text-base font-bold text-[var(--grass-deep)]">
        {metricLabel}
      </h3>

      <div className="h-[320px] w-full sm:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={curves} margin={{ top: 12, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis
              dataKey="month"
              type="number"
              domain={[0, 24]}
              ticks={[0, 3, 6, 9, 12, 15, 18, 21, 24]}
              tick={{ fontSize: 11 }}
              label={{
                value: t("ageInMonths"),
                position: "insideBottom",
                offset: -2,
                fontSize: 11,
              }}
            />
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 11 }}
              width={42}
              label={{
                value: `${metric === "weight" ? t("weight") : metric === "height" ? t("height") : t("head")} (${unit})`,
                angle: -90,
                position: "insideLeft",
                fontSize: 11,
                dx: 8,
              }}
            />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Line type="monotone" dataKey="p97" stroke={CURVE_COLORS.p97} strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
            <Line type="monotone" dataKey="p85" stroke={CURVE_COLORS.p85} strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
            <Line type="monotone" dataKey="p50" stroke={CURVE_COLORS.p50} strokeDasharray="4 4" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="p15" stroke={CURVE_COLORS.p15} strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
            <Line type="monotone" dataKey="p3" stroke={CURVE_COLORS.p3} strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
            <Scatter
              data={scatterData}
              dataKey="value"
              fill="#0f172a"
              shape={(props: { cx?: number; cy?: number; payload?: MeasurementPlotPoint }) => {
                const { cx = 0, cy = 0, payload } = props;
                if (payload?.percentile == null) return <g />;
                return (
                  <g>
                    <circle cx={cx} cy={cy} r={5} fill="#0f172a" stroke="#fff" strokeWidth={2} />
                    <rect x={cx - 36} y={cy - 34} width={72} height={22} rx={6} fill="#2563eb" />
                    <text x={cx} y={cy - 19} textAnchor="middle" fill="#fff" fontSize={10} fontWeight={700}>
                      אחוזון {payload.percentile.toFixed(1)}
                    </text>
                  </g>
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap justify-center gap-3 text-[10px] text-muted-foreground">
        {CHART_PERCENTILES.map((p) => (
          <span key={p} className="inline-flex items-center gap-1">
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: CURVE_COLORS[`p${p}` as keyof typeof CURVE_COLORS] }}
            />
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

const CHART_PERCENTILES = [3, 15, 50, 85, 97];
