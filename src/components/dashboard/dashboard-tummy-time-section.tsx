"use client";

import { Baby, Square, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useDeleteTummyTimeEntry,
  useEndTummyTime,
  useStartTummyTime,
  useTummyTimeSummary,
} from "@/hooks/use-tummy-time";
import { TUMMY_TIME_DAILY_GOAL_MINUTES } from "@/constants/tummy-time";
import { minutesToHoursMinutes } from "@/utils/age";
import { getNowLocalTime, getTodayLocal } from "@/utils/date";
import { formatElapsedTimer, formatTimeFromIso, sleepDurationMinutes } from "@/utils/sleep";
import type { Locale } from "@/types";
import { IdoPanel } from "@/components/idoland/ido-panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

interface DashboardTummyTimeSectionProps {
  babyId: string;
}

export function DashboardTummyTimeSection({ babyId }: DashboardTummyTimeSectionProps) {
  const t = useTranslations("tummyTime");
  const td = useTranslations("dashboard");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const today = getTodayLocal();
  const [timerTick, setTimerTick] = useState(0);
  const [completedMinutes, setCompletedMinutes] = useState<number | null>(null);

  const { data: summary, isLoading } = useTummyTimeSummary(babyId, today);
  const start = useStartTummyTime(babyId);
  const end = useEndTummyTime(babyId);
  const deleteEntry = useDeleteTummyTimeEntry(babyId);

  const active = summary?.activeEntry;
  const isActive = !!active;

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTimerTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [active?._id]);

  void timerTick;

  const elapsedLabel = active ? formatElapsedTimer(active.startTime) : "00:00";
  const goalPercent = Math.min(
    100,
    Math.round(((summary?.totalMinutes ?? 0) / TUMMY_TIME_DAILY_GOAL_MINUTES) * 100)
  );

  async function handleTimer() {
    try {
      if (isActive && active) {
        const ended = await end.mutateAsync({
          id: active._id,
          data: { date: today, time: getNowLocalTime() },
        });
        if (ended.endTime) {
          setCompletedMinutes(sleepDurationMinutes(ended));
        }
        toast.success(t("sessionEnded"));
      } else {
        await start.mutateAsync({ babyId, date: today, time: getNowLocalTime() });
        setCompletedMinutes(null);
        toast.success(t("sessionStarted"));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : tc("error");
      toast.error(msg.includes("Active") ? t("alreadyActive") : msg);
    }
  }

  const logs = [...(summary?.entries ?? [])].filter((e) => e.endTime);

  return (
    <IdoPanel className="space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Baby className="size-5 text-orange-600" />
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--grass-deep)]">
              {t("title")}
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link href="/dashboard/tummy-time" className="text-sm font-semibold text-[var(--coral)] hover:underline">
          {t("viewFull")}
        </Link>
      </div>

      {isLoading ? (
        <Skeleton className="h-20 w-full rounded-2xl" />
      ) : (
        <div className="rounded-2xl border border-orange-200 bg-orange-50/80 p-4">
          <div className="flex justify-between text-xs font-semibold text-orange-800">
            <span>{t("todayTotal")}</span>
            <span>{goalPercent}% {t("ofGoal")}</span>
          </div>
          <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-orange-900">
            {minutesToHoursMinutes(summary?.totalMinutes ?? 0, locale)}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/70">
            <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${goalPercent}%` }} />
          </div>
          <p className="mt-1 text-[11px] text-orange-700">
            {t("dailyGoal", { minutes: TUMMY_TIME_DAILY_GOAL_MINUTES })}
          </p>
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleTimer}
          disabled={start.isPending || end.isPending}
          className={cn(
            "relative flex size-36 flex-col items-center justify-center gap-2 rounded-full border-4 transition-all active:scale-95 sm:size-40",
            isActive
              ? "border-orange-400 bg-gradient-to-b from-orange-100 to-orange-50 shadow-lg shadow-orange-200/50"
              : "border-orange-300 bg-white hover:border-orange-400 hover:bg-orange-50"
          )}
        >
          {isActive && (
            <span className="absolute inset-0 animate-ping rounded-full bg-orange-400 opacity-20" />
          )}
          {isActive ? (
            <>
              <Square className="relative size-6 text-orange-700" />
              <span className="relative font-mono text-2xl font-bold text-orange-900">{elapsedLabel}</span>
              <span className="relative text-xs font-bold text-orange-700">{t("tapToStop")}</span>
            </>
          ) : (
            <>
              <Baby className="size-8 text-orange-600" />
              <span className="text-sm font-bold text-orange-800">{t("tapToStart")}</span>
            </>
          )}
        </button>
      </div>

      {completedMinutes !== null && (
        <div className="rounded-xl border border-orange-200 bg-white/90 p-3 text-center text-sm">
          <p className="font-bold text-orange-900">{t("sessionSummary")}</p>
          <p className="text-muted-foreground">
            {minutesToHoursMinutes(completedMinutes, locale)} · {getNowLocalTime()}
          </p>
        </div>
      )}

      {logs.length > 0 && (
        <ScrollArea className="max-h-36">
          <ul className="space-y-1.5">
            {logs.map((e) => (
              <li
                key={e._id}
                className="flex items-center justify-between rounded-xl border border-[var(--stroke)]/60 bg-white/80 px-3 py-2 text-sm"
              >
                <span>
                  {formatTimeFromIso(e.startTime)} – {formatTimeFromIso(e.endTime!)}
                  <span className="mr-2 text-muted-foreground">
                    ({minutesToHoursMinutes(sleepDurationMinutes(e), locale)})
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => deleteEntry.mutate(e._id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </IdoPanel>
  );
}
