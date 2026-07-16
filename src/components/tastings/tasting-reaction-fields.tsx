"use client";

import { TASTING_REACTIONS, type TastingReaction } from "@/constants/feeding";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TastingReactionFieldsProps {
  reactions: TastingReaction[];
  onToggle: (reaction: TastingReaction) => void;
  reactionsLabel: string;
  noReactionHint: string;
  className?: string;
  getReactionLabel: (reaction: TastingReaction) => string;
}

export function TastingReactionFields({
  reactions,
  onToggle,
  reactionsLabel,
  noReactionHint,
  className,
  getReactionLabel,
}: TastingReactionFieldsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label>{reactionsLabel}</Label>
        <span className="text-xs text-muted-foreground">{noReactionHint}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {TASTING_REACTIONS.map((reaction) => {
          const checked = reactions.includes(reaction);
          const inputId = `reaction-${reaction}`;
          return (
            <label
              key={reaction}
              htmlFor={inputId}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition",
                checked
                  ? "border-[var(--coral)] bg-[var(--coral)]/10"
                  : "border-[var(--stroke)] bg-white/80 hover:bg-white"
              )}
            >
              <input
                id={inputId}
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(reaction)}
                className="size-4 shrink-0 rounded border-[var(--stroke)] accent-[var(--coral)]"
              />
              <span className="text-sm font-semibold text-[var(--ink)]">
                {getReactionLabel(reaction)}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
