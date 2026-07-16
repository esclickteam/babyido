"use client";

import { format, endOfMonth, startOfMonth } from "date-fns";
import { he } from "date-fns/locale";
import { BookOpen, Clock, Stethoscope, Syringe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useCalendarEvents } from "@/hooks/use-calendar";
import { useBabyStore } from "@/stores/baby-store";
import type { CalendarEvent, Locale } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { NoBabyPrompt } from "@/components/shared/no-baby-prompt";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { formatShortDate, parseBirthDate, toDateOnlyString } from "@/utils/date";

function EventRow({ event, locale }: { event: CalendarEvent; locale: Locale }) {
  const t = useTranslations("journal");
  const isVaccine = event.type === "vaccination";

  return (
    <Link
      href={event.href}
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3 transition hover:shadow-sm",
        event.completed
          ? "border-emerald-200 bg-emerald-50/50 opacity-75"
          : isVaccine
            ? "border-sky-200 bg-sky-50/60"
            : "border-violet-200 bg-violet-50/60"
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl text-white",
          isVaccine ? "bg-sky-500" : "bg-violet-500"
        )}
      >
        {isVaccine ? <Syringe className="size-5" /> : <Stethoscope className="size-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{event.title}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3" />
          {formatShortDate(event.date, locale)}
          {event.time ? ` · ${event.time}` : ""}
          {event.completed && (
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
              {t("completed")}
            </span>
          )}
        </p>
        {event.subtitle && (
          <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{event.subtitle}</p>
        )}
      </div>
    </Link>
  );
}

export function JournalContent() {
  const t = useTranslations("journal");
  const locale = useLocale() as Locale;
  const baby = useBabyStore((s) => s.getSelectedBaby());
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState<Date | undefined>(() => new Date());

  const range = useMemo(() => {
    const from = toDateOnlyString(startOfMonth(month));
    const to = toDateOnlyString(endOfMonth(month));
    return { from, to };
  }, [month]);

  const { data: events = [], isLoading } = useCalendarEvents(baby?._id ?? null, range.from, range.to);

  const eventDates = useMemo(
    () => events.map((e) => parseBirthDate(e.date)),
    [events]
  );

  const selectedKey = selected ? toDateOnlyString(selected) : null;
  const dayEvents = events.filter((e) => e.date === selectedKey);
  const upcoming = events.filter((e) => !e.completed).slice(0, 6);

  if (!baby) return <NoBabyPrompt />;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <LegalDisclaimer variant="general" />

      <div className="flex items-center gap-3 rounded-2xl border border-[var(--stroke)]/70 bg-white/90 px-4 py-3 shadow-sm">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-md">
          <BookOpen className="size-6 ms-icon-float" />
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--grass-deep)]">
            {t("title")}
          </h2>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--stroke)]/70 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-[var(--grass-deep)]">
            {format(month, "MMMM yyyy", { locale: he })}
          </h3>
          <div className="flex gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1 text-sky-700">
              <Syringe className="size-3" /> {t("vaccinations")}
            </span>
            <span className="flex items-center gap-1 text-violet-700">
              <Stethoscope className="size-3" /> {t("wellBaby")}
            </span>
          </div>
        </div>

        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          month={month}
          onMonthChange={setMonth}
          locale={he}
          dir="rtl"
          modifiers={{ hasEvent: eventDates }}
          modifiersClassNames={{
            hasEvent:
              "relative after:absolute after:bottom-1 after:left-1/2 after:size-1.5 after:-translate-x-1/2 after:rounded-full after:bg-emerald-500",
          }}
          className="mx-auto w-full [--cell-size:2.5rem]"
        />
      </div>

      <section className="space-y-2">
        <h3 className="px-1 text-sm font-bold text-[var(--grass-deep)]">
          {selectedKey ? t("dayEvents", { date: formatShortDate(selectedKey, locale) }) : t("selectDay")}
        </h3>
        {isLoading ? (
          <div className="h-20 animate-pulse rounded-xl bg-muted/40" />
        ) : dayEvents.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--stroke)] px-4 py-6 text-center text-sm text-muted-foreground">
            {t("noEventsDay")}
          </p>
        ) : (
          <div className="space-y-2">
            {dayEvents.map((event) => (
              <EventRow key={event.id} event={event} locale={locale} />
            ))}
          </div>
        )}
      </section>

      {upcoming.length > 0 && (
        <section className="space-y-2">
          <h3 className="px-1 text-sm font-bold text-[var(--grass-deep)]">{t("upcoming")}</h3>
          <div className="space-y-2">
            {upcoming.map((event) => (
              <EventRow key={`up-${event.id}`} event={event} locale={locale} />
            ))}
          </div>
        </section>
      )}

      <p className="text-center text-[11px] text-muted-foreground">
        {t("hint")}{" "}
        <Link href="/dashboard/well-baby" className="font-semibold text-[var(--coral)] hover:underline">
          {t("scheduleWellBaby")}
        </Link>
        {" · "}
        <Link href="/dashboard/vaccinations" className="font-semibold text-sky-700 hover:underline">
          {t("scheduleVaccines")}
        </Link>
      </p>
    </div>
  );
}
