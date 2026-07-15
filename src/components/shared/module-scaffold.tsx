"use client";

import { useTranslations } from "next-intl";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";

interface ModuleScaffoldProps {
  showLegal?: boolean;
  legalVariant?: "general" | "feedingCalculator" | "ai";
  children?: React.ReactNode;
}

export function ModuleScaffold({
  showLegal = false,
  legalVariant = "general",
  children,
}: ModuleScaffoldProps) {
  const t = useTranslations("modules");

  return (
    <div className="space-y-6">
      {children ?? (
        <div className="rounded-3xl border border-dashed border-border/70 bg-muted/20 p-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">{t("comingSoon")}</p>
          <p className="mt-2 text-sm text-muted-foreground/80">{t("comingSoonDesc")}</p>
        </div>
      )}
      {showLegal && <LegalDisclaimer variant={legalVariant} />}
    </div>
  );
}
