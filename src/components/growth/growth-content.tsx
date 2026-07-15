"use client";

import { format } from "date-fns";
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
import { formatDate } from "@/utils/date";
import type { Locale } from "@/types";
import { IdoButton } from "@/components/idoland/ido-button";
import { IdoPanel } from "@/components/idoland/ido-panel";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { NoBabyPrompt } from "@/components/shared/no-baby-prompt";
import { StatCard } from "@/components/shared/stat-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
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
        date: new Date(date).toISOString(),
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
    <div className="space-y-6">
      <IdoPanel className="space-y-5 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-5 text-[var(--grass-deep)]" />
          <SectionTitle>{t("latest")}</SectionTitle>
        </div>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/50" />
            ))}
          </div>
        ) : latest ? (
          <>
            <p className="text-sm text-muted-foreground">
              {t("measuredOn")} {formatDate(latest.date, locale)}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard
                label={t("weight")}
                value={latest.weight ? `${latest.weight} ${tc("grams")}` : "—"}
                subValue={
                  weightDelta !== undefined
                    ? `${weightDelta > 0 ? "+" : ""}${weightDelta} ${tc("grams")}`
                    : undefined
                }
              />
              <StatCard
                label={t("height")}
                value={latest.height ? `${latest.height} ${tc("cm")}` : "—"}
              />
              <StatCard
                label={t("head")}
                value={
                  latest.headCircumference
                    ? `${latest.headCircumference} ${tc("cm")}`
                    : "—"
                }
              />
            </div>
          </>
        ) : (
          <p className="rounded-2xl border border-dashed border-[var(--stroke)] bg-white/50 p-6 text-center text-muted-foreground">
            {t("noMeasurements")}
          </p>
        )}
      </IdoPanel>

      <div ref={formRef}>
        <IdoPanel className="space-y-5 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Plus className="size-5 text-[var(--coral)]" />
            <SectionTitle>{t("addMeasurement")}</SectionTitle>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>{tc("date")}</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("weight")} ({tc("grams")})</Label>
              <Input
                type="number"
                min={0}
                placeholder="6500"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("height")} ({tc("cm")})</Label>
              <Input
                type="number"
                min={0}
                step="0.1"
                placeholder="65"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("head")} ({tc("cm")})</Label>
              <Input
                type="number"
                min={0}
                step="0.1"
                placeholder="42"
                value={head}
                onChange={(e) => setHead(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("notes")}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={cn(inputClass, "min-h-[80px]")}
              />
            </div>
            <div className="sm:col-span-2">
              <IdoButton type="submit" wide disabled={createMeasurement.isPending}>
                {createMeasurement.isPending ? tc("loading") : tc("save")}
              </IdoButton>
            </div>
          </form>
        </IdoPanel>
      </div>

      <IdoPanel className="space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Ruler className="size-5 text-[var(--grass-deep)]" />
          <SectionTitle>{t("history")}</SectionTitle>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/50" />
            ))}
          </div>
        ) : !measurements?.length ? (
          <p className="text-center text-muted-foreground">{tc("noData")}</p>
        ) : (
          <ul className="space-y-3">
            {measurements.map((m) => (
              <li
                key={m._id}
                className="flex items-center gap-3 rounded-2xl border border-[var(--stroke)] bg-white/80 p-4 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{formatDate(m.date, locale)}</p>
                  <p className="text-sm text-muted-foreground">
                    {[
                      m.weight && `${m.weight} ${tc("grams")}`,
                      m.height && `${m.height} ${tc("cm")}`,
                      m.headCircumference && `${t("head")} ${m.headCircumference} ${tc("cm")}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteMeasurement.mutate(m._id)}
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

      <LegalDisclaimer />
    </div>
  );
}
