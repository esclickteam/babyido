"use client";

import { Syringe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { toast } from "sonner";
import { VACCINE_VISIT_GROUPS } from "@/constants/vaccinations";
import { useUpsertVaccination, useVaccinationPlan } from "@/hooks/use-vaccinations";
import { useBabyStore } from "@/stores/baby-store";
import type { Locale } from "@/types";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { NoBabyPrompt } from "@/components/shared/no-baby-prompt";
import { VaccineCard } from "@/components/vaccinations/vaccine-card";
import { formatShortDate } from "@/utils/date";
import { cn } from "@/lib/utils";

export function VaccinationsContent() {
  const t = useTranslations("vaccinations");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const baby = useBabyStore((s) => s.getSelectedBaby());

  const { data: plan, isLoading } = useVaccinationPlan(baby?._id ?? null);
  const upsert = useUpsertVaccination(baby?._id ?? null);

  const scheduleMap = useMemo(() => {
    if (!plan) return new Map();
    return new Map(plan.schedule.map((row) => [row.vaccine.id, row]));
  }, [plan]);

  const nextVaccine = useMemo(() => {
    if (!plan) return null;
    return (
      plan.schedule.find((row) => !row.record?.completed && !row.vaccine.optional) ?? null
    );
  }, [plan]);

  if (!baby) return <NoBabyPrompt />;

  const progressPercent = plan
    ? Math.round((plan.completedCount / plan.totalCount) * 100)
    : 0;

  const cardLabels = {
    recommended: t("recommendedDate"),
    scheduled: t("scheduledDate"),
    scheduledTime: t("scheduledTime"),
    completed: t("completed"),
    completedDate: t("completedDate"),
    notes: t("notes"),
    sideEffects: t("sideEffects"),
    reminder: t("emailReminder"),
    optional: t("optional"),
    seasonal: t("seasonal"),
    protects: t("protects"),
    where: t("where"),
    appointment: t("appointment"),
  };

  function handleUpdate(vaccineId: string, patch: Record<string, unknown>) {
    upsert.mutate(
      { babyId: baby!._id, vaccineId, ...patch },
      {
        onError: () => toast.error(tc("error")),
        onSuccess: () => {
          if (patch.completed) toast.success(t("markedDone"));
        },
      }
    );
  }

  return (
    <div className="space-y-4">
      <LegalDisclaimer variant="vaccinations" />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--stroke)]/70 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--grass)]/12">
            <Syringe className="size-5 text-[var(--grass-deep)]" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--grass-deep)]">
              {t("title")}
            </h2>
            {plan && (
              <p className="text-xs text-muted-foreground">
                {t("progress", { done: plan.completedCount, total: plan.totalCount })}
              </p>
            )}
          </div>
        </div>
        {plan && (
          <div className="flex min-w-[8rem] items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[var(--grass)] transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[var(--grass-deep)]">{progressPercent}%</span>
          </div>
        )}
      </div>

      {nextVaccine && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-sky-200/70 bg-gradient-to-l from-sky-50/80 to-white px-4 py-3">
          <span className="text-xl">{nextVaccine.vaccine.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-sky-700">{t("nextVaccine")}</p>
            <p className="text-sm font-bold text-[var(--ink)]">
              {nextVaccine.vaccine.nameHe} · {nextVaccine.vaccine.doseHe}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {nextVaccine.record?.scheduledDate
              ? `${formatShortDate(nextVaccine.record.scheduledDate, locale)}${nextVaccine.record.scheduledTime ? ` · ${nextVaccine.record.scheduledTime}` : ""}`
              : formatShortDate(nextVaccine.recommendedDate, locale)}
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-white/50" />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {VACCINE_VISIT_GROUPS.map((group, groupIndex) => (
            <section key={group.label}>
              <div className="mb-2 flex items-center gap-2 px-1">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-[10px] font-bold",
                    groupIndex === 0
                      ? "bg-[var(--grass)]/20 text-[var(--grass-deep)]"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {groupIndex + 1}
                </span>
                <h3 className="text-sm font-bold text-[var(--grass-deep)]">{group.label}</h3>
                <span className="text-[11px] text-muted-foreground">
                  {group.vaccines.length} {t("vaccinesCount")}
                </span>
              </div>
              <div className="space-y-1.5 border-r-2 border-[var(--grass)]/15 pr-3">
                {group.vaccines.map((vaccine) => {
                  const row = scheduleMap.get(vaccine.id);
                  if (!row) return null;
                  return (
                    <VaccineCard
                      key={vaccine.id}
                      vaccine={vaccine}
                      recommendedDate={row.recommendedDate}
                      record={row.record}
                      locale={locale}
                      saving={upsert.isPending}
                      labels={cardLabels}
                      onUpdate={(patch) => handleUpdate(vaccine.id, patch)}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="text-center text-[11px] text-muted-foreground">{t("disclaimer")}</p>
    </div>
  );
}
