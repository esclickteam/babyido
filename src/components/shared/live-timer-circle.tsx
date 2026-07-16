"use client";

import type { ReactNode } from "react";
import { Square } from "lucide-react";
import { cn } from "@/lib/utils";

type TimerTheme = "amber" | "indigo" | "orange";

const THEME_STYLES: Record<
  TimerTheme,
  { active: string; idle: string; ring: string; ping: string; text: string; sub: string }
> = {
  amber: {
    active: "border-amber-400 bg-gradient-to-b from-amber-100 to-amber-50 shadow-lg shadow-amber-200/50",
    idle: "border-amber-300 bg-white hover:border-amber-400 hover:bg-amber-50",
    ring: "text-amber-500",
    ping: "bg-amber-400",
    text: "text-amber-900",
    sub: "text-amber-700",
  },
  indigo: {
    active: "border-indigo-500 bg-gradient-to-b from-indigo-100 to-indigo-50 shadow-lg shadow-indigo-200/50",
    idle: "border-indigo-300 bg-white hover:border-indigo-400 hover:bg-indigo-50",
    ring: "text-indigo-500",
    ping: "bg-indigo-500",
    text: "text-indigo-900",
    sub: "text-indigo-700",
  },
  orange: {
    active: "border-orange-400 bg-gradient-to-b from-orange-100 to-orange-50 shadow-lg shadow-orange-200/50",
    idle: "border-orange-300 bg-white hover:border-orange-400 hover:bg-orange-50",
    ring: "text-orange-500",
    ping: "bg-orange-400",
    text: "text-orange-900",
    sub: "text-orange-700",
  },
};

interface LiveTimerCircleProps {
  isActive: boolean;
  timerLabel: string;
  onPress: () => void;
  disabled?: boolean;
  idleIcon: ReactNode;
  tapToStartLabel: string;
  tapToStopLabel: string;
  theme: TimerTheme;
  size?: "md" | "lg";
}

export function LiveTimerCircle({
  isActive,
  timerLabel,
  onPress,
  disabled,
  idleIcon,
  tapToStartLabel,
  tapToStopLabel,
  theme,
  size = "lg",
}: LiveTimerCircleProps) {
  const styles = THEME_STYLES[theme];
  const dim = size === "lg" ? "size-40 sm:size-44" : "size-36 sm:size-40";
  const seconds = isActive ? Number(timerLabel.split(":").pop() ?? "0") : 0;
  const secondProgress = isActive ? (seconds / 60) * 289 : 0;

  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-full border-4 text-center transition-all active:scale-95 disabled:opacity-60",
        dim,
        isActive ? styles.active : styles.idle
      )}
    >
      <svg
        className={cn("pointer-events-none absolute inset-1 -rotate-90", styles.ring)}
        viewBox="0 0 100 100"
        aria-hidden
      >
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.18" />
        {isActive && (
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${secondProgress} 289`}
            className="transition-[stroke-dasharray] duration-1000 ease-linear"
          />
        )}
      </svg>

      {isActive && (
        <span className={cn("absolute inset-0 animate-ping rounded-full opacity-20", styles.ping)} />
      )}

      {isActive ? (
        <>
          <Square className={cn("relative mb-1.5 size-5", styles.sub)} />
          <span
            className={cn(
              "relative font-mono text-2xl font-bold tabular-nums tracking-tight sm:text-[1.75rem]",
              styles.text
            )}
          >
            {timerLabel}
          </span>
          <span className={cn("relative mt-1.5 text-[11px] font-bold", styles.sub)}>{tapToStopLabel}</span>
        </>
      ) : (
        <>
          <div className="relative opacity-90">{idleIcon}</div>
          <span className={cn("relative mt-2 font-mono text-sm tabular-nums opacity-40", styles.text)}>
            0:00:00
          </span>
          <span className={cn("relative mt-1 text-sm font-bold", styles.sub)}>{tapToStartLabel}</span>
        </>
      )}
    </button>
  );
}
