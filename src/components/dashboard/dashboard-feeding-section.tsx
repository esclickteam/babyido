"use client";

import { Plus, Trash2, Utensils } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { FEEDING_TYPES, type FeedingType } from "@/constants/feeding";
import {
  useCreateFeedingEntry,
  useDeleteFeedingEntry,
  useFeedingSummary,
} from "@/hooks/use-feeding";
import {
  formatFeedingDateTime,
  getNowLocalTime,
  getTodayLocal,
} from "@/utils/date";
import type { Locale } from "@/types";
import { IdoButton } from "@/components/idoland/ido-button";
import { IdoPanel } from "@/components/idoland/ido-panel";
import { DailyProgress } from "@/components/shared/daily-progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

const inputClass =
  "rounded-2xl border-[var(--stroke)] bg-white/90 py-3 shadow-sm focus-visible:ring-[var(--grass)]";

interface DashboardFeedingSectionProps {
  babyId: string;
}

export function DashboardFeedingSection({ babyId }: DashboardFeedingSectionProps) {
  const t = useTranslations("feeding");
  const td = useTranslations("dashboard");
  const tc = useTranslations("common");
  const tfc = useTranslations("feedingCalculator");
  const locale = useLocale() as Locale;

  const today = getTodayLocal();
  const [type, setType] = useState<FeedingType>("formula");
  const [amount, setAmount] = useState("");
  const [time, setTime] = useState(getNowLocalTime());

  const { data: summary, isLoading } = useFeedingSummary(babyId, today);
  const createEntry = useCreateFeedingEntry(babyId);
  const deleteEntry = useDeleteFeedingEntry(babyId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      toast.error(t("amountRequired"));
      return;
    }

    try {
      await createEntry.mutateAsync({
        babyId,
        type,
        date: today,
        time,
        amount: amountNum,
      });
      toast.success(t("mealSaved"));
      setAmount("");
      setTime(getNowLocalTime());
    } catch {
      toast.error(tc("error"));
    }
  }

  const logs = [...(summary?.entries ?? [])].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
      <IdoPanel className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Utensils className="size-5 text-[var(--grass-deep)]" />
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--grass-deep)]">
                {td("todayFeeding")}
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {td("todayDate", { date: formatDateTime(new Date(), locale).split(" · ")[0] })}
            </p>
          </div>
          <Link
            href="/dashboard/feeding"
            className="text-sm font-semibold text-[var(--coral)] hover:underline"
          >
            {t("viewFull")}
          </Link>
        </div>

        {isLoading ? (
          <Skeleton className="h-24 w-full rounded-2xl" />
        ) : summary ? (
          <DailyProgress
            eaten={summary.todayTotal}
            goal={summary.dailyGoal}
            unit={tc("ml")}
            eatenLabel={t("dailyTotal")}
            remainingLabel={tfc("remainingToday")}
          />
        ) : null}

        {summary && (
          <p className="text-center text-sm text-muted-foreground">
            {td("feedingOfGoal", {
              eaten: summary.todayTotal,
              goal: summary.dailyGoal,
              remaining: summary.remaining,
            })}
          </p>
        )}

        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-3">
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
            <Label>{t("time")}</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-3">
            <IdoButton type="submit" wide disabled={createEntry.isPending}>
              <Plus className="size-4" />
              {createEntry.isPending ? tc("loading") : t("saveMeal")}
            </IdoButton>
          </div>
        </form>
      </IdoPanel>

      <IdoPanel className="flex min-h-[320px] flex-col p-4 sm:p-5 xl:min-h-0">
        <h3 className="mb-3 font-[family-name:var(--font-display)] text-base font-bold text-[var(--grass-deep)]">
          {t("mealLogs")}
        </h3>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
            {t("noMealsToday")}
          </p>
        ) : (
          <ScrollArea className="flex-1 pr-2">
            <ul className="space-y-2">
              {logs.map((entry) => (
                <li
                  key={entry._id}
                  className="flex items-center gap-2 rounded-xl border border-[var(--stroke)] bg-white/80 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {entry.amount} {tc("ml")} · {t(entry.type)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFeedingDateTime(entry.time, locale)}
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
