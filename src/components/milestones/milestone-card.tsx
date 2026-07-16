"use client";

import { Camera, ChevronDown, Star, Video } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { MilestoneScheduleItem } from "@/constants/milestones";
import type { Locale, Milestone } from "@/types";
import { HebrewDateInput } from "@/components/shared/hebrew-date-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/utils/date";
import { formatAgeParts, getBabyAgeParts, parseBirthDate } from "@/utils/age";
import {
  MILESTONE_STATUS_META,
  formatAgeRangeHe,
  type MilestoneStatus,
} from "@/utils/milestone-status";

interface MilestoneCardProps {
  milestone: MilestoneScheduleItem;
  record: Milestone | null;
  status: MilestoneStatus;
  birthDate: string;
  statusLabel: string;
  saving: boolean;
  onSave: (data: {
    date: string;
    photoUrl?: string;
    videoUrl?: string;
    notes?: string;
  }) => void;
  onRemove: () => void;
}

export function MilestoneCard({
  milestone,
  record,
  status,
  birthDate,
  statusLabel,
  saving,
  onSave,
  onRemove,
}: MilestoneCardProps) {
  const t = useTranslations("milestones");
  const locale = useLocale() as Locale;
  const [expanded, setExpanded] = useState(status === "expected_soon" && !record);
  const [date, setDate] = useState(record?.date ?? new Date().toISOString().split("T")[0]);
  const [photoUrl, setPhotoUrl] = useState(record?.photoUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(record?.videoUrl ?? "");
  const [notes, setNotes] = useState(record?.notes ?? "");

  const meta = MILESTONE_STATUS_META[status];
  const completed = !!record;
  const ageAtAchievement =
    record &&
    formatAgeParts(getBabyAgeParts(birthDate, parseBirthDate(record.date)), locale);

  return (
    <article
      className={cn(
        "rounded-xl border transition",
        meta.bgClass,
        completed && "ring-1 ring-emerald-300/50"
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-right"
      >
        <span className="text-xl">{milestone.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[var(--ink)]">{milestone.titleHe}</p>
          <p className="text-[11px] text-muted-foreground">
            {t("typicalAge")}: {formatAgeRangeHe(milestone.ageMonthsMin, milestone.ageMonthsMax)}
            {record && (
              <> · {formatShortDate(record.date, locale)}{ageAtAchievement ? ` · ${ageAtAchievement}` : ""}</>
            )}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold",
            meta.bgClass,
            meta.colorClass
          )}
        >
          {meta.icon} {statusLabel}
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted-foreground transition", expanded && "rotate-180")}
        />
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-[var(--stroke)]/40 px-3 pb-3 pt-2.5">
          {completed ? (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-800">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {t("achievedAt")}: {ageAtAchievement}
              </p>
              {record.notes && (
                <p className="text-sm text-muted-foreground">{record.notes}</p>
              )}
              {(record.photoUrl || record.videoUrl) && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {record.photoUrl && (
                    <a href={record.photoUrl} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">
                      📷 {t("photo")}
                    </a>
                  )}
                  {record.videoUrl && (
                    <a href={record.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">
                      🎬 {t("video")}
                    </a>
                  )}
                </div>
              )}
              <Button variant="outline" size="sm" className="rounded-xl" onClick={onRemove} disabled={saving}>
                {t("unmark")}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("achievedDate")}</Label>
                <HebrewDateInput value={date} onChange={setDate} className="h-10 rounded-xl" />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1 text-xs">
                    <Camera className="size-3" /> {t("photoUrl")}
                  </Label>
                  <Input
                    dir="ltr"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://"
                    className="h-10 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1 text-xs">
                    <Video className="size-3" /> {t("videoUrl")}
                  </Label>
                  <Input
                    dir="ltr"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://"
                    className="h-10 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("notes")}</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[52px] rounded-xl resize-none"
                />
              </div>
              <Button
                className="w-full rounded-xl bg-[var(--grass)] font-bold hover:bg-[var(--grass-deep)]"
                disabled={saving || !date}
                onClick={() =>
                  onSave({
                    date,
                    photoUrl: photoUrl || undefined,
                    videoUrl: videoUrl || undefined,
                    notes: notes || undefined,
                  })
                }
              >
                ⭐ {t("markAchieved")}
              </Button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
