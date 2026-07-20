"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useCreateJournalEvent } from "@/hooks/use-journal-events";
import { getTodayLocal } from "@/utils/date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REMINDER_OPTIONS = [
  { value: "15", labelKey: "reminder15m" },
  { value: "30", labelKey: "reminder30m" },
  { value: "60", labelKey: "reminder1h" },
  { value: "120", labelKey: "reminder2h" },
  { value: "1440", labelKey: "reminder1d" },
  { value: "2880", labelKey: "reminder2d" },
] as const;

interface JournalEventFormProps {
  babyId: string;
}

export function JournalEventForm({ babyId }: JournalEventFormProps) {
  const t = useTranslations("journal");
  const tc = useTranslations("common");
  const create = useCreateJournalEvent(babyId);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(getTodayLocal());
  const [time, setTime] = useState("09:00");
  const [recurrence, setRecurrence] = useState<"once" | "weekly" | "sessions">("once");
  const [sessionCount, setSessionCount] = useState("8");
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminder1, setReminder1] = useState("60");
  const [reminder2, setReminder2] = useState("1440");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    create.mutate(
      {
        babyId,
        title: title.trim(),
        notes: notes.trim() || undefined,
        date,
        time: `${time}:00`,
        recurrence,
        sessionCount: recurrence === "sessions" ? Number(sessionCount) || 1 : undefined,
        remindersEnabled,
        reminder1MinutesBefore: remindersEnabled ? Number(reminder1) : undefined,
        reminder2MinutesBefore:
          remindersEnabled && reminder2 !== "none" ? Number(reminder2) : undefined,
      },
      {
        onSuccess: () => {
          toast.success(t("eventSaved"));
          setTitle("");
          setNotes("");
        },
        onError: () => toast.error(tc("error")),
      }
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-emerald-200/70 bg-gradient-to-l from-emerald-50/60 to-white p-4 shadow-sm"
    >
      <div>
        <h3 className="text-sm font-bold text-[var(--grass-deep)]">{t("addEvent")}</h3>
        <p className="text-xs text-muted-foreground">{t("addEventHint")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 sm:col-span-2">
          <Label>{t("eventTitle")}</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("eventTitlePlaceholder")}
            className="rounded-xl"
          />
        </label>

        <label className="grid gap-1.5">
          <Label>{t("eventDate")}</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl" dir="ltr" />
        </label>

        <label className="grid gap-1.5">
          <Label>{t("eventTime")}</Label>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-xl" dir="ltr" />
        </label>

        <label className="grid gap-1.5 sm:col-span-2">
          <Label>{t("recurrence")}</Label>
          <Select value={recurrence} onValueChange={(v) => v && setRecurrence(v as typeof recurrence)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="once">{t("recurrenceOnce")}</SelectItem>
              <SelectItem value="weekly">{t("recurrenceWeekly")}</SelectItem>
              <SelectItem value="sessions">{t("recurrenceSessions")}</SelectItem>
            </SelectContent>
          </Select>
        </label>

        {recurrence === "sessions" && (
          <label className="grid gap-1.5 sm:col-span-2">
            <Label>{t("sessionCount")}</Label>
            <Input
              type="number"
              min={1}
              max={52}
              value={sessionCount}
              onChange={(e) => setSessionCount(e.target.value)}
              className="rounded-xl"
              dir="ltr"
            />
          </label>
        )}

        <label className="grid gap-1.5 sm:col-span-2">
          <Label>{t("eventNotes")}</Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("eventNotesPlaceholder")}
            className="rounded-xl"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={remindersEnabled}
          onChange={(e) => setRemindersEnabled(e.target.checked)}
          className="size-4 rounded border-[var(--stroke)]"
        />
        {t("enableReminders")}
      </label>

      {remindersEnabled && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <Label>{t("reminder1")}</Label>
            <Select value={reminder1} onValueChange={(v) => v && setReminder1(v)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REMINDER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="grid gap-1.5">
            <Label>{t("reminder2")}</Label>
            <Select value={reminder2} onValueChange={(v) => v && setReminder2(v)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("reminderNone")}</SelectItem>
                {REMINDER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
      )}

      <Button type="submit" className="w-full rounded-xl gap-2 sm:w-auto" disabled={create.isPending}>
        <Plus className="size-4" />
        {create.isPending ? t("saving") : t("saveEvent")}
      </Button>
    </form>
  );
}
