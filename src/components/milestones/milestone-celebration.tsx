"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface MilestoneCelebrationProps {
  title: string;
  onDone: () => void;
}

export function MilestoneCelebration({ title, onDone }: MilestoneCelebrationProps) {
  useEffect(() => {
    const id = setTimeout(onDone, 2800);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        className={cn(
          "relative max-w-sm rounded-3xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-white p-8 text-center shadow-2xl",
          "animate-in zoom-in-95 fade-in duration-300"
        )}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          {["🎉", "⭐", "🎊", "✨", "🌟"].map((e, i) => (
            <span
              key={i}
              className="absolute animate-bounce text-2xl"
              style={{
                top: `${10 + (i * 17) % 70}%`,
                left: `${5 + (i * 23) % 80}%`,
                animationDelay: `${i * 0.15}s`,
              }}
            >
              {e}
            </span>
          ))}
        </div>
        <p className="relative text-5xl">🎉</p>
        <h3 className="relative mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--grass-deep)]">
          כל הכבוד!
        </h3>
        <p className="relative mt-2 text-sm font-semibold text-[var(--ink)]">{title}</p>
        <p className="relative mt-1 text-xs text-muted-foreground">אבן דרך חדשה נשמרה ביומן</p>
      </div>
    </div>
  );
}
