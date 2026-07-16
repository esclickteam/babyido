"use client";

import { Baby, Sparkles } from "lucide-react";
import { MOH_RECOMMENDED_SOLIDS_MONTH } from "@/constants/tastings";
import { IdoButton } from "@/components/idoland/ido-button";
import { IdoPanel } from "@/components/idoland/ido-panel";
import { cn } from "@/lib/utils";

interface TastingStartPanelProps {
  babyAgeMonths: number;
  title: string;
  mohLine: string;
  flexLine: string;
  ageLine: string;
  buttonLabel: string;
  loading?: boolean;
  onStart: () => void;
}

export function TastingStartPanel({
  babyAgeMonths,
  title,
  mohLine,
  flexLine,
  ageLine,
  buttonLabel,
  loading,
  onStart,
}: TastingStartPanelProps) {
  const atMohAge = babyAgeMonths >= MOH_RECOMMENDED_SOLIDS_MONTH;

  return (
    <IdoPanel className="relative overflow-hidden border-[var(--coral)]/30 bg-gradient-to-l from-[#fff8f0] via-white to-[#eefaf3] p-6 sm:p-8">
      <div className="absolute -left-10 top-0 size-36 rounded-full bg-[var(--coral)]/10 blur-3xl" />
      <div className="absolute -bottom-8 -right-8 size-32 rounded-full bg-[var(--grass)]/15 blur-3xl" />

      <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:text-right">
        <div
          className={cn(
            "flex size-20 shrink-0 items-center justify-center rounded-3xl shadow-md",
            atMohAge ? "bg-[var(--grass)]/20" : "bg-[var(--coral)]/15"
          )}
        >
          <span className="text-4xl" aria-hidden>
            🥄
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <Sparkles className="size-5 text-[var(--coral)]" />
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--grass-deep)] sm:text-2xl">
              {title}
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-[var(--ink)]/80">{mohLine}</p>
          <p className="text-sm text-muted-foreground">{flexLine}</p>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-[var(--grass-deep)] shadow-sm">
            <Baby className="size-3.5" />
            {ageLine}
          </p>
        </div>

        <IdoButton
          wide
          onClick={onStart}
          disabled={loading}
          className="shrink-0 px-8 py-3 text-base shadow-lg sm:w-auto"
        >
          {loading ? "..." : buttonLabel}
        </IdoButton>
      </div>
    </IdoPanel>
  );
}
