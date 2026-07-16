"use client";

import { ExternalLink, Shield, Syringe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { toast } from "sonner";
import { MOH_VACCINE_SOURCE_URL, VACCINE_VISIT_GROUPS } from "@/constants/vaccinations";
import { useUpsertVaccination, useVaccinationPlan } from "@/hooks/use-vaccinations";
import { useBabyStore } from "@/stores/baby-store";
import type { Locale } from "@/types";
import { IdoPanel } from "@/components/idoland/ido-panel";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { NoBabyPrompt } from "@/components/shared/no-baby-prompt";
import { VaccineCard } from "@/components/vaccinations/vaccine-card";
import { formatShortDate } from "@/utils/date";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--grass-deep)]">
      {children}
    </h3>
  );
}

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
    completed: t("completed"),
    completedDate: t("completedDate"),
    notes: t("notes"),
    sideEffects: t("sideEffects"),
    reminder: t("emailReminder"),
    optional: t("optional"),
    seasonal: t("seasonal"),
    protects: t("protects"),
    where: t("where"),
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
    <div className="space-y-6">
      <LegalDisclaimer variant="vaccinations" />

      <IdoPanel className="relative overflow-hidden border-[var(--grass)]/30 bg-gradient-to-l from-[#eefaf3] via-white to-[#f0f7ff] p-6 sm:p-8">
        <div className="absolute -left-8 -top-8 size-32 rounded-full bg-[var(--grass)]/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-[var(--grass)]/15">
            <Syringe className="size-8 text-[var(--grass-deep)]" />
          </div>
          <div className="flex-1">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--grass-deep)]">
              {t("title")}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t("subtitle")}</p>
            <a
              href={MOH_VACCINE_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[var(--coral)] hover:underline"
            >
              {t("mohLink")}
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>

        {plan && (
          <div className="relative mt-5 space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span>{t("progress", { done: plan.completedCount, total: plan.totalCount })}</span>
              <span className="text-[var(--grass-deep)]">{progressPercent}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/70">
              <div
                className="h-full rounded-full bg-[var(--grass)] transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </IdoPanel>

      {nextVaccine && (
        <IdoPanel className="border-sky-300/50 bg-gradient-to-l from-sky-50 to-white p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Shield className="size-6 shrink-0 text-sky-600" />
            <div>
              <p className="text-sm font-semibold text-sky-700">{t("nextVaccine")}</p>
              <p className="mt-1 text-xl font-bold text-[var(--ink)]">
                {nextVaccine.vaccine.emoji} {nextVaccine.vaccine.nameHe} · {nextVaccine.vaccine.doseHe}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("recommendedDate")}: {formatShortDate(nextVaccine.recommendedDate, locale)}
                {nextVaccine.record?.scheduledDate && (
                  <>
                    {" · "}
                    {t("scheduledDate")}: {formatShortDate(nextVaccine.record.scheduledDate, locale)}
                  </>
                )}
              </p>
            </div>
          </div>
        </IdoPanel>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/50" />
          ))}
        </div>
      ) : (
        VACCINE_VISIT_GROUPS.map((group) => (
          <IdoPanel key={group.label} className="space-y-4 p-5 sm:p-6">
            <SectionTitle>
              {group.label}
              <span className="mr-2 text-sm font-normal text-muted-foreground">
                ({group.vaccines.length} {t("vaccinesCount")})
              </span>
            </SectionTitle>
            <div className="grid gap-3">
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
          </IdoPanel>
        ))
      )}

      <p className="text-center text-xs text-muted-foreground">{t("disclaimer")}</p>
    </div>
  );
}
