"use client";

import { Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  MILESTONE_CATEGORIES,
  type MilestoneCategory,
} from "@/constants/milestones";
import { useMilestonePlan, useUpsertMilestone } from "@/hooks/use-milestones";
import { useBabyStore } from "@/stores/baby-store";
import type { Locale } from "@/types";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { NoBabyPrompt } from "@/components/shared/no-baby-prompt";
import { MilestoneCard } from "@/components/milestones/milestone-card";
import { MilestoneCelebration } from "@/components/milestones/milestone-celebration";
import { cn } from "@/lib/utils";
import type { MilestoneStatus } from "@/utils/milestone-status";

const STATUS_LABELS: Record<MilestoneStatus, string> = {
  completed: "הושלם",
  expected_soon: "צפוי בקרוב",
  approaching: "מתקרב",
  upcoming: "בהמשך",
  available: "אפשר לסמן",
};

export function MilestonesContent() {
  const t = useTranslations("milestones");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const baby = useBabyStore((s) => s.getSelectedBaby());
  const [category, setCategory] = useState<MilestoneCategory>("development");
  const [celebration, setCelebration] = useState<string | null>(null);

  const { data: plan, isLoading } = useMilestonePlan(baby?._id ?? null, category);
  const upsert = useUpsertMilestone(baby?._id ?? null);

  const groups = useMemo(() => {
    if (!plan) return [];
    const map = new Map<string, typeof plan.schedule>();
    for (const row of plan.schedule) {
      const list = map.get(row.milestone.groupLabelHe) ?? [];
      list.push(row);
      map.set(row.milestone.groupLabelHe, list);
    }
    return [...map.entries()].map(([label, items]) => ({ label, items }));
  }, [plan]);

  if (!baby) return <NoBabyPrompt />;

  const progress = plan ? Math.round((plan.completedCount / plan.totalCount) * 100) : 0;

  function handleSave(
    milestoneId: string,
    titleHe: string,
    data: { date: string; photoUrl?: string; videoUrl?: string; notes?: string }
  ) {
    upsert.mutate(
      { babyId: baby!._id, milestoneId, ...data },
      {
        onSuccess: () => {
          setCelebration(titleHe);
          toast.success(t("saved"));
        },
        onError: () => toast.error(tc("error")),
      }
    );
  }

  return (
    <div className="space-y-4">
      {celebration && (
        <MilestoneCelebration title={celebration} onDone={() => setCelebration(null)} />
      )}

      <LegalDisclaimer variant="milestones" />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--stroke)]/70 bg-white/80 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-100">
            <Sparkles className="size-5 text-violet-700" />
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
              <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs font-bold text-violet-700">{progress}%</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {MILESTONE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition",
              category === cat.id
                ? "border-violet-300 bg-violet-100 text-violet-900"
                : "border-[var(--stroke)] bg-white text-muted-foreground hover:bg-muted/50"
            )}
          >
            {cat.emoji} {t(cat.labelKey)}
          </button>
        ))}
      </div>

      {plan?.nextExpected && category === "development" && (
        <div className="rounded-xl border border-sky-200 bg-sky-50/60 px-4 py-3">
          <p className="text-xs font-bold text-sky-800">⏳ {t("expectedSoon")}</p>
          <p className="text-sm font-bold">
            {plan.nextExpected.milestone.emoji} {plan.nextExpected.milestone.titleHe}
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
          {groups.map((group) => (
            <section key={group.label}>
              <h3 className="mb-2 px-1 text-sm font-bold text-[var(--grass-deep)]">{group.label}</h3>
              <div className="space-y-1.5 border-r-2 border-violet-200/40 pr-3">
                {group.items.map((row) => (
                  <MilestoneCard
                    key={row.milestone.id}
                    milestone={row.milestone}
                    record={row.record}
                    status={row.status}
                    birthDate={plan!.birthDate}
                    statusLabel={STATUS_LABELS[row.status]}
                    saving={upsert.isPending}
                    onSave={(data) => handleSave(row.milestone.id, row.milestone.titleHe, data)}
                    onRemove={() =>
                      upsert.mutate({
                        babyId: baby!._id,
                        milestoneId: row.milestone.id,
                        date: row.record?.date ?? new Date().toISOString().split("T")[0],
                        completed: false,
                      })
                    }
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="text-center text-[11px] text-muted-foreground">{t("disclaimer")}</p>
    </div>
  );
}
