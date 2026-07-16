"use client";

import { Moon, Sun, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { SleepType } from "@/constants/sleep";
import {
  useDeleteSleepEntry,
  usePatchSleep,
  useSleepSummary,
  useStartSleep,
} from "@/hooks/use-sleep";
import { useLiveTimer } from "@/hooks/use-live-timer";
import { minutesToHoursMinutes } from "@/utils/age";
import {
  formatDateTime,
  formatFeedingDateTime,
  getNowLocalTime,
  getTodayLocal,
} from "@/utils/date";
import {
  formatElapsedTimer,
  formatTimeFromIso,
  sleepDurationMinutes,
} from "@/utils/sleep";
import type { Locale } from "@/types";
import { LiveTimerCircle } from "@/components/shared/live-timer-circle";
import { IdoPanel } from "@/components/idoland/ido-panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

interface DashboardSleepSectionProps {
  babyId: string;
}

interface CompletedSummary {
  type: SleepType;
  endTime: string;
  durationMinutes: number;
  durationLabel: string;
}

export function DashboardSleepSection({ babyId }: DashboardSleepSectionProps) {
  const t = useTranslations("sleep");
  const td = useTranslations("dashboard");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;

  const today = getTodayLocal();
  const [type, setType] = useState<SleepType>("nap");
  const [completedSummary, setCompletedSummary] = useState<CompletedSummary | null>(null);

  const { data: summary, isLoading } = useSleepSummary(babyId, today);
  const startSleep = useStartSleep(babyId);
  const patchSleep = usePatchSleep(babyId);
  const deleteEntry = useDeleteSleepEntry(babyId);

  const active = summary?.activeEntry;
  const isSleeping = !!active;
  const timerLabel = useLiveTimer(isSleeping ? active?.startTime : null);

  useEffect(() => {
    if (active) setType(active.type);
  }, [active?.type, active?._id]);

  async function handleTypeChange(nextType: SleepType) {
    setType(nextType);
    if (active && nextType !== active.type) {
      try {
        await patchSleep.mutateAsync({ id: active._id, data: { type: nextType } });
      } catch {
        toast.error(tc("error"));
      }
    }
  }

  async function handleTimerPress() {
    try {
      if (isSleeping && active) {
        const durationAtStop = timerLabel;
        const ended = await patchSleep.mutateAsync({
          id: active._id,
          data: { date: today, time: getNowLocalTime() },
        });
        if (ended.endTime) {
          const durationMinutes = sleepDurationMinutes(ended);
          setCompletedSummary({
            type: ended.type,
            endTime: ended.endTime,
            durationMinutes,
            durationLabel: durationAtStop,
          });
        }
        toast.success(t("sleepEnded"));
      } else {
        await startSleep.mutateAsync({
          babyId,
          type,
          date: today,
          time: getNowLocalTime(),
        });
        setCompletedSummary(null);
        toast.success(t("sleepStarted"));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : tc("error");
      toast.error(message === "Active sleep session exists" ? t("alreadySleeping") : message);
    }
  }

  const isNap = type === "nap";
  const sleepTheme = isNap ? "amber" : "indigo";

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

        {/* Sun / Moon type toggle — always visible */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-full border border-[var(--stroke)] bg-white/90 p-1 shadow-sm">
            <button
              type="button"
              onClick={() => handleTypeChange("nap")}
              className={cn(
                "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition",
                isNap
                  ? "bg-amber-400 text-white shadow-md"
                  : "text-muted-foreground hover:bg-amber-50 hover:text-amber-800"
              )}
            >
              <Sun className="size-5" />
              {t("nap")}
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("night")}
              className={cn(
                "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition",
                !isNap
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-muted-foreground hover:bg-indigo-50 hover:text-indigo-800"
              )}
            >
              <Moon className="size-5" />
              {t("night")}
            </button>
          </div>
        </div>

        {/* Running timer button */}
        <div className="flex flex-col items-center gap-3">
          <LiveTimerCircle
            isActive={isSleeping}
            timerLabel={timerLabel}
            onPress={handleTimerPress}
            disabled={startSleep.isPending || patchSleep.isPending}
            idleIcon={
              isNap ? (
                <Sun className="size-10 text-amber-500" />
              ) : (
                <Moon className="size-10 text-indigo-500" />
              )
            }
            tapToStartLabel={t("tapToStart")}
            tapToStopLabel={t("tapToStop")}
            theme={sleepTheme}
          />

          {isSleeping && active && (
            <p className="text-sm text-muted-foreground">
              {t(active.type)} · {t("since")} {formatFeedingDateTime(active.startTime, locale)}
            </p>
          )}
        </div>

        {/* Summary after stop */}
        {completedSummary && !isSleeping && (
          <div
            className={cn(
              "rounded-2xl border-2 p-4 text-center",
              completedSummary.type === "nap"
                ? "border-amber-300 bg-amber-50"
                : "border-indigo-300 bg-indigo-50"
            )}
          >
            <p className="text-lg font-bold text-[var(--grass-deep)]">{t("sleepSummaryTitle")}</p>
            <p className="mt-2 text-sm font-semibold">{t(completedSummary.type)}</p>
            <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-[var(--ink)]">
              {completedSummary.durationLabel}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {minutesToHoursMinutes(completedSummary.durationMinutes, locale)} ·{" "}
              {t("endedAt", { time: formatTimeFromIso(completedSummary.endTime) })}
            </p>
            <button
              type="button"
              onClick={() => setCompletedSummary(null)}
              className="mt-3 text-xs font-semibold text-muted-foreground hover:underline"
            >
              {t("dismiss")}
            </button>
          </div>
        )}
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
                <li
                  className={cn(
                    "flex items-center gap-2 rounded-xl border p-3",
                    active.type === "nap"
                      ? "border-amber-200 bg-amber-50/60"
                      : "border-indigo-200 bg-indigo-50/60"
                  )}
                >
                  <span className="text-lg" aria-hidden>
                    {active.type === "nap" ? "☀️" : "🌙"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {t(active.type)} · {formatElapsedTimer(active.startTime)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("inProgress")} · {formatFeedingDateTime(active.startTime, locale)}
                    </p>
                  </div>
                </li>
              )}
              {completedLogs.map((entry) => (
                <li
                  key={entry._id}
                  className="flex items-center gap-2 rounded-xl border border-[var(--stroke)] bg-white/80 p-3"
                >
                  <span className="text-lg" aria-hidden>
                    {entry.type === "nap" ? "☀️" : "🌙"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {minutesToHoursMinutes(sleepDurationMinutes(entry), locale)} · {t(entry.type)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFeedingDateTime(entry.startTime, locale).split(" · ")[1]}
                      {entry.endTime &&
                        ` – ${formatTimeFromIso(entry.endTime)}`}
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
