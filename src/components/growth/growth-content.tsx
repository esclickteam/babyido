"use client";

import { Plus, Ruler, Trash2, TrendingUp } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  useCreateGrowthMeasurement,
  useDeleteGrowthMeasurement,
  useGrowthMeasurements,
} from "@/hooks/use-growth";
import { useBabyStore } from "@/stores/baby-store";
import { formatDate, getTodayLocal } from "@/utils/date";
import type { Locale } from "@/types";
import { IdoButton } from "@/components/idoland/ido-button";
import { IdoPanel } from "@/components/idoland/ido-panel";
import { HebrewDateInput } from "@/components/shared/hebrew-date-input";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { NoBabyPrompt } from "@/components/shared/no-baby-prompt";
import { StatCard } from "@/components/shared/stat-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const inputClass =
  "rounded-xl border-[var(--stroke)] bg-white/90 py-2.5 shadow-sm focus-visible:ring-[var(--grass)]";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-[var(--grass-deep)]">
      {children}
    </h3>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
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

  const [date, setDate] = useState(getTodayLocal());
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [head, setHead] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [searchParams]);

  if (!baby) return <NoBabyPrompt />;

  const latest = measurements?.[0];
  const prev = measurements?.[1];
  const weightDelta =
    latest?.weight && prev?.weight ? latest.weight - prev.weight : undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!baby) return;
    const weightNum = weight ? Number(weight) : undefined;
    if (!weightNum && !height && !head) {
      toast.error(t("atLeastOne"));
      return;
    }

    try {
      await createMeasurement.mutateAsync({
        babyId: baby._id,
        date: date,
        weight: weightNum,
        height: height ? Number(height) : undefined,
        headCircumference: head ? Number(head) : undefined,
        notes: notes || undefined,
      });
      toast.success(t("saved"));
      setWeight("");
      setHeight("");
      setHead("");
      setNotes("");
    } catch {
      toast.error(tc("error"));
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <IdoPanel className="space-y-4 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-[var(--grass-deep)]" />
          <SectionTitle>{t("latest")}</SectionTitle>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-white/50" />
            ))}
          </div>
        ) : latest ? (
          <>
            <p className="text-xs text-muted-foreground">
              {t("measuredOn")} {formatDate(latest.date, locale)}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <StatCard
                className="p-3"
                label={t("weight")}
                value={latest.weight ? `${latest.weight}` : "—"}
                subValue={latest.weight ? tc("grams") : undefined}
              />
              <StatCard
                className="p-3"
                label={t("height")}
                value={latest.height ? `${latest.height}` : "—"}
                subValue={latest.height ? tc("cm") : undefined}
              />
              <StatCard
                className="p-3"
                label={t("head")}
                value={latest.headCircumference ? `${latest.headCircumference}` : "—"}
                subValue={latest.headCircumference ? tc("cm") : undefined}
              />
            </div>
            {weightDelta !== undefined && (
              <p className="text-center text-xs text-muted-foreground">
                {weightDelta > 0 ? "+" : ""}
                {weightDelta} {tc("grams")} {t("sinceLast")}
              </p>
            )}
          </>
        ) : (
          <p className="rounded-xl border border-dashed border-[var(--stroke)] bg-white/50 px-4 py-5 text-center text-sm text-muted-foreground">
            {t("noMeasurements")}
          </p>
        )}
      </IdoPanel>

      <div ref={formRef}>
        <IdoPanel className="space-y-4 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Plus className="size-4 text-[var(--coral)]" />
            <SectionTitle>{t("addMeasurement")}</SectionTitle>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label={tc("date")}>
              <HebrewDateInput value={date} onChange={setDate} className={inputClass} />
            </Field>

            <div className="grid grid-cols-3 gap-3">
              <Field label={`${t("weight")} (${tc("grams")})`}>
                <Input
                  type="number"
                  min={0}
                  placeholder="6500"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label={`${t("height")} (${tc("cm")})`}>
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  placeholder="65"
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
                  placeholder="42"
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

            <IdoButton type="submit" disabled={createMeasurement.isPending} className="w-full sm:w-auto sm:min-w-[140px]">
              {createMeasurement.isPending ? tc("loading") : tc("save")}
            </IdoButton>
          </form>
        </IdoPanel>
      </div>

      <IdoPanel className="space-y-3 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Ruler className="size-4 text-[var(--grass-deep)]" />
          <SectionTitle>{t("history")}</SectionTitle>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-white/50" />
            ))}
          </div>
        ) : !measurements?.length ? (
          <p className="text-center text-sm text-muted-foreground">{tc("noData")}</p>
        ) : (
          <ul className="space-y-2">
            {measurements.map((m) => (
              <li
                key={m._id}
                className="flex items-center gap-2 rounded-xl border border-[var(--stroke)] bg-white/80 px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{formatDate(m.date, locale)}</p>
                  <p className="text-xs text-muted-foreground">
                    {[
                      m.weight && `${m.weight} ${tc("grams")}`,
                      m.height && `${m.height} ${tc("cm")}`,
                      m.headCircumference && `${m.headCircumference} ${tc("cm")} ראש`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteMeasurement.mutate(m._id)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  aria-label={tc("delete")}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </IdoPanel>

      <LegalDisclaimer />
    </div>
  );
}
