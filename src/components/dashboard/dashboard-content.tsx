"use client";

import { Baby, Ruler, Moon, Sparkles, Syringe, Stethoscope } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { LinkButton } from "@/components/shared/link-button";
import { GlassCard } from "@/components/shared/glass-card";
import { StatCard } from "@/components/shared/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBabyStore } from "@/stores/baby-store";
import { useDashboardStats } from "@/hooks/use-babies";
import { getExactAge, minutesToHoursMinutes } from "@/utils/age";
import { formatShortDate } from "@/utils/date";
import type { DashboardStats, Locale } from "@/types";
import { DashboardFeedingSection } from "@/components/dashboard/dashboard-feeding-section";

interface DashboardContentProps {
  initialStats?: DashboardStats | null;
  selectedBabyId?: string | null;
}

export function DashboardContent({ initialStats, selectedBabyId }: DashboardContentProps) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const storeBaby = useBabyStore((s) => s.getSelectedBaby());
  const baby = storeBaby;
  const { data: stats, isLoading, isFetching } = useDashboardStats(
    baby?._id ?? selectedBabyId ?? null,
    initialStats ?? undefined
  );
  const showStatsSkeleton = isLoading && !stats;

  if (!baby) {
    return (
      <GlassCard className="mx-auto max-w-lg space-y-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <Baby className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">{t("noBaby")}</h2>
          <p className="text-muted-foreground">{tc("tagline")}</p>
        </div>
        <LinkButton href="/dashboard/baby" className="no-pulse">
          {t("addBaby")}
        </LinkButton>
      </GlassCard>
    );
  }

  const remaining = stats ? Math.max(0, stats.dailyFeedingGoal - stats.todayFeedingAmount) : 0;
  const todayLabel = formatShortDate(new Date(), locale);

  return (
    <div className="space-y-6">
      <GlassCard className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-3xl bg-muted sm:size-28">
            {baby.photoUrl ? (
              <Image
                src={baby.photoUrl}
                alt={baby.name}
                fill
                className="object-cover"
                sizes="112px"
                priority
              />
            ) : (
              <div className="flex size-full items-center justify-center text-4xl font-semibold text-muted-foreground">
                {baby.name[0]}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm text-muted-foreground">
              {t("greeting")} · {t("todayDate", { date: todayLabel })}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{baby.name}</h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              {t("exactAge")}: {getExactAge(baby.birthDate, locale)}
            </p>
          </div>
        </div>
      </GlassCard>

      <DashboardFeedingSection babyId={baby._id} />

      {showStatsSkeleton ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div
          className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${isFetching ? "opacity-80" : ""}`}
        >
          <StatCard
            label={t("lastWeight")}
            value={stats?.lastWeight ? `${stats.lastWeight} ${tc("grams")}` : "—"}
            icon={<Ruler className="size-4" />}
          />
          <StatCard
            label={t("lastHeight")}
            value={stats?.lastHeight ? `${stats.lastHeight} ${tc("cm")}` : "—"}
            icon={<Ruler className="size-4" />}
          />
          <StatCard
            label={t("headCircumference")}
            value={stats?.lastHeadCircumference ? `${stats.lastHeadCircumference} ${tc("cm")}` : "—"}
            icon={<Ruler className="size-4" />}
          />
          <StatCard
            label={t("dailyGoal")}
            value={`${stats?.dailyFeedingGoal ?? 0} ${tc("ml")}`}
            subValue={`${t("remaining")}: ${remaining} ${tc("ml")}`}
            icon={<Baby className="size-4" />}
          />
          <StatCard
            label={t("todaySleep")}
            value={minutesToHoursMinutes(stats?.todaySleepMinutes ?? 0, locale)}
            icon={<Moon className="size-4" />}
          />
          <StatCard
            label={t("lastMilestone")}
            value={stats?.lastMilestone?.type ?? "—"}
            icon={<Sparkles className="size-4" />}
          />
          <StatCard label={t("nextVaccination")} value="—" icon={<Syringe className="size-4" />} />
          <StatCard label={t("nextWellBaby")} value="—" icon={<Stethoscope className="size-4" />} />
        </div>
      )}
    </div>
  );
}
