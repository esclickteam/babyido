"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { useUpdateNotificationEmail, useUserProfile } from "@/hooks/use-user-settings";
import { GlassCard } from "@/components/shared/glass-card";
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

export function SettingsPanel() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const { theme, setTheme } = useTheme();
  const { data: profile } = useUserProfile();
  const updateEmail = useUpdateNotificationEmail();
  const [notificationEmail, setNotificationEmail] = useState("");

  useEffect(() => {
    if (profile) setNotificationEmail(profile.notificationEmail ?? "");
  }, [profile]);

  function handleSaveEmail() {
    updateEmail.mutate(notificationEmail, {
      onSuccess: () => toast.success(t("notificationEmailSaved")),
      onError: () => toast.error(tc("error")),
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <GlassCard className="space-y-4 md:col-span-2">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50">
            <Mail className="size-5 text-sky-600" />
          </div>
          <div>
            <Label className="text-base font-bold">{t("notificationEmail")}</Label>
            <p className="text-sm text-muted-foreground">{t("notificationEmailHint")}</p>
          </div>
        </div>
        <Input
          type="email"
          dir="ltr"
          value={notificationEmail}
          onChange={(e) => setNotificationEmail(e.target.value)}
          placeholder={profile?.email ?? "you@example.com"}
          className="rounded-xl"
        />
        {profile?.email && (
          <p className="text-xs text-muted-foreground">
            {t("accountEmail")}: <span dir="ltr">{profile.email}</span>
          </p>
        )}
        <Button
          className="rounded-xl"
          onClick={handleSaveEmail}
          disabled={updateEmail.isPending}
        >
          {tc("save")}
        </Button>
      </GlassCard>

      <GlassCard className="space-y-4">
        <Label>{t("theme")}</Label>
        <Select value={theme ?? "system"} onValueChange={(v) => v && setTheme(v)}>
          <SelectTrigger className="rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">{t("light")}</SelectItem>
            <SelectItem value="dark">{t("dark")}</SelectItem>
            <SelectItem value="system">{t("system")}</SelectItem>
          </SelectContent>
        </Select>
      </GlassCard>

      <GlassCard className="space-y-4 md:col-span-2">
        <Button variant="outline" className="rounded-xl">
          {t("exportData")}
        </Button>
        <Button variant="destructive" className="rounded-xl">
          {t("deleteAccount")}
        </Button>
      </GlassCard>
    </div>
  );
}
