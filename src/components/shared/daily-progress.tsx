"use client";

import { cn } from "@/lib/utils";

interface DailyProgressProps {
  eaten: number;
  goal: number;
  unit: string;
  eatenLabel: string;
  remainingLabel: string;
  className?: string;
}

export function DailyProgress({
  eaten,
  goal,
  unit,
  eatenLabel,
  remainingLabel,
  className,
}: DailyProgressProps) {
  const remaining = Math.max(0, goal - eaten);
  const pct = goal > 0 ? Math.min(100, Math.round((eaten / goal) * 100)) : 0;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{eatenLabel}</p>
          <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--grass-deep)]">
            {eaten} <span className="text-lg font-semibold">{unit}</span>
          </p>
        </div>
        <div className="text-left">
          <p className="text-sm text-muted-foreground">{remainingLabel}</p>
          <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--coral)]">
            {remaining} <span className="text-base font-semibold">{unit}</span>
          </p>
        </div>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-white/60 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-l from-[var(--grass)] to-[var(--grass-deep)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-center text-xs text-muted-foreground">
        {pct}% מתוך {goal} {unit}
      </p>
    </div>
  );
}
