"use client";

import { BarChart3 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useFeedingPeriodSummary } from "@/hooks/use-feeding";
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

interface FeedingPeriodSummaryProps {
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

export function FeedingPeriodSummaryPanel({ babyId, anchorDate }: FeedingPeriodSummaryProps) {
  const t = useTranslations("feeding");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const [period, setPeriod] = useState<FeedingPeriod>("day");

  const { data, isLoading } = useFeedingPeriodSummary(babyId, period, anchorDate);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-[var(--grass-deep)]" />
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
                  ? "bg-[var(--coral)] text-white shadow-sm"
                  : "text-[var(--ink)] hover:bg-[var(--grass)]/10"
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

          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard label={t("periodTotal")} value={`${data.grandTotal} ${tc("ml")}`} />
            <StatCard label={t("dailyAverage")} value={`${data.dailyAverage} ${tc("ml")}`} />
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--stroke)] bg-white/80">
            <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-[var(--stroke)] bg-[var(--grass)]/8 px-4 py-3 text-sm font-semibold text-[var(--grass-deep)]">
              <span>{tc("date")}</span>
              <span>{t("amount")}</span>
            </div>
            <ul className="max-h-72 divide-y divide-[var(--stroke)] overflow-y-auto">
              {[...data.days].reverse().map((row) => (
                <li
                  key={row.date}
                  className={cn(
                    "grid grid-cols-[1fr_auto] gap-3 px-4 py-3 text-sm",
                    row.total > 0 ? "text-[var(--ink)]" : "text-muted-foreground"
                  )}
                >
                  <span className="font-medium">{formatShortDate(row.date, locale)}</span>
                  <span className="font-semibold tabular-nums">
                    {row.total > 0 ? `${row.total} ${tc("ml")}` : "—"}
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
