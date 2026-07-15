"use client";

import { format } from "date-fns";
import { Check, ChevronLeft, Plus, Sparkles, Trash2, UtensilsCrossed } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FOOD_CATEGORIES, TASTING_REACTIONS, type FoodCategory, type TastingReaction } from "@/constants/feeding";
import { TASTING_ORDER } from "@/constants/tastings";
import { useCreateTasting, useDeleteTasting, useTastings } from "@/hooks/use-tastings";
import { useBabyStore } from "@/stores/baby-store";
import { formatDate } from "@/utils/date";
import { getBabyAgeInMonths } from "@/utils/age";
import type { Locale } from "@/types";
import { IdoButton } from "@/components/idoland/ido-button";
import { IdoPanel } from "@/components/idoland/ido-panel";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { NoBabyPrompt } from "@/components/shared/no-baby-prompt";
import { Input } from "@/components/ui/input";
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

type Tab = "recommended" | "custom" | "history";

export function TastingsContent() {
  const t = useTranslations("tastings");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const baby = useBabyStore((s) => s.getSelectedBaby());
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState<Tab>("recommended");
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState<FoodCategory>("vegetables");
  const [tastedDate, setTastedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [reactions, setReactions] = useState<TastingReaction[]>([]);
  const [notes, setNotes] = useState("");

  const { data: tastings, isLoading } = useTastings(baby?._id ?? null);
  const createTasting = useCreateTasting(baby?._id ?? null);
  const deleteTasting = useDeleteTasting(baby?._id ?? null);

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setTab("custom");
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [searchParams]);

  const babyAgeMonths = baby ? getBabyAgeInMonths(baby.birthDate) : 0;

  const tastedFoodIds = useMemo(
    () => new Set(tastings?.map((t) => t.foodId ?? t.foodName) ?? []),
    [tastings]
  );

  const nextRecommended = useMemo(
    () => TASTING_ORDER.find((f) => !tastedFoodIds.has(f.id)),
    [tastedFoodIds]
  );

  const selectedFood = TASTING_ORDER.find((f) => f.id === selectedFoodId);

  if (!baby) return <NoBabyPrompt />;

  function toggleReaction(r: TastingReaction) {
    setReactions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  }

  function resetForm() {
    setSelectedFoodId(null);
    setCustomName("");
    setReactions([]);
    setNotes("");
    setTastedDate(format(new Date(), "yyyy-MM-dd"));
  }

  async function handleLogRecommended() {
    if (!baby || !selectedFood) return;
    try {
      await createTasting.mutateAsync({
        babyId: baby._id,
        foodName: selectedFood.nameHe,
        foodId: selectedFood.id,
        category: selectedFood.category,
        tastedDate: new Date(tastedDate).toISOString(),
        reactions,
        isAllergen: selectedFood.isAllergen,
        recommendedAge: `${selectedFood.fromMonth}+`,
        notes: notes || undefined,
        isCustom: false,
      });
      toast.success(t("saved"));
      resetForm();
      setSelectedFoodId(null);
    } catch {
      toast.error(tc("error"));
    }
  }

  async function handleLogCustom(e: React.FormEvent) {
    e.preventDefault();
    if (!baby || !customName.trim()) {
      toast.error(t("foodNameRequired"));
      return;
    }
    try {
      await createTasting.mutateAsync({
        babyId: baby._id,
        foodName: customName.trim(),
        category: customCategory,
        tastedDate: new Date(tastedDate).toISOString(),
        reactions,
        notes: notes || undefined,
        isCustom: true,
      });
      toast.success(t("saved"));
      resetForm();
    } catch {
      toast.error(tc("error"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(
          [
            { key: "recommended" as const, label: t("recommendedOrder"), icon: Sparkles },
            { key: "custom" as const, label: t("customFood"), icon: Plus },
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

      {nextRecommended && tab === "recommended" && (
        <IdoPanel className="flex items-center gap-4 p-4 sm:p-5">
          <span className="text-3xl">{nextRecommended.emoji}</span>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{t("nextSuggested")}</p>
            <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--grass-deep)]">
              {nextRecommended.nameHe}
            </p>
          </div>
          <IdoButton onClick={() => setSelectedFoodId(nextRecommended.id)}>
            {t("logTasting")}
          </IdoButton>
        </IdoPanel>
      )}

      {tab === "recommended" && (
        <IdoPanel className="space-y-4 p-5 sm:p-6">
          <SectionTitle>{t("recommendedOrder")}</SectionTitle>
          <p className="text-sm text-muted-foreground">{t("orderHint")}</p>

          <ul className="space-y-2">
            {TASTING_ORDER.map((food, index) => {
              const done = tastedFoodIds.has(food.id);
              const isNext = nextRecommended?.id === food.id;
              const ageOk = babyAgeMonths >= food.fromMonth;

              return (
                <li key={food.id}>
                  <button
                    type="button"
                    onClick={() => !done && setSelectedFoodId(food.id)}
                    disabled={done}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border p-4 text-right transition",
                      done
                        ? "border-[var(--grass)]/30 bg-[var(--grass)]/10 opacity-80"
                        : isNext
                          ? "border-[var(--coral)] bg-white shadow-md"
                          : "border-[var(--stroke)] bg-white/80 hover:bg-white",
                      !ageOk && !done && "opacity-60"
                    )}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
                      {done ? <Check className="size-4 text-[var(--grass-deep)]" /> : index + 1}
                    </span>
                    <span className="text-2xl">{food.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{food.nameHe}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("fromMonth", { month: food.fromMonth })}
                        {food.isAllergen && ` · ${t("allergen")}`}
                        {!ageOk && ` · ${t("waitAge")}`}
                      </p>
                    </div>
                    {done && (
                      <span className="shrink-0 rounded-full bg-[var(--grass)]/20 px-2 py-0.5 text-xs font-semibold text-[var(--grass-deep)]">
                        {t("done")}
                      </span>
                    )}
                    {!done && (
                      <ChevronLeft className="size-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </IdoPanel>
      )}

      {tab === "recommended" && selectedFood && (
        <IdoPanel className="space-y-5 p-5 sm:p-6">
          <SectionTitle>
            {t("logFood")}: {selectedFood.emoji} {selectedFood.nameHe}
          </SectionTitle>
          <TastingFormFields
            tastedDate={tastedDate}
            setTastedDate={setTastedDate}
            reactions={reactions}
            toggleReaction={toggleReaction}
            notes={notes}
            setNotes={setNotes}
            t={t}
            tc={tc}
          />
          <div className="flex gap-3">
            <IdoButton variant="ghost" onClick={() => setSelectedFoodId(null)}>
              {tc("cancel")}
            </IdoButton>
            <IdoButton wide onClick={handleLogRecommended} disabled={createTasting.isPending}>
              {createTasting.isPending ? tc("loading") : t("saveTasting")}
            </IdoButton>
          </div>
        </IdoPanel>
      )}

      {tab === "custom" && (
        <div ref={formRef}>
          <IdoPanel className="space-y-5 p-5 sm:p-6">
            <SectionTitle>{t("customFood")}</SectionTitle>
            <p className="text-sm text-muted-foreground">{t("customHint")}</p>

            <form onSubmit={handleLogCustom} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("foodName")}</Label>
                <Input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={t("foodNamePlaceholder")}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("category")}</Label>
                <Select value={customCategory} onValueChange={(v) => setCustomCategory(v as FoodCategory)}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FOOD_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {t(`categories.${c}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <TastingFormFields
                tastedDate={tastedDate}
                setTastedDate={setTastedDate}
                reactions={reactions}
                toggleReaction={toggleReaction}
                notes={notes}
                setNotes={setNotes}
                t={t}
                tc={tc}
              />
              <IdoButton type="submit" wide disabled={createTasting.isPending}>
                {createTasting.isPending ? tc("loading") : t("saveTasting")}
              </IdoButton>
            </form>
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
              {tastings.map((item) => (
                <li
                  key={item._id}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--stroke)] bg-white/80 p-4 shadow-sm"
                >
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
                      {item.reactions.length > 0 &&
                        ` · ${item.reactions.map((r) => t(`reactions.${r}`)).join(", ")}`}
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
              ))}
            </ul>
          )}
        </IdoPanel>
      )}

      <LegalDisclaimer />
    </div>
  );
}

function TastingFormFields({
  tastedDate,
  setTastedDate,
  reactions,
  toggleReaction,
  notes,
  setNotes,
  t,
  tc,
}: {
  tastedDate: string;
  setTastedDate: (v: string) => void;
  reactions: TastingReaction[];
  toggleReaction: (r: TastingReaction) => void;
  notes: string;
  setNotes: (v: string) => void;
  t: ReturnType<typeof useTranslations<"tastings">>;
  tc: ReturnType<typeof useTranslations<"common">>;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>{tc("date")}</Label>
        <Input
          type="date"
          value={tastedDate}
          onChange={(e) => setTastedDate(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("reactionsLabel")}</Label>
        <div className="flex flex-wrap gap-2">
          {TASTING_REACTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => toggleReaction(r)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-semibold transition",
                reactions.includes(r)
                  ? "bg-[var(--coral)] text-white"
                  : "bg-white/80 text-[var(--ink)] hover:bg-white"
              )}
            >
              {t(`reactions.${r}`)}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>{t("notes")}</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={cn(inputClass, "min-h-[80px]")}
        />
      </div>
    </>
  );
}
