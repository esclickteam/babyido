"use client";

import { Moon, MoonStar, Sun, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { SLEEP_TYPES, type SleepType } from "@/constants/sleep";
import {
  useDeleteSleepEntry,
  useEndSleep,
  useSleepSummary,
  useStartSleep,
} from "@/hooks/use-sleep";
import { minutesToHoursMinutes } from "@/utils/age";
import {
  formatDateTime,
  formatFeedingDateTime,
  getNowLocalTime,
  getTodayLocal,
} from "@/utils/date";
import { sleepDurationMinutes } from "@/utils/sleep";
import type { Locale } from "@/types";
import { IdoButton } from "@/components/idoland/ido-button";
import { IdoPanel } from "@/components/idoland/ido-panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

interface DashboardSleepSectionProps {
  babyId: string;
}

export function DashboardSleepSection({ babyId }: DashboardSleepSectionProps) {
  const t = useTranslations("sleep");
  const td = useTranslations("dashboard");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;

  const today = getTodayLocal();
  const [type, setType] = useState<SleepType>("nap");

  const { data: summary, isLoading } = useSleepSummary(babyId, today);
  const startSleep = useStartSleep(babyId);
  const endSleep = useEndSleep(babyId);
  const deleteEntry = useDeleteSleepEntry(babyId);

  const active = summary?.activeEntry;
  const isSleeping = !!active;

  async function handleToggleSleep() {
    try {
      if (isSleeping && active) {
        await endSleep.mutateAsync({
          id: active._id,
          data: { date: today, time: getNowLocalTime() },
        });
        toast.success(t("sleepEnded"));
      } else {
        await startSleep.mutateAsync({
          babyId,
          type,
          date: today,
          time: getNowLocalTime(),
        });
        toast.success(t("sleepStarted"));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : tc("error");
      toast.error(message === "Active sleep session exists" ? t("alreadySleeping") : message);
    }
  }

  const completedLogs = [...(summary?.entries ?? [])]
    .filter((e) => e.endTime)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
      <IdoPanel className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Moon className="size-5 text-indigo-600" />
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--grass-deep)]">
                {td("todaySleep")}
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {td("todayDate", { date: formatDateTime(new Date(), locale).split(" · ")[0] })}
            </p>
          </div>
          <Link
            href="/dashboard/sleep"
            className="text-sm font-semibold text-[var(--coral)] hover:underline"
          >
            {t("viewFull")}
          </Link>
        </div>

        {isLoading ? (
          <Skeleton className="h-20 w-full rounded-2xl" />
        ) : summary ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 text-center">
              <p className="text-xs font-semibold text-indigo-700">{t("totalToday")}</p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold text-indigo-900">
                {minutesToHoursMinutes(summary.totalMinutes, locale)}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-center">
              <p className="text-xs font-semibold text-amber-700">{t("nap")}</p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold text-amber-900">
                {minutesToHoursMinutes(summary.napMinutes, locale)}
              </p>
            </div>
            <div className="rounded-2xl border border-violet-200 bg-violet-50/80 p-4 text-center">
              <p className="text-xs font-semibold text-violet-700">{t("night")}</p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold text-violet-900">
                {minutesToHoursMinutes(summary.nightMinutes, locale)}
              </p>
            </div>
          </div>
        ) : null}

        {active && (
          <div className="flex items-center gap-3 rounded-2xl border border-indigo-300 bg-gradient-to-l from-indigo-50 to-white p-4">
            <span className="text-2xl animate-pulse" aria-hidden>
              😴
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-indigo-900">{t("sleepingNow")}</p>
              <p className="text-sm text-indigo-700">
                {t(active.type)} · {t("since")}{" "}
                {formatFeedingDateTime(active.startTime, locale)}
              </p>
            </div>
          </div>
        )}

        {!isSleeping && (
          <div className="flex gap-2">
            {SLEEP_TYPES.map((sleepType) => (
              <button
                key={sleepType}
                type="button"
                onClick={() => setType(sleepType)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                  type === sleepType
                    ? sleepType === "nap"
                      ? "border-amber-300 bg-amber-50 text-amber-900 shadow-sm"
                      : "border-violet-300 bg-violet-50 text-violet-900 shadow-sm"
                    : "border-[var(--stroke)] bg-white/80 text-muted-foreground hover:bg-white"
                )}
              >
                {sleepType === "nap" ? (
                  <Sun className="size-4" />
                ) : (
                  <MoonStar className="size-4" />
                )}
                {t(sleepType)}
              </button>
            ))}
          </div>
        )}

        <IdoButton
          wide
          onClick={handleToggleSleep}
          disabled={startSleep.isPending || endSleep.isPending}
          className={cn(
            isSleeping
              ? "bg-indigo-600 hover:bg-indigo-700"
              : type === "nap"
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-violet-600 hover:bg-violet-700"
          )}
        >
          {startSleep.isPending || endSleep.isPending
            ? tc("loading")
            : isSleeping
              ? t("endSleep")
              : t("startSleep")}
        </IdoButton>
      </IdoPanel>

      <IdoPanel className="flex min-h-[320px] flex-col p-4 sm:p-5 xl:min-h-0">
        <h3 className="mb-3 font-[family-name:var(--font-display)] text-base font-bold text-[var(--grass-deep)]">
          {t("sleepLogs")}
        </h3>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : completedLogs.length === 0 && !active ? (
          <p className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
            {t("noSleepToday")}
          </p>
        ) : (
          <ScrollArea className="flex-1 pr-2">
            <ul className="space-y-2">
              {active && (
                <li className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/60 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-indigo-900">
                      {t(active.type)} · {t("inProgress")}
                    </p>
                    <p className="text-xs text-indigo-700">
                      {formatFeedingDateTime(active.startTime, locale)}
                    </p>
                  </div>
                </li>
              )}
              {completedLogs.map((entry) => (
                <li
                  key={entry._id}
                  className="flex items-center gap-2 rounded-xl border border-[var(--stroke)] bg-white/80 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {minutesToHoursMinutes(sleepDurationMinutes(entry), locale)} · {t(entry.type)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFeedingDateTime(entry.startTime, locale)}
                      {entry.endTime && ` – ${formatFeedingDateTime(entry.endTime, locale).split(" · ")[1]}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteEntry.mutate(entry._id)}
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg",
                      "text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                    )}
                    aria-label={tc("delete")}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </IdoPanel>
    </div>
  );
}
