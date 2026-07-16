"use client";

import { endOfMonth, startOfMonth } from "date-fns";
import { Baby, BookOpen, Stethoscope, Syringe } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { LinkButton } from "@/components/shared/link-button";
import { GlassCard } from "@/components/shared/glass-card";
import { useBabyStore } from "@/stores/baby-store";
import { useCalendarEvents } from "@/hooks/use-calendar";
import { getExactAge } from "@/utils/age";
import { formatShortDate, toDateOnlyString } from "@/utils/date";
import type { Locale } from "@/types";
import { Link } from "@/i18n/navigation";

export function DashboardContent() {
  const t = useTranslations("dashboard");
  const tj = useTranslations("journal");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const baby = useBabyStore((s) => s.getSelectedBaby());

  const today = new Date();
  const from = toDateOnlyString(startOfMonth(today));
  const to = toDateOnlyString(endOfMonth(today));
  const { data: events = [] } = useCalendarEvents(baby?._id ?? null, from, to);
  const upcoming = events.filter((e) => !e.completed).slice(0, 3);

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

  const todayLabel = formatShortDate(today, locale);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
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

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/dashboard/journal"
          className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-l from-emerald-50 to-white p-4 shadow-sm transition hover:shadow-md"
        >
          <BookOpen className="size-8 text-emerald-600" />
          <div>
            <p className="font-bold text-[var(--grass-deep)]">{tj("title")}</p>
            <p className="text-xs text-muted-foreground">{tj("subtitle")}</p>
          </div>
        </Link>
        <Link
          href="/dashboard/well-baby"
          className="flex items-center gap-3 rounded-2xl border border-violet-200 bg-gradient-to-l from-violet-50 to-white p-4 shadow-sm transition hover:shadow-md"
        >
          <Stethoscope className="size-8 text-violet-600" />
          <div>
            <p className="font-bold text-[var(--grass-deep)]">{t("wellBabyCard")}</p>
            <p className="text-xs text-muted-foreground">{t("wellBabyCardHint")}</p>
          </div>
        </Link>
      </div>

      {upcoming.length > 0 && (
        <GlassCard className="space-y-3 p-4">
          <h2 className="font-[family-name:var(--font-display)] text-base font-bold text-[var(--grass-deep)]">
            {tj("upcoming")}
          </h2>
          <ul className="space-y-2">
            {upcoming.map((event) => (
              <li
                key={event.id}
                className="flex items-center gap-2 rounded-xl border border-[var(--stroke)]/60 bg-white/80 px-3 py-2 text-sm"
              >
                {event.type === "vaccination" ? (
                  <Syringe className="size-4 shrink-0 text-sky-600" />
                ) : (
                  <Stethoscope className="size-4 shrink-0 text-violet-600" />
                )}
                <span className="min-w-0 flex-1 truncate font-semibold">{event.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatShortDate(event.date, locale)}
                </span>
              </li>
            ))}
          </ul>
          <Link href="/dashboard/journal" className="text-sm font-semibold text-[var(--coral)] hover:underline">
            {tj("openCalendar")}
          </Link>
        </GlassCard>
      )}
    </div>
  );
}
