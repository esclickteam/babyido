"use client";

import { Moon, MoonStar, Plus, Sun, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { SLEEP_TYPES, type SleepType } from "@/constants/sleep";
import { SleepPeriodSummaryPanel } from "@/components/sleep/sleep-period-summary";
import {
  useCreateSleepManual,
  useDeleteSleepEntry,
  useEndSleep,
  useSleepSummary,
  useStartSleep,
} from "@/hooks/use-sleep";
import { useBabyStore } from "@/stores/baby-store";
import { minutesToHoursMinutes } from "@/utils/age";
import {
  formatFeedingDateTime,
  getNowLocalTime,
  getTodayLocal,
} from "@/utils/date";
import { sleepDurationMinutes } from "@/utils/sleep";
import type { Locale } from "@/types";
import { HebrewDateInput } from "@/components/shared/hebrew-date-input";
import { IdoButton } from "@/components/idoland/ido-button";
import { IdoPanel } from "@/components/idoland/ido-panel";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { NoBabyPrompt } from "@/components/shared/no-baby-prompt";
import { StatCard } from "@/components/shared/stat-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const inputClass =
  "rounded-2xl border-[var(--stroke)] bg-white/90 py-3 shadow-sm focus-visible:ring-[var(--grass)]";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--grass-deep)]">
      {children}
    </h3>
  );
}

export function SleepContent() {
  const t = useTranslations("sleep");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const baby = useBabyStore((s) => s.getSelectedBaby());
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLDivElement>(null);

  const [selectedDate, setSelectedDate] = useState(getTodayLocal());
  const [type, setType] = useState<SleepType>("nap");
  const [startDate, setStartDate] = useState(getTodayLocal());
  const [startTime, setStartTime] = useState(getNowLocalTime());
  const [endDate, setEndDate] = useState(getTodayLocal());
  const [endTime, setEndTime] = useState(getNowLocalTime());
  const [notes, setNotes] = useState("");

  const { data: summary, isLoading } = useSleepSummary(baby?._id ?? null, selectedDate);
  const startSleep = useStartSleep(baby?._id ?? null);
  const endSleep = useEndSleep(baby?._id ?? null);
  const createManual = useCreateSleepManual(baby?._id ?? null);
  const deleteEntry = useDeleteSleepEntry(baby?._id ?? null);

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [searchParams]);

  if (!baby) return <NoBabyPrompt />;

  const active = summary?.activeEntry;

  async function handleQuickStart(sleepType: SleepType) {
    try {
      await startSleep.mutateAsync({
        babyId: baby!._id,
        type: sleepType,
        date: getTodayLocal(),
        time: getNowLocalTime(),
      });
      toast.success(t("sleepStarted"));
    } catch (err) {
      const message = err instanceof Error ? err.message : tc("error");
      toast.error(message === "Active sleep session exists" ? t("alreadySleeping") : message);
    }
  }

  async function handleQuickEnd() {
    if (!active) return;
    try {
      await endSleep.mutateAsync({
        id: active._id,
        data: { date: getTodayLocal(), time: getNowLocalTime() },
      });
      toast.success(t("sleepEnded"));
    } catch {
      toast.error(tc("error"));
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!baby) return;
    try {
      await createManual.mutateAsync({
        babyId: baby._id,
        type,
        startDate,
        startTime,
        endDate,
        endTime,
        notes: notes || undefined,
      });
      toast.success(t("sleepSaved"));
      setNotes("");
      setStartTime(getNowLocalTime());
      setEndTime(getNowLocalTime());
    } catch (err) {
      const message = err instanceof Error ? err.message : tc("error");
      toast.error(message);
    }
  }

  const logs = [...(summary?.entries ?? [])].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  return (
    <div className="space-y-6">
      <LegalDisclaimer variant="general" />

      {active && (
        <IdoPanel className="flex flex-col items-stretch gap-4 border-indigo-300 bg-gradient-to-l from-indigo-50 to-white p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-3xl animate-pulse" aria-hidden>😴</span>
            <div>
              <p className="font-semibold text-indigo-900">{t("sleepingNow")}</p>
              <p className="text-sm text-indigo-700">
                {t(active.type)} · {t("since")} {formatFeedingDateTime(active.startTime, locale)}
              </p>
            </div>
          </div>
          <IdoButton onClick={handleQuickEnd} disabled={endSleep.isPending} className="bg-indigo-600">
            {endSleep.isPending ? tc("loading") : t("endSleep")}
          </IdoButton>
        </IdoPanel>
      )}

      {!active && (
        <IdoPanel className="space-y-4 p-5 sm:p-6">
          <SectionTitle>{t("quickStart")}</SectionTitle>
          <p className="text-sm text-muted-foreground">{t("quickStartHint")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <IdoButton
              onClick={() => handleQuickStart("nap")}
              disabled={startSleep.isPending}
              className="bg-amber-500 hover:bg-amber-600"
            >
              <Sun className="size-4" />
              {t("startNap")}
            </IdoButton>
            <IdoButton
              onClick={() => handleQuickStart("night")}
              disabled={startSleep.isPending}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <MoonStar className="size-4" />
              {t("startNight")}
            </IdoButton>
          </div>
        </IdoPanel>
      )}

      <IdoPanel className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Moon className="size-5 text-indigo-600" />
            <SectionTitle>{t("dailySummary")}</SectionTitle>
          </div>
          <HebrewDateInput value={selectedDate} onChange={setSelectedDate} className="w-44" />
        </div>

        {isLoading ? (
          <div className="h-24 animate-pulse rounded-2xl bg-white/50" />
        ) : summary ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label={t("totalToday")}
              value={minutesToHoursMinutes(summary.totalMinutes, locale)}
            />
            <StatCard
              label={t("nap")}
              value={minutesToHoursMinutes(summary.napMinutes, locale)}
            />
            <StatCard
              label={t("night")}
              value={minutesToHoursMinutes(summary.nightMinutes, locale)}
            />
          </div>
        ) : null}

        <ul className="space-y-2">
          {logs.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">{t("noSleepToday")}</p>
          ) : (
            logs.map((entry) => (
              <li
                key={entry._id}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-4",
                  entry.endTime
                    ? "border-[var(--stroke)] bg-white/80"
                    : "border-indigo-200 bg-indigo-50/60"
                )}
              >
                <span className="text-xl" aria-hidden>
                  {entry.type === "nap" ? "☀️" : "🌙"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {entry.endTime
                      ? minutesToHoursMinutes(sleepDurationMinutes(entry), locale)
                      : t("inProgress")}
                    {" · "}
                    {t(entry.type)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatFeedingDateTime(entry.startTime, locale)}
                    {entry.endTime &&
                      ` → ${formatFeedingDateTime(entry.endTime, locale)}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteEntry.mutate(entry._id)}
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  aria-label={tc("delete")}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))
          )}
        </ul>
      </IdoPanel>

      <IdoPanel className="space-y-5 p-5 sm:p-6">
        <SleepPeriodSummaryPanel babyId={baby._id} anchorDate={selectedDate} />
      </IdoPanel>

      <div ref={formRef}>
        <IdoPanel className="space-y-5 p-5 sm:p-6">
          <SectionTitle>{t("manualEntry")}</SectionTitle>
          <p className="text-sm text-muted-foreground">{t("manualEntryHint")}</p>

          <form onSubmit={handleManualSubmit} className="space-y-4">
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
                        ? "border-amber-300 bg-amber-50 text-amber-900"
                        : "border-violet-300 bg-violet-50 text-violet-900"
                      : "border-[var(--stroke)] bg-white/80 text-muted-foreground"
                  )}
                >
                  {sleepType === "nap" ? <Sun className="size-4" /> : <MoonStar className="size-4" />}
                  {t(sleepType)}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("startSleep")}</Label>
                <HebrewDateInput value={startDate} onChange={setStartDate} className={inputClass} />
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("endSleep")}</Label>
                <HebrewDateInput value={endDate} onChange={setEndDate} className={inputClass} />
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("notes")}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={cn(inputClass, "min-h-[80px]")}
                placeholder={t("notesPlaceholder")}
              />
            </div>

            <IdoButton type="submit" wide disabled={createManual.isPending}>
              <Plus className="size-4" />
              {createManual.isPending ? tc("loading") : t("saveSleep")}
            </IdoButton>
          </form>
        </IdoPanel>
      </div>
    </div>
  );
}
