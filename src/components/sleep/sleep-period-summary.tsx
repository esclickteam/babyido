"use client";

import { BarChart3 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useSleepPeriodSummary } from "@/hooks/use-sleep";
import { minutesToHoursMinutes } from "@/utils/age";
import { formatShortDate, type FeedingPeriod } from "@/utils/date";
import type { Locale } from "@/types";
import { StatCard } from "@/components/shared/stat-card";
import { cn } from "@/lib/utils";

const PERIODS: FeedingPeriod[] = ["day", "week", "month"];

const periodKeys: Record<FeedingPeriod, "today" | "week" | "month"> = {
  day: "today",
  week: "week",
  month: "month",
};

interface SleepPeriodSummaryPanelProps {
  babyId: string;
  anchorDate: string;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--grass-deep)]">
      {children}
    </h3>
  );
}

export function SleepPeriodSummaryPanel({ babyId, anchorDate }: SleepPeriodSummaryPanelProps) {
  const t = useTranslations("sleep");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const [period, setPeriod] = useState<FeedingPeriod>("day");

  const { data, isLoading } = useSleepPeriodSummary(babyId, period, anchorDate);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-indigo-600" />
          <SectionTitle>{t("periodSummary")}</SectionTitle>
        </div>
        <div className="flex rounded-2xl border border-[var(--stroke)] bg-white/80 p-1 shadow-sm">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-semibold transition",
                period === p
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-[var(--ink)] hover:bg-indigo-50"
              )}
            >
              {tc(periodKeys[p])}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-10 animate-pulse rounded-2xl bg-white/50" />
          <div className="h-32 animate-pulse rounded-2xl bg-white/50" />
        </div>
      ) : data ? (
        <>
          <p className="text-sm font-medium text-muted-foreground">{data.periodLabel}</p>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label={t("periodTotal")}
              value={minutesToHoursMinutes(data.grandTotal, locale)}
            />
            <StatCard
              label={t("napTotal")}
              value={minutesToHoursMinutes(data.napGrandTotal, locale)}
            />
            <StatCard
              label={t("nightTotal")}
              value={minutesToHoursMinutes(data.nightGrandTotal, locale)}
            />
          </div>

          {period !== "day" && (
            <p className="text-sm text-muted-foreground">
              {t("dailyAverage")}: {minutesToHoursMinutes(data.dailyAverage, locale)}
            </p>
          )}

          <div className="overflow-hidden rounded-2xl border border-[var(--stroke)] bg-white/80">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 border-b border-[var(--stroke)] bg-indigo-50/60 px-4 py-3 text-xs font-semibold text-indigo-900 sm:text-sm">
              <span>{tc("date")}</span>
              <span className="text-center">{t("nap")}</span>
              <span className="text-center">{t("night")}</span>
              <span className="text-left">{t("total")}</span>
            </div>
            <ul className="max-h-72 divide-y divide-[var(--stroke)] overflow-y-auto">
              {[...data.days].reverse().map((row) => (
                <li
                  key={row.date}
                  className={cn(
                    "grid grid-cols-[1fr_auto_auto_auto] gap-2 px-4 py-3 text-xs sm:text-sm",
                    row.total > 0 ? "text-[var(--ink)]" : "text-muted-foreground"
                  )}
                >
                  <span className="font-medium">{formatShortDate(row.date, locale)}</span>
                  <span className="text-center tabular-nums">
                    {row.napTotal > 0 ? minutesToHoursMinutes(row.napTotal, locale) : "—"}
                  </span>
                  <span className="text-center tabular-nums">
                    {row.nightTotal > 0 ? minutesToHoursMinutes(row.nightTotal, locale) : "—"}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {row.total > 0 ? minutesToHoursMinutes(row.total, locale) : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}
