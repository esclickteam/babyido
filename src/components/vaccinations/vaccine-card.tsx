"use client";

import { Check, ChevronDown, Clock } from "lucide-react";
import { useState } from "react";
import type { VaccineScheduleItem } from "@/constants/vaccinations";
import type { VaccinationRecord } from "@/types";
import { HebrewDateInput } from "@/components/shared/hebrew-date-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/utils/date";
import type { Locale } from "@/types";

const inputClass =
  "h-10 rounded-xl border-[var(--stroke)] bg-white/95 text-sm shadow-none focus-visible:ring-[var(--grass)]";

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
  const completed = record?.completed ?? false;
  const hasAppointment = Boolean(record?.scheduledDate);

  return (
    <article
      className={cn(
        "group rounded-xl border transition-all",
        completed
          ? "border-[var(--grass)]/30 bg-[var(--grass)]/5"
          : hasAppointment
            ? "border-sky-200/80 bg-sky-50/30"
            : "border-[var(--stroke)]/80 bg-white/80 hover:border-[var(--grass)]/25 hover:bg-white"
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-right"
      >
        <span className="text-xl leading-none">{vaccine.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4 className="text-sm font-bold text-[var(--ink)]">{vaccine.nameHe}</h4>
            <span className="text-[11px] font-medium text-muted-foreground">{vaccine.doseHe}</span>
            {vaccine.optional && (
              <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                {labels.optional}
              </span>
            )}
            {completed && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--grass)]/15 px-1.5 py-0.5 text-[10px] font-bold text-[var(--grass-deep)]">
                <Check className="size-2.5" /> {labels.completed}
              </span>
            )}
            {hasAppointment && !completed && (
              <span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">
                {labels.scheduled}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {labels.recommended}: {formatShortDate(recommendedDate, locale)}
            {record?.scheduledDate && (
              <>
                {" · "}
                {formatShortDate(record.scheduledDate, locale)}
                {record.scheduledTime ? ` ${record.scheduledTime}` : ""}
              </>
            )}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground/60 transition",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-[var(--stroke)]/50 px-3 pb-3 pt-2.5">
          <p className="text-xs leading-relaxed text-muted-foreground">{vaccine.descriptionHe}</p>

          <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-3">
            <p className="mb-2 text-[11px] font-bold text-sky-800">{labels.appointment}</p>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">{labels.scheduled}</Label>
                <HebrewDateInput
                  value={record?.scheduledDate ?? ""}
                  onChange={(date) => onUpdate({ scheduledDate: date || null })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">{labels.scheduledTime}</Label>
                <div className="relative">
                  <Clock className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="time"
                    value={record?.scheduledTime ?? ""}
                    onChange={(e) => onUpdate({ scheduledTime: e.target.value || null })}
                    className={cn(inputClass, "pe-9")}
                  />
                </div>
              </div>
            </div>
            <label className="mt-2.5 flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={record?.reminderEnabled ?? true}
                disabled={saving || !record?.scheduledDate}
                onChange={(e) => onUpdate({ reminderEnabled: e.target.checked })}
                className="size-4 rounded accent-sky-600"
              />
              <span className="text-[11px] text-sky-900">{labels.reminder}</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
              <div className="min-w-[10rem] flex-1">
                <HebrewDateInput
                  value={record?.completedDate ?? ""}
                  onChange={(date) => onUpdate({ completedDate: date || null })}
                  className={inputClass}
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 text-[10px]">
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-800">
              {labels.protects}: {vaccine.protectsHe}
            </span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-800">
              {vaccine.whereHe}
            </span>
            {vaccine.seasonal && vaccine.seasonalNoteHe && (
              <span className="rounded-full bg-violet-50 px-2 py-0.5 font-medium text-violet-800">
                {vaccine.seasonalNoteHe}
              </span>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">{labels.notes}</Label>
              <Textarea
                key={`notes-${record?._id ?? vaccine.id}-${record?.notes ?? ""}`}
                defaultValue={record?.notes ?? ""}
                onBlur={(e) => {
                  if (e.target.value !== (record?.notes ?? "")) {
                    onUpdate({ notes: e.target.value });
                  }
                }}
                className={cn(inputClass, "min-h-[52px] resize-none")}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">{labels.sideEffects}</Label>
              <Textarea
                key={`fx-${record?._id ?? vaccine.id}-${record?.sideEffects ?? ""}`}
                defaultValue={record?.sideEffects ?? ""}
                onBlur={(e) => {
                  if (e.target.value !== (record?.sideEffects ?? "")) {
                    onUpdate({ sideEffects: e.target.value });
                  }
                }}
                className={cn(inputClass, "min-h-[52px] resize-none")}
              />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
