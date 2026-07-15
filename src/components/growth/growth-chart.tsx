"use client";

import { Maximize2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import type { DotProps } from "recharts";
import type { Gender } from "@/types";
import { IdoButton } from "@/components/idoland/ido-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
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

const CHART_PERCENTILES = [3, 15, 50, 85, 97] as const;
const CURVE_KEYS = ["p97", "p85", "p50", "p15", "p3"] as const;

const LABEL_SLOTS = [
  { dx: 0, dy: -34 },
  { dx: 54, dy: -8 },
  { dx: -54, dy: -8 },
  { dx: 0, dy: 30 },
  { dx: 60, dy: -32 },
  { dx: -60, dy: -32 },
] as const;

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
}

function computeLabelPlacements(points: MeasurementPlotPoint[]) {
  const sorted = [...points].sort((a, b) => a.month - b.month);
  const placements = new Map<string, { dx: number; dy: number }>();

  for (let i = 0; i < sorted.length; i++) {
    const point = sorted[i];
    const nearby = sorted.filter((p, j) => j < i && Math.abs(p.month - point.month) < 0.8).length;
    placements.set(point.id, LABEL_SLOTS[nearby % LABEL_SLOTS.length]);
  }

  return placements;
}

function MeasurementDot({
  cx = 0,
  cy = 0,
  percentile,
  placement,
  expanded,
  active,
  showLabel,
  onActivate,
}: DotProps & {
  percentile: number;
  placement: { dx: number; dy: number };
  expanded?: boolean;
  active?: boolean;
  showLabel?: boolean;
  onActivate?: () => void;
}) {
  const r = expanded ? 7 : 5;
  const labelX = cx + placement.dx;
  const labelY = cy + placement.dy;

  return (
    <g
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
      style={{ cursor: "pointer" }}
    >
      {showLabel && (
        <line
          x1={cx}
          y1={cy}
          x2={labelX}
          y2={labelY + (placement.dy < 0 ? 8 : -8)}
          stroke="#93c5fd"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      )}
      <circle
        cx={cx}
        cy={cy}
        r={active ? r + 2 : r}
        fill={active ? "#1d4ed8" : "#0f172a"}
        stroke="#fff"
        strokeWidth={2}
      />
      {showLabel && (
        <>
          <rect x={labelX - 40} y={labelY - 12} width={80} height={22} rx={6} fill="#2563eb" />
          <text x={labelX} y={labelY + 3} textAnchor="middle" fill="#fff" fontSize={10} fontWeight={700}>
            אחוזון {percentile.toFixed(1)}
          </text>
        </>
      )}
    </g>
  );
}

function ChartBody({ metric, gender, points, expanded }: ChartBodyProps) {
  const t = useTranslations("growth");
  const tc = useTranslations("common");

  const unit = metric === "weight" ? tc("kg") : tc("cm");
  const curves = useMemo(() => buildPercentileCurves(metric, gender), [metric, gender]);

  const scatterData = useMemo(
    () => points.filter((p) => p.percentile != null && isFinite(p.month) && isFinite(p.value)),
    [points]
  );

  const labelPlacements = useMemo(() => computeLabelPlacements(scatterData), [scatterData]);

  const latestPointId = useMemo(() => {
    const sorted = [...scatterData].sort((a, b) => b.month - a.month);
    return sorted[0]?.id ?? null;
  }, [scatterData]);

  const [activePointId, setActivePointId] = useState<string | null>(null);

  useEffect(() => {
    setActivePointId(latestPointId);
  }, [latestPointId, metric]);

  const showSingleLabel = scatterData.length === 1;
  const resolvedActiveId = activePointId ?? latestPointId;

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

  const chartHeight = expanded ? "min(40vh, 360px)" : "300px";
  const margin = expanded
    ? { top: 40, right: 40, left: 4, bottom: 16 }
    : { top: 36, right: 32, left: 4, bottom: 12 };

  const curveEnd = curves[curves.length - 1];

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
            {scatterData.map((point) => {
              const placement = labelPlacements.get(point.id) ?? LABEL_SLOTS[0];
              const isActive = resolvedActiveId === point.id;
              const showLabel = showSingleLabel || isActive;

              return (
                <ReferenceDot
                  key={point.id}
                  x={point.month}
                  y={point.value}
                  r={0}
                  fill="transparent"
                  stroke="none"
                  ifOverflow="visible"
                  shape={(props) => (
                    <MeasurementDot
                      {...props}
                      percentile={point.percentile!}
                      placement={placement}
                      expanded={expanded}
                      active={isActive}
                      showLabel={showLabel}
                      onActivate={() => setActivePointId(point.id)}
                    />
                  )}
                />
              );
            })}
            {curveEnd &&
              CURVE_KEYS.map((key, index) => (
                <ReferenceDot
                  key={`curve-label-${key}`}
                  x={24}
                  y={curveEnd[key]}
                  r={0}
                  fill="transparent"
                  stroke="none"
                  ifOverflow="visible"
                  label={{
                    value: String(CHART_PERCENTILES[index]),
                    position: "right",
                    fill: CURVE_COLORS[key],
                    fontSize: expanded ? 12 : 11,
                    fontWeight: 600,
                    dx: 6,
                  }}
                />
              ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {scatterData.length > 1 && (
        <div className="space-y-2">
          <p className="text-center text-[11px] text-muted-foreground">{t("chartPointHint")}</p>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[...scatterData]
              .sort((a, b) => b.month - a.month)
              .map((point) => (
                <button
                  key={point.id}
                  type="button"
                  onClick={() => setActivePointId(point.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    resolvedActiveId === point.id
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                      : "border-[var(--stroke)] bg-white/90 text-[var(--ink)] hover:border-blue-300"
                  )}
                >
                  {point.dateLabel} · {t("percentile")} {point.percentile?.toFixed(1)}
                </button>
              ))}
          </div>
        </div>
      )}

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
          className="flex w-[min(96vw,1280px)] !max-w-[min(96vw,1280px)] flex-col gap-3 overflow-hidden p-4 sm:!max-w-[min(96vw,1280px)] sm:p-5"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle className="text-center font-[family-name:var(--font-display)] text-lg text-[var(--grass-deep)]">
              {metricLabel}
            </DialogTitle>
          </DialogHeader>
          <ChartBody metric={metric} gender={gender} points={points} expanded />
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
