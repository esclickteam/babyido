"use client";

import { Pencil, Plus, Trash2, TrendingUp } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { GrowthChart } from "@/components/growth/growth-chart";
import {
  useCreateGrowthMeasurement,
  useDeleteGrowthMeasurement,
  useGrowthMeasurements,
} from "@/hooks/use-growth";
import { useBabyStore } from "@/stores/baby-store";
import type { Locale } from "@/types";
import { IdoButton } from "@/components/idoland/ido-button";
import { IdoPanel } from "@/components/idoland/ido-panel";
import { HebrewDateInput } from "@/components/shared/hebrew-date-input";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { NoBabyPrompt } from "@/components/shared/no-baby-prompt";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatDate, getTodayLocal, isoToDisplay } from "@/utils/date";
import {
  computePercentile,
  formatShortDate,
  getAgeInMonths,
  getMetricValue,
  type GrowthMetric,
  type MeasurementPlotPoint,
} from "@/utils/growth-percentile";

const inputClass =
  "rounded-xl border-[var(--stroke)] bg-white/90 py-2.5 shadow-sm focus-visible:ring-[var(--grass)]";

const MAX_MEASUREMENTS = 10;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-[var(--grass-deep)]">
      {children}
    </h3>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-sm font-semibold text-[var(--ink)]">{label}</Label>
      {children}
    </div>
  );
}

export function GrowthContent() {
  const t = useTranslations("growth");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const baby = useBabyStore((s) => s.getSelectedBaby());
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLDivElement>(null);

  const { data: measurements, isLoading } = useGrowthMeasurements(baby?._id ?? null);
  const createMeasurement = useCreateGrowthMeasurement(baby?._id ?? null);
  const deleteMeasurement = useDeleteGrowthMeasurement(baby?._id ?? null);

  const [showForm, setShowForm] = useState(false);
  const [activeMetric, setActiveMetric] = useState<GrowthMetric>("weight");
  const [date, setDate] = useState(getTodayLocal());
  const [weightKg, setWeightKg] = useState("");
  const [height, setHeight] = useState("");
  const [head, setHead] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setShowForm(true);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [searchParams]);

  const plotPoints = useMemo<MeasurementPlotPoint[]>(() => {
    if (!baby || !measurements?.length) return [];

    return measurements
      .map((m) => {
        const value = getMetricValue(activeMetric, m.weight, m.height, m.headCircumference);
        if (value == null) return null;

        const percentile = computePercentile(
          activeMetric,
          baby.gender,
          baby.birthDate,
          m.date,
          value
        );

        return {
          id: m._id,
          month: getAgeInMonths(baby.birthDate, m.date),
          value,
          percentile,
          dateLabel: formatShortDate(m.date, locale),
        };
      })
      .filter((p): p is MeasurementPlotPoint => p != null)
      .slice(0, MAX_MEASUREMENTS);
  }, [activeMetric, baby, locale, measurements]);

  if (!baby) return <NoBabyPrompt />;

  const canAddMore = (measurements?.length ?? 0) < MAX_MEASUREMENTS;

  function resetForm() {
    setDate(getTodayLocal());
    setWeightKg("");
    setHeight("");
    setHead("");
    setNotes("");
  }

  function populateForm(m: NonNullable<typeof measurements>[number]) {
    setDate(m.date);
    setWeightKg(m.weight ? (m.weight / 1000).toFixed(2) : "");
    setHeight(m.height ? String(m.height) : "");
    setHead(m.headCircumference ? String(m.headCircumference) : "");
    setNotes(m.notes ?? "");
    setShowForm(true);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!baby) return;
    const weightGrams = weightKg ? Math.round(Number(weightKg) * 1000) : undefined;
    if (!weightGrams && !height && !head) {
      toast.error(t("atLeastOne"));
      return;
    }

    try {
      await createMeasurement.mutateAsync({
        babyId: baby._id,
        date,
        weight: weightGrams,
        height: height ? Number(height) : undefined,
        headCircumference: head ? Number(head) : undefined,
        notes: notes || undefined,
      });
      toast.success(t("saved"));
      resetForm();
      setShowForm(false);
    } catch {
      toast.error(tc("error"));
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <IdoPanel className="space-y-4 p-4 sm:p-5">
            <SectionTitle>{t("whoMeasuring")}</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              {(["male", "female"] as const).map((g) => {
                const selected = (baby.gender === "female" ? "female" : "male") === g;
                return (
                  <div
                    key={g}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3.5 font-bold",
                      selected
                        ? g === "male"
                          ? "border-sky-300 bg-sky-50 text-sky-900"
                          : "border-rose-300 bg-rose-50 text-rose-900"
                        : "border-[var(--stroke)] bg-white/50 text-muted-foreground opacity-50"
                    )}
                  >
                    <span className="text-xl">{g === "male" ? "👦" : "👧"}</span>
                    <span>{g === "male" ? t("boy") : t("girl")}</span>
                  </div>
                );
              })}
            </div>
            <Field label={t("birthDate")}>
              <p className={cn(inputClass, "text-sm font-semibold")}>
                {isoToDisplay(baby.birthDate.split("T")[0])}
              </p>
            </Field>
            <p className="text-xs text-muted-foreground">{t("fromBabyProfile")}</p>
          </IdoPanel>

          <IdoPanel className="space-y-4 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Plus className="size-4 text-[var(--coral)]" />
                <SectionTitle>{t("addMeasurement")}</SectionTitle>
              </div>
            </div>

            {!showForm ? (
              <IdoButton
                type="button"
                className="w-full"
                onClick={() => setShowForm(true)}
                disabled={!canAddMore}
              >
                <Plus className="size-4" />
                {t("enterMeasurements")}
              </IdoButton>
            ) : (
              <div ref={formRef}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Field label={t("measurementDate")}>
                    <HebrewDateInput value={date} onChange={setDate} className={inputClass} />
                  </Field>

                  <div className="grid grid-cols-3 gap-3">
                    <Field label={`${t("weight")} (${tc("kg")})`}>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="5.36"
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label={`${t("height")} (${tc("cm")})`}>
                      <Input
                        type="number"
                        min={0}
                        step="0.1"
                        placeholder="61"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label={`${t("head")} (${tc("cm")})`}>
                      <Input
                        type="number"
                        min={0}
                        step="0.1"
                        placeholder="39.7"
                        value={head}
                        onChange={(e) => setHead(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <Field label={t("notes")}>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className={cn(inputClass, "min-h-[64px] resize-none")}
                    />
                  </Field>

                  <div className="flex flex-wrap gap-2">
                    <IdoButton type="submit" disabled={createMeasurement.isPending}>
                      {createMeasurement.isPending ? tc("loading") : tc("save")}
                    </IdoButton>
                    <IdoButton
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        resetForm();
                        setShowForm(false);
                      }}
                    >
                      {tc("cancel")}
                    </IdoButton>
                  </div>
                </form>
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground">{t("maxMeasurements")}</p>
          </IdoPanel>

          <IdoPanel className="space-y-3 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-[var(--grass-deep)]" />
              <SectionTitle>{t("history")}</SectionTitle>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-white/50" />
                ))}
              </div>
            ) : !measurements?.length ? (
              <p className="text-center text-sm text-muted-foreground">{t("noMeasurements")}</p>
            ) : (
              <ul className="space-y-2">
                {measurements.slice(0, MAX_MEASUREMENTS).map((m) => {
                  const weightP = m.weight
                    ? computePercentile("weight", baby.gender, baby.birthDate, m.date, m.weight / 1000)
                    : null;
                  const heightP = m.height
                    ? computePercentile("height", baby.gender, baby.birthDate, m.date, m.height)
                    : null;
                  const headP = m.headCircumference
                    ? computePercentile("head", baby.gender, baby.birthDate, m.date, m.headCircumference)
                    : null;

                  return (
                    <li
                      key={m._id}
                      className="rounded-xl border border-[var(--stroke)] bg-white/80 px-3 py-3"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold">{formatDate(m.date, locale)}</p>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => populateForm(m)}
                            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-[var(--grass)]/10 hover:text-[var(--grass-deep)]"
                            aria-label={tc("edit")}
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMeasurement.mutate(m._id)}
                            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                            aria-label={tc("delete")}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        {m.weight != null && (
                          <div className="rounded-lg bg-sky-50 px-2 py-2">
                            <p className="text-muted-foreground">{t("weight")}</p>
                            <p className="font-bold">{(m.weight / 1000).toFixed(2)} {tc("kg")}</p>
                            {weightP != null && (
                              <p className="text-[10px] text-sky-700">{t("percentile")} {weightP.toFixed(1)}</p>
                            )}
                          </div>
                        )}
                        {m.height != null && (
                          <div className="rounded-lg bg-emerald-50 px-2 py-2">
                            <p className="text-muted-foreground">{t("height")}</p>
                            <p className="font-bold">{m.height} {tc("cm")}</p>
                            {heightP != null && (
                              <p className="text-[10px] text-emerald-700">{t("percentile")} {heightP.toFixed(1)}</p>
                            )}
                          </div>
                        )}
                        {m.headCircumference != null && (
                          <div className="rounded-lg bg-amber-50 px-2 py-2">
                            <p className="text-muted-foreground">{t("head")}</p>
                            <p className="font-bold">{m.headCircumference} {tc("cm")}</p>
                            {headP != null && (
                              <p className="text-[10px] text-amber-700">{t("percentile")} {headP.toFixed(1)}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </IdoPanel>
        </div>

        <IdoPanel className="p-4 sm:p-5">
          <Tabs value={activeMetric} onValueChange={(v) => setActiveMetric(v as GrowthMetric)}>
            <TabsList className="mx-auto mb-4 grid w-full max-w-md grid-cols-3 bg-white/70">
              <TabsTrigger value="weight">{t("weight")}</TabsTrigger>
              <TabsTrigger value="height">{t("height")}</TabsTrigger>
              <TabsTrigger value="head">{t("head")}</TabsTrigger>
            </TabsList>
            <TabsContent value={activeMetric}>
              <GrowthChart metric={activeMetric} gender={baby.gender} points={plotPoints} />
            </TabsContent>
          </Tabs>
          <p className="mt-4 text-center text-[10px] text-muted-foreground">{t("whoStandardNote")}</p>
        </IdoPanel>
      </div>

      <LegalDisclaimer />
    </div>
  );
}
