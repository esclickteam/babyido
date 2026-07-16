"use client";

import { Baby, Clock, Sparkles, Trash2, TrendingUp } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import {
  useDeleteTummyTimeEntry,
  useEndTummyTime,
  useStartTummyTime,
  useTummyTimeSummary,
} from "@/hooks/use-tummy-time";
import { useLiveTimer } from "@/hooks/use-live-timer";
import { TUMMY_TIME_DAILY_GOAL_MINUTES } from "@/constants/tummy-time";
import { minutesToHoursMinutes } from "@/utils/age";
import { getNowLocalTime, getTodayLocal } from "@/utils/date";
import { formatTimeFromIso, sleepDurationMinutes } from "@/utils/sleep";
import type { Locale } from "@/types";
import { LiveTimerCircle } from "@/components/shared/live-timer-circle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

interface TummyTimeTrackerProps {
  babyId: string;
  variant?: "dashboard" | "page";
}

export function TummyTimeTracker({ babyId, variant = "dashboard" }: TummyTimeTrackerProps) {
  const t = useTranslations("tummyTime");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const today = getTodayLocal();
  const [completedMinutes, setCompletedMinutes] = useState<number | null>(null);
  const [completedDuration, setCompletedDuration] = useState<string | null>(null);

  const { data: summary, isLoading } = useTummyTimeSummary(babyId, today);
  const start = useStartTummyTime(babyId);
  const end = useEndTummyTime(babyId);
  const deleteEntry = useDeleteTummyTimeEntry(babyId);

  const active = summary?.activeEntry;
  const isActive = !!active;
  const timerLabel = useLiveTimer(active?.startTime);

  const goalPercent = Math.min(
    100,
    Math.round(((summary?.totalMinutes ?? 0) / TUMMY_TIME_DAILY_GOAL_MINUTES) * 100)
  );

  async function handleTimer() {
    try {
      if (isActive && active) {
        const durationAtStop = timerLabel;
        const ended = await end.mutateAsync({
          id: active._id,
          data: { date: today, time: getNowLocalTime() },
        });
        if (ended.endTime) {
          setCompletedMinutes(sleepDurationMinutes(ended));
          setCompletedDuration(durationAtStop);
        }
        toast.success(t("sessionEnded"));
      } else {
        await start.mutateAsync({ babyId, date: today, time: getNowLocalTime() });
        setCompletedMinutes(null);
        setCompletedDuration(null);
        toast.success(t("sessionStarted"));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : tc("error");
      toast.error(msg.includes("Active") ? t("alreadyActive") : msg);
    }
  }

  const logs = [...(summary?.entries ?? [])].filter((e) => e.endTime);
  const isPage = variant === "page";

  const content = (
    <div className={cn("space-y-5", isPage && "mx-auto w-full max-w-2xl")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-md ring-2 ring-orange-200/80">
            <span className="absolute inset-0 animate-pulse rounded-2xl bg-white/10" />
            <Baby className="relative size-6 ms-icon-float" strokeWidth={2.2} />
          </div>
          <div>
            <h2
              className={cn(
                "font-[family-name:var(--font-display)] font-bold text-[var(--grass-deep)]",
                isPage ? "text-xl" : "text-xl"
              )}
            >
              {t("title")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>
        {!isPage && (
          <Link
            href="/dashboard/tummy-time"
            className="text-sm font-semibold text-[var(--coral)] hover:underline"
          >
            {t("viewFull")}
          </Link>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-2xl" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-l from-orange-50 via-white to-amber-50/40 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-orange-800">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="size-3.5" />
              {t("todayTotal")}
            </span>
            <span>{goalPercent}% {t("ofGoal")}</span>
          </div>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-orange-900">
            {minutesToHoursMinutes(summary?.totalMinutes ?? 0, locale)}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
            <div
              className="h-full rounded-full bg-gradient-to-l from-orange-500 to-amber-400 transition-all duration-500"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-orange-700">
            {t("dailyGoal", { minutes: TUMMY_TIME_DAILY_GOAL_MINUTES })}
          </p>
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <LiveTimerCircle
          isActive={isActive}
          timerLabel={timerLabel}
          onPress={handleTimer}
          disabled={start.isPending || end.isPending}
          idleIcon={<Baby className="size-9 text-orange-600 ms-icon-float" strokeWidth={2} />}
          tapToStartLabel={t("tapToStart")}
          tapToStopLabel={t("tapToStop")}
          theme="orange"
          size={isPage ? "lg" : "md"}
        />
        {isActive && active && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="size-3.5 text-orange-600 ms-icon-wiggle" />
            {t("since")} {formatTimeFromIso(active.startTime)}
          </p>
        )}
      </div>

      {completedMinutes !== null && !isActive && (
        <div className="ms-card-enter rounded-2xl border-2 border-orange-300 bg-gradient-to-l from-orange-50 to-white p-4 text-center shadow-sm">
          <p className="flex items-center justify-center gap-1.5 text-base font-bold text-orange-900">
            <Sparkles className="size-4 text-amber-500" />
            {t("sessionSummary")}
          </p>
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-[var(--ink)]">
            {completedDuration ?? "0:00:00"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {minutesToHoursMinutes(completedMinutes, locale)} · {getNowLocalTime()}
          </p>
          <button
            type="button"
            onClick={() => {
              setCompletedMinutes(null);
              setCompletedDuration(null);
            }}
            className="mt-3 text-xs font-semibold text-muted-foreground hover:underline"
          >
            {t("dismiss")}
          </button>
        </div>
      )}

      {isPage && (
        <div className="rounded-xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm leading-relaxed text-orange-900/90">
          <p className="font-bold">{t("whyTitle")}</p>
          <p className="mt-1 text-xs text-orange-800/90">{t("whyBody")}</p>
        </div>
      )}

      {logs.length > 0 && (
        <div>
          <h3 className="mb-2 px-1 text-sm font-bold text-[var(--grass-deep)]">{t("sessionsToday")}</h3>
          <ScrollArea className={isPage ? "max-h-64" : "max-h-36"}>
            <ul className="space-y-2">
              {logs.map((e) => (
                <li
                  key={e._id}
                  className="flex items-center gap-3 rounded-xl border border-[var(--stroke)]/60 bg-white/90 px-3 py-2.5 text-sm shadow-sm"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-100">
                    <Baby className="size-4 text-orange-700" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {minutesToHoursMinutes(sleepDurationMinutes(e), locale)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeFromIso(e.startTime)} – {formatTimeFromIso(e.endTime!)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteEntry.mutate(e._id)}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                    aria-label={tc("delete")}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}
    </div>
  );

  if (isPage) return content;

  return <div className="ido-panel ido-sprout space-y-5 p-5 sm:p-6">{content}</div>;
}
