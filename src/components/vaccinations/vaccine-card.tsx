"use client";

import { Check, ChevronDown, ExternalLink, Syringe } from "lucide-react";
import { useState } from "react";
import type { VaccineScheduleItem } from "@/constants/vaccinations";
import type { VaccinationRecord } from "@/types";
import { HebrewDateInput } from "@/components/shared/hebrew-date-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/utils/date";
import type { Locale } from "@/types";

const inputClass =
  "rounded-2xl border-[var(--stroke)] bg-white/90 py-2.5 text-sm shadow-sm focus-visible:ring-[var(--grass)]";

interface VaccineCardProps {
  vaccine: VaccineScheduleItem;
  recommendedDate: string;
  record: VaccinationRecord | null;
  locale: Locale;
  saving: boolean;
  labels: {
    recommended: string;
    scheduled: string;
    completed: string;
    completedDate: string;
    notes: string;
    sideEffects: string;
    reminder: string;
    optional: string;
    seasonal: string;
    protects: string;
    where: string;
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
}: VaccineCardProps) {
  const [expanded, setExpanded] = useState(!record?.completed);
  const completed = record?.completed ?? false;

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border-2 transition",
        completed
          ? "border-[var(--grass)]/40 bg-[var(--grass)]/8"
          : record?.scheduledDate
            ? "border-sky-300 bg-sky-50/50"
            : "border-[var(--stroke)] bg-white/90"
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start gap-3 p-4 text-right"
      >
        <span className="text-2xl">{vaccine.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-[var(--ink)]">{vaccine.nameHe}</h4>
            <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {vaccine.doseHe}
            </span>
            {vaccine.optional && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                {labels.optional}
              </span>
            )}
            {completed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--grass)]/20 px-2 py-0.5 text-xs font-bold text-[var(--grass-deep)]">
                <Check className="size-3" /> {labels.completed}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {labels.recommended}: {formatShortDate(recommendedDate, locale)}
            {record?.scheduledDate && (
              <> · {labels.scheduled}: {formatShortDate(record.scheduledDate, locale)}</>
            )}
          </p>
        </div>
        <ChevronDown
          className={cn("size-5 shrink-0 text-muted-foreground transition", expanded && "rotate-180")}
        />
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-[var(--stroke)]/60 px-4 pb-4 pt-3">
          <p className="text-sm leading-relaxed text-[var(--ink)]/85">{vaccine.descriptionHe}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800">
              🛡️ {labels.protects}: {vaccine.protectsHe}
            </span>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-800">
              📍 {vaccine.whereHe}
            </span>
            {vaccine.seasonal && vaccine.seasonalNoteHe && (
              <span className="rounded-full bg-violet-50 px-2.5 py-1 font-semibold text-violet-800">
                ❄️ {labels.seasonal}: {vaccine.seasonalNoteHe}
              </span>
            )}
          </div>
          {vaccine.optionalNoteHe && (
            <p className="text-xs text-amber-700">⚠️ {vaccine.optionalNoteHe}</p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">{labels.scheduled}</Label>
              <HebrewDateInput
                value={record?.scheduledDate ?? ""}
                onChange={(date) => onUpdate({ scheduledDate: date || null })}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{labels.completedDate}</Label>
              <HebrewDateInput
                value={record?.completedDate ?? ""}
                onChange={(date) => onUpdate({ completedDate: date || null })}
                className={inputClass}
                disabled={!completed}
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--stroke)] bg-white/80 p-3">
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
              className="size-5 rounded accent-[var(--grass)]"
            />
            <span className="font-semibold text-sm">{labels.completed}</span>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-sky-200 bg-sky-50/50 p-3">
            <input
              type="checkbox"
              checked={record?.reminderEnabled ?? true}
              disabled={saving || !record?.scheduledDate}
              onChange={(e) => onUpdate({ reminderEnabled: e.target.checked })}
              className="size-5 rounded accent-sky-600"
            />
            <span className="text-sm">{labels.reminder}</span>
          </label>

          <div className="space-y-1.5">
            <Label className="text-xs">{labels.notes}</Label>
            <Textarea
              defaultValue={record?.notes ?? ""}
              onBlur={(e) => {
                if (e.target.value !== (record?.notes ?? "")) {
                  onUpdate({ notes: e.target.value });
                }
              }}
              className={cn(inputClass, "min-h-[60px]")}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{labels.sideEffects}</Label>
            <Textarea
              defaultValue={record?.sideEffects ?? ""}
              onBlur={(e) => {
                if (e.target.value !== (record?.sideEffects ?? "")) {
                  onUpdate({ sideEffects: e.target.value });
                }
              }}
              className={cn(inputClass, "min-h-[60px]")}
            />
          </div>
        </div>
      )}
    </article>
  );
}
