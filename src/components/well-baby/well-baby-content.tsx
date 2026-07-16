"use client";

import { Bell, CalendarPlus, Clock, Stethoscope, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateWellBabyVisit,
  useDeleteWellBabyVisit,
  useUpdateWellBabyVisit,
  useWellBabyVisits,
} from "@/hooks/use-calendar";
import { useBabyStore } from "@/stores/baby-store";
import { HebrewDateInput } from "@/components/shared/hebrew-date-input";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { NoBabyPrompt } from "@/components/shared/no-baby-prompt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { formatShortDate, getTodayLocal } from "@/utils/date";
import type { Locale, WellBabyVisitType } from "@/types";

const VISIT_TYPES: WellBabyVisitType[] = ["tracking", "tracking_vaccine"];

export function WellBabyContent() {
  const t = useTranslations("wellBaby");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const baby = useBabyStore((s) => s.getSelectedBaby());
  const [date, setDate] = useState(getTodayLocal());
  const [time, setTime] = useState("09:00");
  const [visitType, setVisitType] = useState<WellBabyVisitType>("tracking");
  const [clinic, setClinic] = useState("");
  const [notes, setNotes] = useState("");
  const [reminder, setReminder] = useState(true);

  const { data: visits = [], isLoading } = useWellBabyVisits(baby?._id ?? null);
  const create = useCreateWellBabyVisit(baby?._id ?? null);
  const update = useUpdateWellBabyVisit(baby?._id ?? null);
  const remove = useDeleteWellBabyVisit(baby?._id ?? null);

  if (!baby) return <NoBabyPrompt />;

  const upcoming = visits.filter((v) => !v.completed);
  const past = visits.filter((v) => v.completed);

  async function handleSave() {
    if (!date) return;
    try {
      await create.mutateAsync({
        babyId: baby!._id,
        scheduledDate: date,
        scheduledTime: time || undefined,
        visitType,
        clinicName: clinic || undefined,
        notes: notes || undefined,
        reminderEnabled: reminder,
      });
      toast.success(t("saved"));
      setNotes("");
      setClinic("");
    } catch {
      toast.error(tc("error"));
    }
  }

  function visitTypeLabel(type: WellBabyVisitType) {
    return type === "tracking_vaccine" ? t("visitTypeVaccine") : t("visitTypeTracking");
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <LegalDisclaimer variant="general" />

      <div className="flex items-center gap-3 rounded-2xl border border-[var(--stroke)]/70 bg-white/90 px-4 py-3 shadow-sm">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 text-white shadow-md">
          <Stethoscope className="size-6 ms-icon-float" />
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--grass-deep)]">
            {t("title")}
          </h2>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-violet-200 bg-gradient-to-l from-violet-50 via-white to-violet-50/30 p-4 shadow-sm">
        <p className="mb-3 flex items-center gap-2 text-sm font-bold text-violet-900">
          <CalendarPlus className="size-4" />
          {t("scheduleTitle")}
        </p>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[10px]">{t("visitType")}</Label>
            <div className="flex flex-wrap gap-2">
              {VISIT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setVisitType(type)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs font-bold transition",
                    visitType === type
                      ? "border-violet-500 bg-violet-600 text-white shadow-sm"
                      : "border-violet-200 bg-white text-violet-900 hover:border-violet-300"
                  )}
                >
                  {visitTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="space-y-1">
              <Label className="text-[10px]">{t("date")}</Label>
              <HebrewDateInput
                value={date}
                onChange={setDate}
                className="h-10 max-w-[11rem] rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">{t("time")}</Label>
              <div className="relative max-w-[8rem]">
                <Clock className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-10 rounded-xl pe-9"
                />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px]">{t("clinic")}</Label>
            <Input
              value={clinic}
              onChange={(e) => setClinic(e.target.value)}
              placeholder={t("clinicPlaceholder")}
              className="h-10 rounded-xl"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px]">{t("notes")}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[52px] resize-none rounded-xl"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={reminder}
              onChange={(e) => setReminder(e.target.checked)}
              className="size-4 rounded accent-violet-600"
            />
            <span className="flex items-center gap-1 text-xs text-violet-900">
              <Bell className="size-3.5" />
              {t("reminder")}
            </span>
          </label>
          <Button
            className="h-10 rounded-xl bg-violet-600 font-bold hover:bg-violet-700"
            disabled={create.isPending || !date}
            onClick={handleSave}
          >
            {create.isPending ? t("saving") : t("saveAppointment")}
          </Button>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {t("calendarLink")}{" "}
        <Link href="/dashboard/journal" className="font-semibold text-[var(--coral)] hover:underline">
          {t("openJournal")}
        </Link>
      </p>

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-xl bg-muted/40" />
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-sm font-bold text-[var(--grass-deep)]">{t("upcoming")}</h3>
              {upcoming.map((v) => (
                <div
                  key={v._id}
                  className="flex items-start gap-3 rounded-xl border border-violet-200 bg-white p-3 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{v.clinicName || t("defaultClinic")}</p>
                    <p className="mt-0.5 text-xs font-semibold text-violet-700">
                      {visitTypeLabel(v.visitType)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatShortDate(v.scheduledDate, locale)}
                      {v.scheduledTime ? ` · ${v.scheduledTime}` : ""}
                    </p>
                    {v.notes && <p className="mt-1 text-xs text-muted-foreground">{v.notes}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-lg text-xs"
                      disabled={update.isPending}
                      onClick={() =>
                        update.mutate({
                          id: v._id,
                          data: { completed: true, completedDate: getTodayLocal() },
                        })
                      }
                    >
                      {t("markDone")}
                    </Button>
                    <button
                      type="button"
                      onClick={() => remove.mutate(v._id)}
                      className="flex size-8 items-center justify-center self-end rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )}

          {past.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-sm font-bold text-muted-foreground">{t("completed")}</h3>
              {past.map((v) => (
                <div
                  key={v._id}
                  className={cn(
                    "flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/40 px-3 py-2.5 text-sm"
                  )}
                >
                  <span>
                    {v.clinicName || t("defaultClinic")} · {visitTypeLabel(v.visitType)} ·{" "}
                    {formatShortDate(v.scheduledDate, locale)}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove.mutate(v._id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </section>
          )}

          {visits.length === 0 && (
            <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              {t("empty")}
            </p>
          )}
        </>
      )}
    </div>
  );
}
