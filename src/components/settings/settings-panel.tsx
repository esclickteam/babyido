"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
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
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid gap-6 md:grid-cols-2">
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
