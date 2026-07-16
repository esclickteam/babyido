"use client";

import { Calendar, ChevronDown, Pencil, Sparkles, Star, Video } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
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
import { MilestonePhotoUpload } from "@/components/milestones/milestone-photo-upload";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/utils/date";
import { formatAgeParts, getBabyAgeParts, parseBirthDate } from "@/utils/age";
import {
  MILESTONE_STATUS_META,
  formatAgeRangeHe,
  type MilestoneStatus,
} from "@/utils/milestone-status";
import Image from "next/image";

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
  const [showVideo, setShowVideo] = useState(false);
  const [date, setDate] = useState(record?.date ?? new Date().toISOString().split("T")[0]);
  const [photoUrl, setPhotoUrl] = useState(record?.photoUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(record?.videoUrl ?? "");
  const [notes, setNotes] = useState(record?.notes ?? "");

  const meta = MILESTONE_STATUS_META[status];
  const completed = !!record;
  const ageAtAchievement =
    record &&
    formatAgeParts(getBabyAgeParts(birthDate, parseBirthDate(record.date)), locale);

  useEffect(() => {
    setDate(record?.date ?? new Date().toISOString().split("T")[0]);
    setPhotoUrl(record?.photoUrl ?? "");
    setVideoUrl(record?.videoUrl ?? "");
    setNotes(record?.notes ?? "");
    if (record) setEditing(false);
  }, [record?._id, record?.date, record?.photoUrl, record?.videoUrl, record?.notes]);

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
        "ms-card-enter overflow-hidden rounded-2xl border bg-white shadow-sm transition-all",
        completed
          ? "border-emerald-200/80 ring-1 ring-emerald-100"
          : status === "expected_soon"
            ? "border-sky-200 shadow-md shadow-sky-100/60"
            : "border-[var(--stroke)]/60"
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-3 py-3.5 text-right"
      >
        <MilestoneIconBadge
          id={milestone.id}
          category={milestone.category}
          status={completed ? "completed" : status}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold leading-snug text-[var(--ink)]">{milestone.titleHe}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {formatAgeRangeHe(milestone.ageMonthsMin, milestone.ageMonthsMax)}
            {record && (
              <>
                {" · "}
                {formatShortDate(record.date, locale)}
              </>
            )}
          </p>
        </div>
        {!expanded && (
          <MilestoneStatusBadge
            status={status}
            label={statusLabel}
            colorClass={meta.colorClass}
            bgClass={meta.bgClass}
          />
        )}
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="border-t border-[var(--stroke)]/25 bg-gradient-to-b from-violet-50/40 to-white px-3 pb-4 pt-3">
          {completed && !editing ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 ring-1 ring-emerald-100">
                <Star className="size-4 shrink-0 fill-amber-400 text-amber-400 ms-icon-wiggle" />
                <div>
                  <p className="text-xs text-emerald-700">{t("achievedAt")}</p>
                  <p className="text-sm font-bold text-emerald-900">{ageAtAchievement}</p>
                </div>
              </div>

              {record.photoUrl && (
                <div className="overflow-hidden rounded-2xl border border-violet-100 shadow-sm">
                  <div className="relative aspect-[4/3] max-h-52 w-full">
                    <Image
                      src={record.photoUrl}
                      alt={milestone.titleHe}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              )}

              {record.notes && (
                <p className="rounded-xl bg-white/80 px-3 py-2.5 text-sm leading-relaxed text-muted-foreground ring-1 ring-[var(--stroke)]/40">
                  {record.notes}
                </p>
              )}

              {record.videoUrl && (
                <a
                  href={record.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-800 hover:bg-violet-200"
                >
                  <Video className="size-3.5" />
                  {t("video")}
                </a>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl border-violet-200"
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
            <div className="space-y-4">
              <MilestonePhotoUpload
                value={photoUrl || undefined}
                onChange={setPhotoUrl}
                onClear={() => setPhotoUrl("")}
              />

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-violet-900">
                  <Calendar className="size-3.5" />
                  {t("achievedDate")}
                </Label>
                <HebrewDateInput
                  value={date}
                  onChange={setDate}
                  className="h-11 max-w-full rounded-xl border-violet-200 bg-white sm:max-w-[12rem]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-violet-900">{t("notes")}</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("notesPlaceholder")}
                  className="min-h-[72px] resize-none rounded-xl border-violet-200 bg-white text-sm"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowVideo((v) => !v)}
                className="text-[11px] font-semibold text-violet-700 hover:underline"
              >
                {showVideo ? "▲" : "▼"} {t("addVideoOptional")}
              </button>

              {showVideo && (
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1 text-xs text-muted-foreground">
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
              )}

              <Button
                className="h-11 w-full rounded-xl bg-gradient-to-l from-[var(--grass)] to-emerald-600 text-base font-bold shadow-md shadow-emerald-200/50 hover:opacity-95"
                disabled={saving || !date}
                onClick={handleSave}
              >
                <Sparkles className="size-4 ms-icon-wiggle" />
                {saving ? t("saving") : t("markAchieved")}
              </Button>

              {completed && editing && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-full rounded-xl"
                  onClick={() => setEditing(false)}
                >
                  {t("cancel")}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
