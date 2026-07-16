"use client";

import { Bell, CalendarPlus, Clock } from "lucide-react";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    setDate(record?.scheduledDate ?? recommendedDate);
    setTime(record?.scheduledTime ?? "09:00");
    if (record?.scheduledDate) setOpen(false);
  }, [record?.scheduledDate, record?.scheduledTime, recommendedDate]);

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
    <div className="overflow-hidden rounded-2xl border border-sky-300 bg-gradient-to-l from-sky-50/90 to-white shadow-sm">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-2xl">
          {vaccine.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-sky-700">{t("nextVaccine")}</p>
          <h3 className="text-lg font-bold text-[var(--ink)]">
            {vaccine.nameHe} · {vaccine.doseHe}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("recommendedDate")}: {formatShortDate(recommendedDate, locale)}
          </p>

          {hasAppointment && !open && (
            <p className="mt-2 text-sm font-semibold text-sky-900">
              {t("yourAppointment")}: {formatShortDate(record!.scheduledDate!, locale)}
              {record?.scheduledTime ? ` · ${record.scheduledTime}` : ""}
            </p>
          )}

          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-sky-800">
            <Bell className="size-3 shrink-0" />
            {t("reminderNote")}
          </p>
        </div>

        {!open && (
          <Button
            size="sm"
            className="h-10 shrink-0 rounded-xl bg-sky-600 font-bold hover:bg-sky-700"
            onClick={() => setOpen(true)}
          >
            <CalendarPlus className="size-4" />
            {hasAppointment ? t("editAppointment") : t("scheduleAppointment")}
          </Button>
        )}
      </div>

      {open && (
        <div className="space-y-3 border-t border-sky-200 bg-white/90 px-4 py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="space-y-1">
              <Label className="text-[10px]">{t("scheduledDate")}</Label>
              <HebrewDateInput
                value={date}
                onChange={setDate}
                className="h-10 w-full max-w-[11rem] rounded-lg border-sky-200 bg-white text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">{t("scheduledTime")}</Label>
              <div className="relative w-full max-w-[8rem]">
                <Clock className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-10 rounded-lg border-sky-200 bg-white pe-9 text-sm"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="h-9 rounded-lg bg-sky-600 font-bold hover:bg-sky-700"
              disabled={saving || !date}
              onClick={handleSave}
            >
              {saving ? t("saving") : t("confirmAppointment")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-9 rounded-lg"
              onClick={() => setOpen(false)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
