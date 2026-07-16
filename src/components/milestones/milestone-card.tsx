"use client";

import { Camera, ChevronDown, Pencil, Star, Video } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { MilestoneScheduleItem } from "@/constants/milestones";
import type { Locale, Milestone } from "@/types";
import { HebrewDateInput } from "@/components/shared/hebrew-date-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  MilestoneIconBadge,
  MilestoneStatusBadge,
} from "@/components/milestones/milestone-icons";
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
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(record?.date ?? new Date().toISOString().split("T")[0]);
  const [photoUrl, setPhotoUrl] = useState(record?.photoUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(record?.videoUrl ?? "");
  const [notes, setNotes] = useState(record?.notes ?? "");

  const meta = MILESTONE_STATUS_META[status];
  const completed = !!record;
  const ageAtAchievement =
    record &&
    formatAgeParts(getBabyAgeParts(birthDate, parseBirthDate(record.date)), locale);

  function handleSave() {
    if (!date) return;
    onSave({
      date,
      photoUrl: photoUrl || undefined,
      videoUrl: videoUrl || undefined,
      notes: notes || undefined,
    });
    setEditing(false);
  }

  return (
    <article
      className={cn(
        "ms-card-enter overflow-hidden rounded-2xl border shadow-sm transition-all",
        meta.bgClass,
        completed && "ring-1 ring-emerald-300/60",
        status === "expected_soon" && !completed && "shadow-md shadow-sky-100/80"
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-3 py-3 text-right"
      >
        <MilestoneIconBadge
          id={milestone.id}
          category={milestone.category}
          status={completed ? "completed" : status}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug text-[var(--ink)]">{milestone.titleHe}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {t("typicalAge")}: {formatAgeRangeHe(milestone.ageMonthsMin, milestone.ageMonthsMax)}
            {record && (
              <>
                {" · "}
                {formatShortDate(record.date, locale)}
                {ageAtAchievement ? ` · ${ageAtAchievement}` : ""}
              </>
            )}
          </p>
        </div>
        <MilestoneStatusBadge
          status={status}
          label={statusLabel}
          colorClass={meta.colorClass}
          bgClass={meta.bgClass}
        />
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-[var(--stroke)]/30 bg-white/70 px-3 pb-3 pt-3">
          {completed && !editing ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5">
                <Star className="size-4 shrink-0 fill-amber-400 text-amber-400 ms-icon-wiggle" />
                <p className="text-sm font-semibold text-emerald-800">
                  {t("achievedAt")}: {ageAtAchievement}
                </p>
              </div>
              {record.notes && (
                <p className="rounded-xl bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  {record.notes}
                </p>
              )}
              {(record.photoUrl || record.videoUrl) && (
                <div className="flex flex-wrap gap-2">
                  {record.photoUrl && (
                    <a
                      href={record.photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100"
                    >
                      <Camera className="size-3.5" />
                      {t("photo")}
                    </a>
                  )}
                  {record.videoUrl && (
                    <a
                      href={record.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-800 hover:bg-violet-100"
                    >
                      <Video className="size-3.5" />
                      {t("video")}
                    </a>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="size-3.5" />
                  {t("edit")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 rounded-xl text-muted-foreground"
                  onClick={onRemove}
                  disabled={saving}
                >
                  {t("unmark")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold text-muted-foreground">
                  {t("achievedDate")}
                </Label>
                <HebrewDateInput
                  value={date}
                  onChange={setDate}
                  className="h-10 max-w-[11rem] rounded-xl"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                    <Camera className="size-3" />
                    {t("photoUrl")}
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
                  <Label className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                    <Video className="size-3" />
                    {t("videoUrl")}
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
                <Label className="text-[10px] font-semibold text-muted-foreground">
                  {t("notes")}
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[52px] resize-none rounded-xl text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  className="h-10 rounded-xl bg-gradient-to-l from-[var(--grass)] to-[var(--grass-deep)] px-5 font-bold shadow-sm hover:opacity-95"
                  disabled={saving || !date}
                  onClick={handleSave}
                >
                  <Star className="size-4 fill-white/30" />
                  {saving ? t("saving") : t("markAchieved")}
                </Button>
                {completed && editing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 rounded-xl"
                    onClick={() => setEditing(false)}
                  >
                    {t("cancel")}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
