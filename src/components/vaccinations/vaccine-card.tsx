"use client";

import { Bell, CalendarPlus, Check, ChevronDown, Clock, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import type { VaccineScheduleItem } from "@/constants/vaccinations";
import type { VaccinationRecord } from "@/types";
import { HebrewDateInput } from "@/components/shared/hebrew-date-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/utils/date";
import type { Locale } from "@/types";

interface VaccineCardProps {
  vaccine: VaccineScheduleItem;
  recommendedDate: string;
  record: VaccinationRecord | null;
  locale: Locale;
  saving: boolean;
  defaultExpanded?: boolean;
  labels: {
    recommended: string;
    scheduled: string;
    scheduledTime: string;
    completed: string;
    completedDate: string;
    notes: string;
    sideEffects: string;
    reminder: string;
    optional: string;
    seasonal: string;
    protects: string;
    where: string;
    appointment: string;
    scheduleAppointment: string;
    editAppointment: string;
    confirmAppointment: string;
    cancel: string;
    saving: string;
    moreDetails: string;
    saveNotes: string;
    yourAppointment: string;
  };
  onUpdate: (patch: Record<string, unknown>) => void;
}

export function VaccineCard({
  vaccine,
  recommendedDate,
  record,
  locale,
  saving,
  labels,
  onUpdate,
  defaultExpanded = false,
}: VaccineCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showDetails, setShowDetails] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(false);

  const [date, setDate] = useState(record?.scheduledDate ?? recommendedDate);
  const [time, setTime] = useState(record?.scheduledTime ?? "09:00");
  const [reminder, setReminder] = useState(record?.reminderEnabled ?? true);
  const [notes, setNotes] = useState(record?.notes ?? "");
  const [sideEffects, setSideEffects] = useState(record?.sideEffects ?? "");

  const completed = record?.completed ?? false;
  const hasAppointment = Boolean(record?.scheduledDate);

  useEffect(() => {
    setDate(record?.scheduledDate ?? recommendedDate);
    setTime(record?.scheduledTime ?? "09:00");
    setReminder(record?.reminderEnabled ?? true);
    setNotes(record?.notes ?? "");
    setSideEffects(record?.sideEffects ?? "");
    if (record?.scheduledDate) setEditingAppointment(false);
  }, [record?._id, record?.scheduledDate, record?.scheduledTime, record?.notes, record?.sideEffects, recommendedDate]);

  function saveAppointment() {
    if (!date) return;
    onUpdate({
      scheduledDate: date,
      scheduledTime: time || null,
      reminderEnabled: reminder,
    });
    setEditingAppointment(false);
  }

  function saveNotes() {
    onUpdate({ notes, sideEffects });
  }

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border transition-all",
        completed
          ? "border-[var(--grass)]/30 bg-[var(--grass)]/5"
          : hasAppointment
            ? "border-sky-200 bg-sky-50/40"
            : "border-[var(--stroke)]/80 bg-white"
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-right"
      >
        <span className="text-lg">{vaccine.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4 className="text-sm font-bold">{vaccine.nameHe}</h4>
            <span className="text-[11px] text-muted-foreground">{vaccine.doseHe}</span>
            {completed && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--grass)]/15 px-1.5 py-0.5 text-[10px] font-bold text-[var(--grass-deep)]">
                <Check className="size-2.5" /> {labels.completed}
              </span>
            )}
            {hasAppointment && !completed && (
              <span className="rounded-full bg-sky-200/80 px-1.5 py-0.5 text-[10px] font-bold text-sky-800">
                {labels.scheduled}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {labels.recommended}: {formatShortDate(recommendedDate, locale)}
            {hasAppointment && (
              <>
                {" · "}
                {formatShortDate(record!.scheduledDate!, locale)}
                {record?.scheduledTime ? ` ${record.scheduledTime}` : ""}
              </>
            )}
          </p>
        </div>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-[var(--stroke)]/40 bg-white/60 px-3 pb-3 pt-2.5">
          <p className="text-xs leading-relaxed text-muted-foreground">{vaccine.descriptionHe}</p>

          {/* תור */}
          <div className="rounded-xl border border-sky-200/80 bg-sky-50/50 p-3">
            <p className="mb-2 text-xs font-bold text-sky-900">{labels.appointment}</p>

            {hasAppointment && !editingAppointment ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm">
                  <CalendarPlus className="size-4 shrink-0 text-sky-600" />
                  <span className="font-semibold text-sky-900">
                    {labels.yourAppointment}: {formatShortDate(record!.scheduledDate!, locale)}
                    {record?.scheduledTime ? ` · ${record.scheduledTime}` : ""}
                  </span>
                </div>
                {record?.reminderEnabled && (
                  <p className="flex items-center gap-1 text-[11px] text-sky-700">
                    <Bell className="size-3" /> {labels.reminder}
                  </p>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-lg border-sky-300 text-sky-800 hover:bg-sky-100"
                  onClick={() => setEditingAppointment(true)}
                >
                  <Pencil className="size-3.5" />
                  {labels.editAppointment}
                </Button>
              </div>
            ) : editingAppointment ? (
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">{labels.scheduled}</Label>
                    <HebrewDateInput
                      value={date}
                      onChange={setDate}
                      className="h-10 w-full max-w-[11rem] rounded-lg border-sky-200 bg-white text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">{labels.scheduledTime}</Label>
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
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={reminder}
                    onChange={(e) => setReminder(e.target.checked)}
                    className="size-4 rounded accent-sky-600"
                  />
                  <span className="text-[11px] text-sky-900">{labels.reminder}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 rounded-lg bg-sky-600 px-4 font-bold hover:bg-sky-700"
                    disabled={saving || !date}
                    onClick={saveAppointment}
                  >
                    {saving ? labels.saving : labels.confirmAppointment}
                  </Button>
                  {hasAppointment && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-9 rounded-lg"
                      onClick={() => setEditingAppointment(false)}
                    >
                      {labels.cancel}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                className="h-9 w-full rounded-lg bg-sky-600 font-bold hover:bg-sky-700 sm:w-auto"
                onClick={() => setEditingAppointment(true)}
              >
                <CalendarPlus className="size-4" />
                {labels.scheduleAppointment}
              </Button>
            )}
          </div>

          {/* בוצע */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--stroke)] bg-white px-3 py-2">
              <input
                type="checkbox"
                checked={completed}
                disabled={saving}
                onChange={(e) =>
                  onUpdate({
                    completed: e.target.checked,
                    completedDate: e.target.checked
                      ? record?.completedDate ?? new Date().toISOString().split("T")[0]
                      : null,
                  })
                }
                className="size-4 rounded accent-[var(--grass)]"
              />
              <span className="text-xs font-semibold">{labels.completed}</span>
            </label>
            {completed && (
              <HebrewDateInput
                value={record?.completedDate ?? ""}
                onChange={(d) => onUpdate({ completedDate: d || null })}
                className="h-10 max-w-[11rem] rounded-lg text-sm"
              />
            )}
          </div>

          <div className="flex flex-wrap gap-1 text-[10px]">
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-800">
              {vaccine.protectsHe}
            </span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-800">{vaccine.whereHe}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="text-[11px] font-semibold text-muted-foreground hover:text-[var(--ink)]"
          >
            {showDetails ? "▲" : "▼"} {labels.moreDetails}
          </button>

          {showDetails && (
            <div className="space-y-2 rounded-lg border border-[var(--stroke)]/60 bg-white p-3">
              <div className="space-y-1">
                <Label className="text-[10px]">{labels.notes}</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[48px] resize-none rounded-lg text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">{labels.sideEffects}</Label>
                <Textarea
                  value={sideEffects}
                  onChange={(e) => setSideEffects(e.target.value)}
                  className="min-h-[48px] resize-none rounded-lg text-sm"
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 rounded-lg"
                disabled={saving}
                onClick={saveNotes}
              >
                {labels.saveNotes}
              </Button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
