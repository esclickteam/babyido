"use client";

import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface LegalDisclaimerProps {
  variant?: "general" | "feedingCalculator" | "ai" | "tastings";
  className?: string;
}

export function LegalDisclaimer({ variant = "general", className }: LegalDisclaimerProps) {
  const t = useTranslations("legal");

  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground backdrop-blur-sm",
        className
      )}
      role="note"
      aria-live="polite"
    >
      <Info className="mt-0.5 size-4 shrink-0 text-primary/70" aria-hidden />
      <p>{t(variant)}</p>
    </div>
  );
}
