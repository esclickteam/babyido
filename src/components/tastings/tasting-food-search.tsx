"use client";

import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { FoodItem } from "@/constants/tastings";
import { searchFoods, normalizeFoodQuery } from "@/utils/tasting-foods";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TastingFoodSearchProps {
  onSelectFood: (food: FoodItem) => void;
  onAddCustom: (name: string) => void;
  tastedFoodIds: Set<string>;
  searchPlaceholder: string;
  addCustomLabel: (name: string) => string;
  noResultsLabel: string;
  inOrderLabel: (step: number) => string;
  extraFoodLabel: string;
  doneLabel: string;
  fromMonthLabel: (month: number) => string;
  allergenLabel: string;
}

export function TastingFoodSearch({
  onSelectFood,
  onAddCustom,
  tastedFoodIds,
  searchPlaceholder,
  addCustomLabel,
  noResultsLabel,
  inOrderLabel,
  extraFoodLabel,
  doneLabel,
  fromMonthLabel,
  allergenLabel,
}: TastingFoodSearchProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => searchFoods(query, 16), [query]);
  const normalized = normalizeFoodQuery(query);
  const showDropdown = focused && normalized.length > 0;
  const exactMatch = results.some(
    (f) => f.nameHe === normalized || f.nameEn.toLowerCase() === normalized.toLowerCase()
  );

  return (
    <div className="relative space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={searchPlaceholder}
          className="rounded-2xl border-[var(--stroke)] bg-white/90 py-3 pr-11 shadow-sm focus-visible:ring-[var(--grass)]"
        />
      </div>

      {showDropdown && (
        <ul className="absolute z-20 max-h-80 w-full overflow-y-auto rounded-2xl border border-[var(--stroke)] bg-white shadow-lg">
          {results.map((food) => {
            const done = tastedFoodIds.has(food.id);
            return (
              <li key={food.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onSelectFood(food);
                    setQuery("");
                    setFocused(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 border-b border-[var(--stroke)]/60 px-4 py-3 text-right transition last:border-b-0 hover:bg-[var(--grass)]/8",
                    done && "opacity-70"
                  )}
                >
                  <span className="text-xl">{food.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{food.nameHe}</p>
                    <p className="text-xs text-muted-foreground">
                      {food.orderIndex ? inOrderLabel(food.orderIndex) : extraFoodLabel}
                      {` · ${fromMonthLabel(food.fromMonth)}`}
                      {food.isAllergen && ` · ${allergenLabel}`}
                    </p>
                  </div>
                  {done && (
                    <span className="shrink-0 rounded-full bg-[var(--grass)]/15 px-2 py-0.5 text-xs font-semibold text-[var(--grass-deep)]">
                      {doneLabel}
                    </span>
                  )}
                </button>
              </li>
            );
          })}

          {!exactMatch && normalized.length >= 2 && (
            <li>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onAddCustom(normalized);
                  setQuery("");
                  setFocused(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-right font-semibold text-[var(--coral)] transition hover:bg-[var(--coral)]/8"
              >
                <Plus className="size-4 shrink-0" />
                {addCustomLabel(normalized)}
              </button>
            </li>
          )}

          {results.length === 0 && normalized.length >= 2 && (
            <li className="px-4 py-3 text-sm text-muted-foreground">{noResultsLabel}</li>
          )}
        </ul>
      )}
    </div>
  );
}
