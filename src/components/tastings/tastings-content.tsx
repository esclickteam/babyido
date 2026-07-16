"use client";

import { Search, Sparkles, Trash2, UtensilsCrossed } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FOOD_CATEGORIES, type FoodCategory, type TastingReaction } from "@/constants/feeding";
import {
  MOH_RECOMMENDED_SOLIDS_MONTH,
  ORDERED_FOODS,
  TASTING_ORDER,
  TASTING_PHASES,
  type FoodItem,
} from "@/constants/tastings";
import { useStartSolids } from "@/hooks/use-babies";
import { useCreateTasting, useDeleteTasting, useTastings } from "@/hooks/use-tastings";
import { useBabyStore } from "@/stores/baby-store";
import { formatDate, getExactAge, getTodayLocal } from "@/utils/date";
import { getBabyAgeInMonths } from "@/utils/age";
import {
  findNextRecommendedFoodId,
  FOOD_STATUS_META,
  getFoodStatus,
  getTastingsByFoodId,
  hasSolidsStarted,
  type FoodStatus,
} from "@/utils/tasting-status";
import type { Locale } from "@/types";
import { HebrewDateInput } from "@/components/shared/hebrew-date-input";
import { IdoButton } from "@/components/idoland/ido-button";
import { IdoPanel } from "@/components/idoland/ido-panel";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { NoBabyPrompt } from "@/components/shared/no-baby-prompt";
import { TastingFoodSearch } from "@/components/tastings/tasting-food-search";
import { TastingPhaseSection } from "@/components/tastings/tasting-phase-section";
import { TastingReactionFields } from "@/components/tastings/tasting-reaction-fields";
import { TastingStartPanel } from "@/components/tastings/tasting-start-panel";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const inputClass =
  "rounded-2xl border-[var(--stroke)] bg-white/90 py-3 shadow-sm focus-visible:ring-[var(--grass)]";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--grass-deep)]">
      {children}
    </h3>
  );
}

type Tab = "recommended" | "search" | "history";

type LogTarget =
  | { kind: "ordered"; food: FoodItem }
  | { kind: "catalog"; food: FoodItem }
  | { kind: "custom"; name: string; category: FoodCategory };

export function TastingsContent() {
  const t = useTranslations("tastings");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const baby = useBabyStore((s) => s.getSelectedBaby());
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState<Tab>("recommended");
  const [logTarget, setLogTarget] = useState<LogTarget | null>(null);
  const [tastedDate, setTastedDate] = useState(getTodayLocal());
  const [reactions, setReactions] = useState<TastingReaction[]>([]);
  const [notes, setNotes] = useState("");

  const { data: tastings, isLoading } = useTastings(baby?._id ?? null);
  const createTasting = useCreateTasting(baby?._id ?? null);
  const deleteTasting = useDeleteTasting(baby?._id ?? null);
  const startSolids = useStartSolids();

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setTab("search");
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [searchParams]);

  const babyAgeMonths = baby ? getBabyAgeInMonths(baby.birthDate) : 0;
  const babyExactAge = baby ? getExactAge(baby.birthDate, locale) : "";

  const tastedFoodIds = useMemo(
    () => new Set(tastings?.map((entry) => entry.foodId ?? entry.foodName) ?? []),
    [tastings]
  );

  const tastingsByFood = useMemo(
    () => getTastingsByFoodId(tastings ?? []),
    [tastings]
  );

  const solidsStarted = hasSolidsStarted(baby?.solidsStartedAt, tastings?.length ?? 0);

  const nextRecommendedId = useMemo(
    () => findNextRecommendedFoodId(tastingsByFood, solidsStarted),
    [tastingsByFood, solidsStarted]
  );

  const orderedProgress = useMemo(
    () => ORDERED_FOODS.filter((food) => tastedFoodIds.has(food.id)).length,
    [tastedFoodIds]
  );

  const nextRecommended = useMemo(
    () => ORDERED_FOODS.find((food) => food.id === nextRecommendedId) ?? null,
    [nextRecommendedId]
  );

  const progressPercent = Math.round((orderedProgress / TASTING_ORDER.length) * 100);

  const statusLabel = (status: FoodStatus) => t(`status.${status}`);

  function openFood(food: FoodItem) {
    if (!solidsStarted) return;
    const entry = tastingsByFood.get(food.id);
    const status = getFoodStatus(food.id, entry, nextRecommendedId, solidsStarted);
    if (status === "too_early" || status === "not_started") return;
    setLogTarget({ kind: food.orderIndex ? "ordered" : "catalog", food });
    setReactions([]);
    setNotes("");
    setTastedDate(getTodayLocal());
    setTab("recommended");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function openCustomFood(name: string) {
    setLogTarget({ kind: "custom", name, category: "vegetables" });
    setReactions([]);
    setNotes("");
    setTastedDate(getTodayLocal());
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!baby) return <NoBabyPrompt />;

  function toggleReaction(r: TastingReaction) {
    setReactions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  }

  function resetForm() {
    setLogTarget(null);
    setReactions([]);
    setNotes("");
    setTastedDate(getTodayLocal());
  }

  function openCatalogFood(food: FoodItem) {
    openFood(food);
  }

  async function handleStartSolids() {
    if (!baby) return;
    try {
      await startSolids.mutateAsync(baby._id);
      toast.success(t("startSolidsSuccess"));
    } catch {
      toast.error(tc("error"));
    }
  }

  async function handleSave() {
    if (!baby || !logTarget) return;

    const payload = (() => {
      if (logTarget.kind === "ordered" || logTarget.kind === "catalog") {
        const { food } = logTarget;
        return {
          babyId: baby._id,
          foodName: food.nameHe,
          foodId: food.id,
          category: food.category,
          tastedDate,
          reactions,
          isAllergen: food.isAllergen,
          recommendedAge: `${food.fromMonth}+`,
          notes: notes || undefined,
          isCustom: logTarget.kind === "catalog",
        };
      }
      if (!logTarget.name.trim()) {
        toast.error(t("foodNameRequired"));
        return null;
      }
      return {
        babyId: baby._id,
        foodName: logTarget.name.trim(),
        category: logTarget.category,
        tastedDate,
        reactions,
        notes: notes || undefined,
        isCustom: true,
      };
    })();

    if (!payload) return;

    try {
      await createTasting.mutateAsync(payload);
      toast.success(t("saved"));
      resetForm();
    } catch {
      toast.error(tc("error"));
    }
  }

  const logTitle = (() => {
    if (!logTarget) return null;
    if (logTarget.kind === "custom") return logTarget.name;
    return `${logTarget.food.emoji} ${logTarget.food.nameHe}`;
  })();

  return (
    <div className="space-y-6">
      <LegalDisclaimer variant="tastings" />

      <IdoPanel className="space-y-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{t("progressLabel")}</p>
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--grass-deep)]">
              {t("progressCount", {
                done: orderedProgress,
                total: TASTING_ORDER.length,
              })}
            </p>
          </div>
          <span className="rounded-full bg-[var(--grass)]/15 px-3 py-1 text-sm font-bold text-[var(--grass-deep)]">
            {progressPercent}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/70">
          <div
            className="h-full rounded-full bg-[var(--grass)] transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </IdoPanel>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(
          [
            { key: "recommended" as const, label: t("recommendedOrder"), icon: Sparkles },
            { key: "search" as const, label: t("searchAndAdd"), icon: Search },
            { key: "history" as const, label: t("history"), icon: UtensilsCrossed },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition",
              tab === key
                ? "bg-[var(--coral)] text-white shadow-md"
                : "bg-white/70 text-[var(--ink)] hover:bg-white"
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "recommended" && !solidsStarted && (
        <TastingStartPanel
          babyAgeMonths={babyAgeMonths}
          title={t("startSolidsTitle")}
          mohLine={t("startSolidsMoh", { month: MOH_RECOMMENDED_SOLIDS_MONTH })}
          flexLine={t("startSolidsFlex")}
          ageLine={t("startSolidsAge", { age: babyExactAge })}
          buttonLabel={t("startSolidsButton")}
          loading={startSolids.isPending}
          onStart={handleStartSolids}
        />
      )}

      {tab === "recommended" && solidsStarted && baby.solidsStartedAt && (
        <IdoPanel className="flex items-center gap-3 border-[var(--grass)]/30 bg-[var(--grass)]/8 p-4">
          <span className="text-2xl" aria-hidden>🥄</span>
          <p className="text-sm font-semibold text-[var(--grass-deep)]">
            {t("startSolidsStarted", { date: formatDate(baby.solidsStartedAt, locale) })}
          </p>
        </IdoPanel>
      )}

      {nextRecommended && solidsStarted && tab === "recommended" && (
        <IdoPanel className="relative overflow-hidden border-[var(--coral)]/40 bg-gradient-to-l from-[#fff6f0] via-white to-[#f0faf4] p-5 sm:p-6">
          <div className="absolute -left-6 -top-6 size-24 rounded-full bg-[var(--coral)]/10 blur-2xl" />
          <div className="relative flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
            <span className="text-5xl">{nextRecommended.emoji}</span>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold text-[var(--coral)]">{t("nextSuggested")}</p>
              <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--grass-deep)]">
                {nextRecommended.nameHe}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("stepFood", {
                  step: nextRecommended.orderIndex ?? 0,
                  food: nextRecommended.nameHe,
                })}
                {" · "}
                {t("fromMonth", { month: nextRecommended.fromMonth })}
              </p>
            </div>
            <IdoButton onClick={() => openFood(nextRecommended)} className="shrink-0">
              {t("logTasting")}
            </IdoButton>
          </div>
        </IdoPanel>
      )}

      {tab === "recommended" && (
        <div className="space-y-4">
          <IdoPanel className="space-y-3 p-4 sm:p-5">
            <SectionTitle>{t("statusLegend")}</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {(
                solidsStarted
                  ? ([
                      "too_early",
                      "recommended_now",
                      "tasted",
                      "loved",
                      "neutral",
                      "try_again",
                      "had_reaction",
                    ] as FoodStatus[])
                  : (["not_started"] as FoodStatus[])
              ).map((status) => (
                <span
                  key={status}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
                    FOOD_STATUS_META[status].bgClass,
                    FOOD_STATUS_META[status].colorClass
                  )}
                >
                  {FOOD_STATUS_META[status].icon} {statusLabel(status)}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{t("orderHint")}</p>
          </IdoPanel>

          {TASTING_PHASES.map((phase) => (
            <TastingPhaseSection
              key={phase.id}
              phase={phase}
              hasStarted={solidsStarted}
              tastings={tastings ?? []}
              defaultOpen={
                !solidsStarted
                  ? phase.id === 1
                  : phase.id === 1 || phase.foods.some((food) => food.id === nextRecommendedId)
              }
              getStatusLabel={statusLabel}
              fromMonthLabel={(month) => t("fromMonth", { month })}
              triedInPhaseLabel={(done, total) => t("triedInPhase", { done, total })}
              onFoodClick={openFood}
            />
          ))}
        </div>
      )}

      {tab === "search" && (
        <div className="space-y-4">
          <IdoPanel className="space-y-4 p-5 sm:p-6">
            <SectionTitle>{t("searchAndAdd")}</SectionTitle>
            <p className="text-sm text-muted-foreground">{t("searchHint")}</p>
            <TastingFoodSearch
              onSelectFood={openCatalogFood}
              onAddCustom={openCustomFood}
              tastedFoodIds={tastedFoodIds}
              searchPlaceholder={t("searchPlaceholder")}
              addCustomLabel={(name) => t("addCustomFood", { name })}
              noResultsLabel={t("noSearchResults")}
              inOrderLabel={(step) => t("inOrderStep", { step })}
              extraFoodLabel={t("extraFood")}
              doneLabel={t("done")}
              fromMonthLabel={(month) => t("fromMonth", { month })}
              allergenLabel={t("allergen")}
            />
          </IdoPanel>
        </div>
      )}

      {logTarget && (
        <div ref={formRef}>
        <IdoPanel className="space-y-5 p-5 sm:p-6">
          <SectionTitle>
            {t("logFood")}: {logTitle}
          </SectionTitle>

          {logTarget.kind === "custom" && (
            <div className="space-y-2">
              <Label>{t("category")}</Label>
              <Select
                value={logTarget.category}
                onValueChange={(value) =>
                  setLogTarget({ ...logTarget, category: value as FoodCategory })
                }
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOOD_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {t(`categories.${category}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>{tc("date")}</Label>
            <HebrewDateInput value={tastedDate} onChange={setTastedDate} className={inputClass} />
          </div>

          <TastingReactionFields
            reactions={reactions}
            onToggle={toggleReaction}
            reactionsLabel={t("reactionsLabel")}
            noReactionHint={t("noReactionHint")}
            getReactionLabel={(reaction) => t(`reactions.${reaction}`)}
          />

          <div className="space-y-2">
            <Label>{t("notes")}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={cn(inputClass, "min-h-[80px]")}
              placeholder={t("notesPlaceholder")}
            />
          </div>

          <div className="flex gap-3">
            <IdoButton variant="ghost" onClick={resetForm}>
              {tc("cancel")}
            </IdoButton>
            <IdoButton wide onClick={handleSave} disabled={createTasting.isPending}>
              {createTasting.isPending ? tc("loading") : t("saveTasting")}
            </IdoButton>
          </div>
        </IdoPanel>
        </div>
      )}

      {tab === "history" && (
        <IdoPanel className="space-y-4 p-5 sm:p-6">
          <SectionTitle>{t("history")}</SectionTitle>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/50" />
              ))}
            </div>
          ) : !tastings?.length ? (
            <p className="text-center text-muted-foreground">{tc("noData")}</p>
          ) : (
            <ul className="space-y-3">
              {tastings.map((item) => {
                const status = getFoodStatus(
                  item.foodId ?? item.foodName,
                  item,
                  null,
                  solidsStarted
                );
                const meta = FOOD_STATUS_META[status];

                return (
                <li
                  key={item._id}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--stroke)] bg-white/80 p-4 shadow-sm"
                >
                  <span className="text-xl" aria-hidden>{meta.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {item.foodName}
                      {item.isCustom && (
                        <span className="mr-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                          {t("custom")}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.tastedDate && formatDate(item.tastedDate, locale)}
                      {" · "}
                      {item.reactions.length > 0
                        ? item.reactions.map((r) => t(`reactions.${r}`)).join(", ")
                        : t("noReactions")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteTasting.mutate(item._id)}
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                    aria-label={tc("delete")}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
                );
              })}
            </ul>
          )}
        </IdoPanel>
      )}
    </div>
  );
}
