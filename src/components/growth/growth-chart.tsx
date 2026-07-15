"use client";

import { Maximize2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Gender } from "@/types";
import { IdoButton } from "@/components/idoland/ido-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const CHART_PERCENTILES = [3, 15, 50, 85, 97];

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
  payload?: Array<{ payload: MeasurementPlotPoint }>;
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

interface ChartBodyProps {
  metric: GrowthMetric;
  gender: Gender;
  points: MeasurementPlotPoint[];
  expanded?: boolean;
  showPointLabels?: boolean;
}

function ChartBody({ metric, gender, points, expanded, showPointLabels }: ChartBodyProps) {
  const t = useTranslations("growth");
  const tc = useTranslations("common");

  const unit = metric === "weight" ? tc("kg") : tc("cm");
  const curves = useMemo(() => buildPercentileCurves(metric, gender), [metric, gender]);

  const scatterData = useMemo(
    () => points.filter((p) => p.percentile != null && isFinite(p.month) && isFinite(p.value)),
    [points]
  );

  const { yDomain, yTicks } = useMemo(() => {
    const values = [
      ...curves.flatMap((c) => [c.p3, c.p97]),
      ...scatterData.map((p) => p.value),
    ].filter((v) => isFinite(v));

    if (!values.length) {
      const ticks = metric === "weight" ? [2, 4, 6, 8, 10] : [30, 40, 50, 60, 70];
      return { yDomain: [ticks[0], ticks[ticks.length - 1]] as [number, number], yTicks: ticks };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = Math.max((max - min) * 0.08, metric === "weight" ? 0.5 : 2);
    const ticks = buildYTicks(Math.max(0, min - pad), max + pad, metric);
    return {
      yDomain: [ticks[0], ticks[ticks.length - 1]] as [number, number],
      yTicks: ticks,
    };
  }, [curves, scatterData, metric]);

  const metricLabel =
    metric === "weight" ? t("weightCurve") : metric === "height" ? t("heightCurve") : t("headCurve");

  const chartHeight = expanded ? "min(72vh, 640px)" : "320px";
  const margin = expanded
    ? { top: 28, right: 24, left: 8, bottom: 20 }
    : { top: 16, right: 12, left: 4, bottom: 12 };

  return (
    <div className="space-y-3">
      {!expanded && (
        <h3 className="text-center font-[family-name:var(--font-display)] text-base font-bold text-[var(--grass-deep)]">
          {metricLabel}
        </h3>
      )}

      <div className="w-full" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={curves} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis
              dataKey="month"
              type="number"
              domain={[0, 24]}
              ticks={[0, 3, 6, 9, 12, 15, 18, 21, 24]}
              tick={{ fontSize: expanded ? 12 : 11 }}
              label={{
                value: t("ageInMonths"),
                position: "insideBottom",
                offset: expanded ? -4 : -2,
                fontSize: expanded ? 12 : 11,
              }}
            />
            <YAxis
              domain={yDomain}
              ticks={yTicks}
              tickFormatter={(v) => formatYTick(Number(v), metric)}
              allowDecimals={false}
              tick={{ fontSize: expanded ? 12 : 11 }}
              width={expanded ? 52 : 48}
              label={{
                value: `${metric === "weight" ? t("weight") : metric === "height" ? t("height") : t("head")} (${unit})`,
                angle: -90,
                position: "insideLeft",
                fontSize: expanded ? 12 : 11,
                dx: expanded ? 12 : 8,
              }}
            />
            <Tooltip
              content={<CustomTooltip unit={unit} />}
              cursor={{ strokeDasharray: "3 3" }}
            />
            <Line
              type="monotone"
              dataKey="p97"
              stroke={CURVE_COLORS.p97}
              strokeDasharray="4 4"
              dot={false}
              strokeWidth={1.5}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="p85"
              stroke={CURVE_COLORS.p85}
              strokeDasharray="4 4"
              dot={false}
              strokeWidth={1.5}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="p50"
              stroke={CURVE_COLORS.p50}
              strokeDasharray="4 4"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="p15"
              stroke={CURVE_COLORS.p15}
              strokeDasharray="4 4"
              dot={false}
              strokeWidth={1.5}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="p3"
              stroke={CURVE_COLORS.p3}
              strokeDasharray="4 4"
              dot={false}
              strokeWidth={1.5}
              isAnimationActive={false}
            />
            {scatterData.map((point, index) => (
              <ReferenceDot
                key={point.id}
                x={point.month}
                y={point.value}
                r={expanded ? 7 : 5}
                fill="#0f172a"
                stroke="#fff"
                strokeWidth={2}
                ifOverflow="visible"
                label={
                  showPointLabels && point.percentile != null
                    ? {
                        value: `אחוזון ${point.percentile.toFixed(1)}`,
                        position: index % 2 === 0 ? "top" : "right",
                        fill: "#1d4ed8",
                        fontSize: expanded ? 12 : 10,
                        fontWeight: 700,
                      }
                    : undefined
                }
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap justify-center gap-3 text-[10px] text-muted-foreground sm:text-xs">
        {CHART_PERCENTILES.map((p) => (
          <span key={p} className="inline-flex items-center gap-1.5">
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

export function GrowthChart({ metric, gender, points }: GrowthChartProps) {
  const t = useTranslations("growth");
  const [expanded, setExpanded] = useState(false);

  const metricLabel =
    metric === "weight" ? t("weightCurve") : metric === "height" ? t("heightCurve") : t("headCurve");

  return (
    <>
      <div className="relative">
        <IdoButton
          type="button"
          variant="ghost"
          className="absolute top-0 start-0 z-10 gap-1.5 px-2 py-1 text-xs"
          onClick={() => setExpanded(true)}
        >
          <Maximize2 className="size-3.5" />
          {t("expandChart")}
        </IdoButton>
        <ChartBody metric={metric} gender={gender} points={points} />
      </div>

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent
          className="flex max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-5xl flex-col gap-4 overflow-y-auto p-4 sm:p-6"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle className="text-center font-[family-name:var(--font-display)] text-lg text-[var(--grass-deep)]">
              {metricLabel}
            </DialogTitle>
          </DialogHeader>
          <ChartBody
            metric={metric}
            gender={gender}
            points={points}
            expanded
            showPointLabels={points.length <= 4}
          />
          <p className="text-center text-xs text-muted-foreground">{t("whoStandardNote")}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatYTick(value: number, metric: GrowthMetric): string {
  if (metric === "weight") return Number(value.toFixed(1)).toString();
  return String(Math.round(value));
}

function buildYTicks(min: number, max: number, metric: GrowthMetric): number[] {
  if (metric === "weight") {
    const lo = Math.max(0, Math.floor(min));
    const hi = Math.ceil(max);
    const step = hi - lo <= 12 ? 2 : hi - lo <= 20 ? 4 : 5;
    const start = Math.floor(lo / step) * step;
    const ticks: number[] = [];
    for (let v = start; v <= hi; v += step) ticks.push(Number(v.toFixed(1)));
    return ticks.length >= 2 ? ticks : [lo, hi];
  }

  const lo = Math.max(0, Math.floor(min / 5) * 5);
  const hi = Math.ceil(max / 5) * 5;
  const step = hi - lo <= 40 ? 5 : 10;
  const ticks: number[] = [];
  for (let v = lo; v <= hi; v += step) ticks.push(v);
  return ticks.length >= 2 ? ticks : [lo, hi];
}
