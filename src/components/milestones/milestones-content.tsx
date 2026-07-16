"use client";

import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  MILESTONE_CATEGORIES,
  type MilestoneCategory,
} from "@/constants/milestones";
import { useMilestonePlan, useUpsertMilestone } from "@/hooks/use-milestones";
import { useBabyStore } from "@/stores/baby-store";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { NoBabyPrompt } from "@/components/shared/no-baby-prompt";
import { MilestoneCard } from "@/components/milestones/milestone-card";
import { MilestoneCelebration } from "@/components/milestones/milestone-celebration";
import {
  CategoryTabIcon,
  MilestoneHeroIcon,
  MilestoneIconBadge,
} from "@/components/milestones/milestone-icons";
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
    <div className="mx-auto w-full max-w-2xl space-y-4">
      {celebration && (
        <MilestoneCelebration title={celebration} onDone={() => setCelebration(null)} />
      )}

      <LegalDisclaimer variant="milestones" />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--stroke)]/70 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <MilestoneHeroIcon category={category} />
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
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-violet-100">
              <div
                className="h-full rounded-full bg-gradient-to-l from-violet-500 to-violet-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-bold text-violet-700">{progress}%</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {MILESTONE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition-all duration-200",
              category === cat.id
                ? "border-violet-300 bg-gradient-to-l from-violet-100 to-white text-violet-900 shadow-sm"
                : "border-[var(--stroke)] bg-white text-muted-foreground hover:border-violet-200 hover:bg-violet-50/50"
            )}
          >
            <CategoryTabIcon category={cat.id} active={category === cat.id} />
            {t(cat.labelKey)}
          </button>
        ))}
      </div>

      {plan?.nextExpected && category === "development" && (
        <div className="overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-l from-sky-50 via-white to-violet-50/40 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <MilestoneIconBadge
              id={plan.nextExpected.milestone.id}
              category={plan.nextExpected.milestone.category}
              status="expected_soon"
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs font-bold text-sky-800">
                <Clock className="size-3.5 ms-icon-wiggle" />
                {t("expectedSoon")}
              </p>
              <p className="mt-1 text-base font-bold text-[var(--ink)]">
                {plan.nextExpected.milestone.titleHe}
              </p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/60" />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((group, groupIndex) => (
            <section key={group.label}>
              <div className="mb-2 flex items-center gap-2 px-1">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-[11px] font-bold",
                    groupIndex === 0
                      ? "bg-violet-100 text-violet-800"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {groupIndex + 1}
                </span>
                <h3 className="text-sm font-bold text-[var(--grass-deep)]">{group.label}</h3>
                <span className="text-[11px] text-muted-foreground">
                  {group.items.length} {t("itemsCount")}
                </span>
              </div>
              <div className="space-y-2 border-r-2 border-violet-200/50 pr-3">
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
