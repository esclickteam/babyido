"use client";

import { Baby } from "lucide-react";
import { useTranslations } from "next-intl";
import { LinkButton } from "@/components/shared/link-button";
import { GlassCard } from "@/components/shared/glass-card";

export function NoBabyPrompt() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");

  return (
    <GlassCard className="mx-auto max-w-lg space-y-6 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <Baby className="size-8" />
      </div>
      <div className="space-y-2">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--grass-deep)]">
          {t("noBaby")}
        </h2>
        <p className="text-muted-foreground">{tc("tagline")}</p>
      </div>
      <LinkButton href="/dashboard/baby" className="no-pulse">
        {t("addBaby")}
      </LinkButton>
    </GlassCard>
  );
}
