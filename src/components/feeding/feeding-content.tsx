"use client";

import { Calculator, Plus, Trash2, Utensils } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FEEDING_TYPES, type FeedingType } from "@/constants/feeding";
import {
  useCreateFeedingEntry,
  useDeleteFeedingEntry,
  useFeedingSummary,
} from "@/hooks/use-feeding";
import { useBabyStore } from "@/stores/baby-store";
import { formatDate, formatDateTime, combineLocalDateTime, getNowLocalTime, getTodayLocal } from "@/utils/date";
import type { Locale } from "@/types";
import { IdoButton } from "@/components/idoland/ido-button";
import { IdoPanel } from "@/components/idoland/ido-panel";
import { HebrewDateInput } from "@/components/shared/hebrew-date-input";
import { DailyProgress } from "@/components/shared/daily-progress";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { NoBabyPrompt } from "@/components/shared/no-baby-prompt";
import { StatCard } from "@/components/shared/stat-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

const inputClass =
  "rounded-2xl border-[var(--stroke)] bg-white/90 py-3 shadow-sm focus-visible:ring-[var(--grass)]";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--grass-deep)]">
      {children}
    </h3>
  );
}

export function FeedingContent() {
  const t = useTranslations("feeding");
  const tc = useTranslations("common");
  const tfc = useTranslations("feedingCalculator");
  const locale = useLocale() as Locale;
  const baby = useBabyStore((s) => s.getSelectedBaby());
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLDivElement>(null);

  const [selectedDate, setSelectedDate] = useState(getTodayLocal());
  const [mealsPerDay, setMealsPerDay] = useState(8);
  const [type, setType] = useState<FeedingType>("formula");
  const [amount, setAmount] = useState("");
  const [time, setTime] = useState(getNowLocalTime());
  const [notes, setNotes] = useState("");

  const { data: summary, isLoading } = useFeedingSummary(baby?._id ?? null, selectedDate, mealsPerDay);
  const createEntry = useCreateFeedingEntry(baby?._id ?? null);
  const deleteEntry = useDeleteFeedingEntry(baby?._id ?? null);

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [searchParams]);

  const entriesWithRemaining = useMemo(() => {
    if (!summary) return [];
    const sorted = [...summary.entries].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );
    let running = summary.dailyGoal;
    return sorted.map((entry) => {
      const after = running - (entry.amount ?? 0);
      const item = { entry, remainingAfter: Math.max(0, after) };
      running = after;
      return item;
    });
  }, [summary]);

  if (!baby) return <NoBabyPrompt />;

  const weightKg = (summary?.lastWeightGrams ?? baby.birthWeight ?? 3500) / 1000;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!baby) return;
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      toast.error(t("amountRequired"));
      return;
    }
    const dateTime = combineLocalDateTime(selectedDate, time);

    try {
      await createEntry.mutateAsync({
        babyId: baby._id,
        type,
        time: dateTime.toISOString(),
        amount: amountNum,
        notes: notes || undefined,
      });
      toast.success(t("mealSaved"));
      setAmount("");
      setNotes("");
      setTime(getNowLocalTime());
    } catch {
      toast.error(tc("error"));
    }
  }

  return (
    <div className="space-y-6">
      <IdoPanel className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle>{t("dailyProgress")}</SectionTitle>
          <HebrewDateInput
            value={selectedDate}
            onChange={setSelectedDate}
            className={cn(inputClass, "max-w-[160px]")}
          />
        </div>

        {isLoading ? (
          <div className="h-24 animate-pulse rounded-2xl bg-white/50" />
        ) : summary ? (
          <DailyProgress
            eaten={summary.todayTotal}
            goal={summary.dailyGoal}
            unit={tc("ml")}
            eatenLabel={t("dailyTotal")}
            remainingLabel={tfc("remainingToday")}
          />
        ) : null}
      </IdoPanel>

      <IdoPanel className="space-y-5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calculator className="size-5 text-[var(--grass-deep)]" />
            <SectionTitle>{t("calculator")}</SectionTitle>
          </div>
          <Link
            href="/dashboard/feeding/calculator"
            className="text-sm font-semibold text-[var(--coral)] hover:underline"
          >
            {t("openCalculator")}
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          {t("basedOnWeight", { weight: weightKg.toFixed(2) })}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{tfc("mealsPerDay")}</Label>
            <Input
              type="number"
              min={1}
              max={12}
              value={mealsPerDay}
              onChange={(e) => setMealsPerDay(Number(e.target.value) || 8)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("lastWeighing")}</Label>
            <p className="rounded-2xl border border-[var(--stroke)] bg-white/90 px-4 py-3 text-lg font-semibold">
              {summary?.lastWeightGrams ?? baby.birthWeight ?? "—"} {tc("grams")}
            </p>
          </div>
        </div>

        {summary && (
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label={tfc("dailyRecommended")} value={`${summary.dailyGoal} ${tc("ml")}`} />
            <StatCard label={tfc("perMeal")} value={`${summary.perMeal} ${tc("ml")}`} />
            <StatCard label={tfc("remainingToday")} value={`${summary.remaining} ${tc("ml")}`} />
          </div>
        )}
      </IdoPanel>

      <div ref={formRef}>
        <IdoPanel className="space-y-5 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Plus className="size-5 text-[var(--coral)]" />
            <SectionTitle>{t("quickAdd")}</SectionTitle>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("type")}</Label>
              <Select value={type} onValueChange={(v) => setType(v as FeedingType)}>
                <SelectTrigger className={inputClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEEDING_TYPES.map((ft) => (
                    <SelectItem key={ft} value={ft}>
                      {t(ft)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("amount")} ({tc("ml")})</Label>
              <Input
                type="number"
                min={1}
                placeholder={summary ? String(summary.perMeal) : "120"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label>{tc("date")}</Label>
              <HebrewDateInput
                value={selectedDate}
                onChange={setSelectedDate}
                className={cn(inputClass, "max-w-[160px]")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("time")}</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("notes")}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={cn(inputClass, "min-h-[80px]")}
                placeholder={t("notesPlaceholder")}
              />
            </div>
            <div className="sm:col-span-2">
              <IdoButton type="submit" wide disabled={createEntry.isPending}>
                {createEntry.isPending ? tc("loading") : t("saveMeal")}
              </IdoButton>
            </div>
          </form>
        </IdoPanel>
      </div>

      <IdoPanel className="space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Utensils className="size-5 text-[var(--grass-deep)]" />
          <SectionTitle>{t("todayMeals")}</SectionTitle>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/50" />
            ))}
          </div>
        ) : entriesWithRemaining.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--stroke)] bg-white/50 p-6 text-center text-muted-foreground">
            {tc("noData")}
          </p>
        ) : (
          <ul className="space-y-3">
            {[...entriesWithRemaining].reverse().map(({ entry, remainingAfter }) => (
              <li
                key={entry._id}
                className="flex items-center gap-3 rounded-2xl border border-[var(--stroke)] bg-white/80 p-4 shadow-sm"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--grass)]/15 text-lg">
                  🍼
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[var(--ink)]">
                    {t(entry.type)} · {entry.amount} {tc("ml")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(entry.time, locale)} · {t("remainingAfter", { amount: remainingAfter })}
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
            ))}
          </ul>
        )}
      </IdoPanel>

      <LegalDisclaimer variant="feedingCalculator" />
    </div>
  );
}
