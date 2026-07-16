"use client";

import { Sparkles } from "lucide-react";
import { useEffect } from "react";
import { CelebrationStar } from "@/components/milestones/milestone-icons";
import { cn } from "@/lib/utils";

interface MilestoneCelebrationProps {
  title: string;
  onDone: () => void;
}

const CONFETTI = [
  { left: "12%", delay: "0s", color: "bg-violet-400" },
  { left: "28%", delay: "0.2s", color: "bg-amber-400" },
  { left: "44%", delay: "0.1s", color: "bg-sky-400" },
  { left: "60%", delay: "0.35s", color: "bg-emerald-400" },
  { left: "76%", delay: "0.15s", color: "bg-rose-400" },
  { left: "88%", delay: "0.25s", color: "bg-orange-400" },
];

export function MilestoneCelebration({ title, onDone }: MilestoneCelebrationProps) {
  useEffect(() => {
    const id = setTimeout(onDone, 3000);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div
        className={cn(
          "relative w-full max-w-sm overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-b from-amber-50 via-white to-violet-50/30 p-8 text-center shadow-2xl",
          "animate-in zoom-in-95 fade-in duration-300"
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 overflow-hidden">
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              className={cn("absolute top-2 size-2 rounded-full ms-confetti", c.color)}
              style={{ left: c.left, animationDelay: c.delay }}
            />
          ))}
        </div>

        <CelebrationStar />

        <h3 className="relative mt-4 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--grass-deep)]">
          כל הכבוד!
        </h3>
        <p className="relative mt-2 text-sm font-semibold text-[var(--ink)]">{title}</p>
        <p className="relative mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-violet-500 ms-icon-float" />
          אבן דרך חדשה נשמרה ביומן
        </p>
      </div>
    </div>
  );
}
