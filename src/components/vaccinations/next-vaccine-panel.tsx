"use client";

import { Bell, CalendarPlus, Clock } from "lucide-react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { VaccineScheduleItem } from "@/constants/vaccinations";
import type { Locale, VaccinationRecord } from "@/types";
import { HebrewDateInput } from "@/components/shared/hebrew-date-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatShortDate } from "@/utils/date";

interface NextVaccinePanelProps {
  vaccine: VaccineScheduleItem;
  recommendedDate: string;
  record: VaccinationRecord | null;
  locale: Locale;
  saving: boolean;
  onSave: (patch: {
    scheduledDate: string;
    scheduledTime?: string;
    reminderEnabled: boolean;
  }) => void;
}

export function NextVaccinePanel({
  vaccine,
  recommendedDate,
  record,
  locale,
  saving,
  onSave,
}: NextVaccinePanelProps) {
  const t = useTranslations("vaccinations");
  const [open, setOpen] = useState(!record?.scheduledDate);
  const [date, setDate] = useState(record?.scheduledDate ?? recommendedDate);
  const [time, setTime] = useState(record?.scheduledTime ?? "09:00");

  const hasAppointment = Boolean(record?.scheduledDate);

  function handleSave() {
    if (!date) return;
    onSave({
      scheduledDate: date,
      scheduledTime: time || undefined,
      reminderEnabled: true,
    });
    setOpen(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-sky-300 bg-gradient-to-l from-sky-50 via-white to-white shadow-sm">
      <div className="flex flex-wrap items-start gap-4 p-4 sm:p-5">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-3xl">
          {vaccine.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
            {t("nextVaccine")}
          </p>
          <h3 className="mt-1 text-xl font-bold text-[var(--ink)]">
            {vaccine.nameHe} · {vaccine.doseHe}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("recommendedDate")}: {formatShortDate(recommendedDate, locale)}
          </p>

          {hasAppointment && !open && (
            <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-xl border border-sky-200 bg-white px-3 py-2">
              <CalendarPlus className="size-4 text-sky-600" />
              <span className="text-sm font-bold text-sky-900">
                {t("yourAppointment")}: {formatShortDate(record!.scheduledDate!, locale)}
                {record?.scheduledTime ? ` · ${record.scheduledTime}` : ""}
              </span>
            </div>
          )}

          <p className="mt-2 flex items-center gap-1.5 text-xs text-sky-800">
            <Bell className="size-3.5 shrink-0" />
            {t("reminderNote")}
          </p>
        </div>

        <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto sm:flex-col">
          {!open && (
            <Button
              className="flex-1 rounded-xl bg-sky-600 font-bold hover:bg-sky-700 sm:flex-none"
              onClick={() => setOpen(true)}
            >
              <CalendarPlus className="size-4" />
              {hasAppointment ? t("editAppointment") : t("scheduleAppointment")}
            </Button>
          )}
        </div>
      </div>

      {open && (
        <div className="space-y-4 border-t border-sky-200 bg-white/80 px-4 py-4 sm:px-5">
          <p className="text-sm font-semibold text-sky-900">{t("scheduleAppointment")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">{t("scheduledDate")}</Label>
              <HebrewDateInput
                value={date}
                onChange={setDate}
                className="h-11 rounded-xl border-sky-200 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("scheduledTime")}</Label>
              <div className="relative">
                <Clock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-11 rounded-xl border-sky-200 pe-10"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="rounded-xl bg-sky-600 font-bold hover:bg-sky-700"
              disabled={saving || !date}
              onClick={handleSave}
            >
              {saving ? t("saving") : t("confirmAppointment")}
            </Button>
            {hasAppointment && (
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setOpen(false)}
              >
                {t("cancel")}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
