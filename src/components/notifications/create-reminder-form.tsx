"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useCreateReminder } from "@/hooks/use-reminders";
import { useBabyStore } from "@/stores/baby-store";
import { getNowLocalTime, getTodayLocal } from "@/utils/date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IdoPanel } from "@/components/idoland/ido-panel";

export function CreateReminderForm() {
  const t = useTranslations("notifications");
  const tc = useTranslations("common");
  const babyId = useBabyStore((s) => s.selectedBabyId);
  const create = useCreateReminder();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [date, setDate] = useState(getTodayLocal());
  const [time, setTime] = useState(getNowLocalTime().slice(0, 5));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    const timeValue = time.length === 5 ? `${time}:00` : time;

    create.mutate(
      {
        babyId: babyId ?? undefined,
        title: title.trim(),
        body: body.trim(),
        date,
        time: timeValue,
      },
      {
        onSuccess: () => {
          toast.success(t("reminderCreated"));
          setTitle("");
          setBody("");
        },
        onError: () => toast.error(tc("error")),
      }
    );
  }

  return (
    <IdoPanel className="space-y-4 border-violet-200/60 bg-gradient-to-l from-violet-50/50 to-white p-5">
      <div>
        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--grass-deep)]">
          {t("createReminder")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("createReminderHint")}</p>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 sm:col-span-2">
          <Label>{t("reminderTitle")}</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("reminderTitlePlaceholder")}
            className="rounded-xl"
          />
        </label>
        <label className="grid gap-1.5 sm:col-span-2">
          <Label>{t("reminderBody")}</Label>
          <Input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("reminderBodyPlaceholder")}
            className="rounded-xl"
          />
        </label>
        <label className="grid gap-1.5">
          <Label>{t("reminderDate")}</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl" dir="ltr" />
        </label>
        <label className="grid gap-1.5">
          <Label>{t("reminderTime")}</Label>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-xl" dir="ltr" />
        </label>
        <div className="sm:col-span-2">
          <Button type="submit" className="w-full rounded-xl gap-2 sm:w-auto" disabled={create.isPending}>
            <Plus className="size-4" />
            {t("addReminder")}
          </Button>
        </div>
      </form>
    </IdoPanel>
  );
}
