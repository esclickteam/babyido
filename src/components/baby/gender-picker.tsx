"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { BabyFormValues } from "@/lib/validations/baby";

type Gender = BabyFormValues["gender"];

interface GenderPickerProps {
  value: Gender;
  onChange: (gender: Gender) => void;
}

const OPTIONS: { value: Gender; emoji: string; accent: string }[] = [
  { value: "male", emoji: "👦", accent: "border-sky-300 bg-sky-50 text-sky-900" },
  { value: "female", emoji: "👧", accent: "border-rose-300 bg-rose-50 text-rose-900" },
];

export function GenderPicker({ value, onChange }: GenderPickerProps) {
  const t = useTranslations("baby");

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-[var(--ink)]">{t("gender")}</p>
      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map(({ value: g, emoji, accent }) => {
          const selected = value === g;
          return (
            <button
              key={g}
              type="button"
              onClick={() => onChange(g)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3.5 font-bold transition-all",
                selected
                  ? cn(accent, "scale-[1.02] shadow-md ring-2 ring-[var(--grass)]/30")
                  : "border-[var(--stroke)] bg-white/70 text-[var(--muted-ink)] hover:bg-white"
              )}
            >
              <span className="text-xl">{emoji}</span>
              <span>{g === "male" ? t("boy") : t("girl")}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
