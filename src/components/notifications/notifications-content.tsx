"use client";

import { Bell, Check, Syringe, Utensils, Clock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useMarkNotificationsRead, useNotifications } from "@/hooks/use-notifications";
import type { AppNotification, Locale } from "@/types";
import { IdoPanel } from "@/components/idoland/ido-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/utils/date";

const TYPE_META: Record<
  AppNotification["type"],
  { icon: React.ReactNode; color: string }
> = {
  vaccination: { icon: <Syringe className="size-5" />, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  feeding: { icon: <Utensils className="size-5" />, color: "bg-orange-50 text-orange-700 border-orange-200" },
  tasting: { icon: <Utensils className="size-5" />, color: "bg-amber-50 text-amber-700 border-amber-200" },
  appointment: { icon: <Clock className="size-5" />, color: "bg-sky-50 text-sky-700 border-sky-200" },
  reminder: { icon: <Bell className="size-5" />, color: "bg-violet-50 text-violet-700 border-violet-200" },
  custom: { icon: <Bell className="size-5" />, color: "bg-slate-50 text-slate-700 border-slate-200" },
  vitaminD: { icon: <Bell className="size-5" />, color: "bg-slate-50 text-slate-700 border-slate-200" },
  iron: { icon: <Bell className="size-5" />, color: "bg-slate-50 text-slate-700 border-slate-200" },
  measurement: { icon: <Clock className="size-5" />, color: "bg-slate-50 text-slate-700 border-slate-200" },
  doctor: { icon: <Clock className="size-5" />, color: "bg-slate-50 text-slate-700 border-slate-200" },
  medication: { icon: <Clock className="size-5" />, color: "bg-rose-50 text-rose-700 border-rose-200" },
  sleep: { icon: <Clock className="size-5" />, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
};

const DEFAULT_META = { icon: <Bell className="size-5" />, color: "bg-slate-50 text-slate-700 border-slate-200" };

export function NotificationsContent() {
  const t = useTranslations("notifications");
  const locale = useLocale() as Locale;
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationsRead();

  const items = data?.items ?? [];
  const unread = data?.unreadCount ?? 0;

  return (
    <div className="space-y-5">
      <IdoPanel className="flex flex-wrap items-center justify-between gap-3 border-[var(--grass)]/25 bg-gradient-to-l from-[#eefaf3] to-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--grass)]/15">
            <Bell className="size-6 text-[var(--grass-deep)]" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--grass-deep)]">
              {t("title")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>
        {unread > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => markRead.mutate({ markAll: true })}
          >
            <Check className="size-4" />
            {t("markAllRead")}
          </Button>
        )}
      </IdoPanel>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/60" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <IdoPanel className="py-16 text-center">
          <Bell className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-3 font-semibold text-muted-foreground">{t("empty")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("emptyHint")}</p>
        </IdoPanel>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const meta = TYPE_META[item.type] ?? DEFAULT_META;
            const when = formatShortDate(item.scheduledAt.split("T")[0], locale);
            const card = (
              <div
                className={cn(
                  "flex items-start gap-3 rounded-2xl border bg-white/90 p-4 transition hover:shadow-sm",
                  !item.read ? "border-sky-200 bg-sky-50/40" : "border-[var(--stroke)]"
                )}
              >
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl border",
                    meta.color
                  )}
                >
                  {meta.icon}
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-[var(--ink)]">{item.title}</p>
                    {!item.read && (
                      <span className="size-2 shrink-0 rounded-full bg-sky-500" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                  <p className="mt-2 text-xs font-semibold text-sky-700">
                    {when}
                    {item.scheduledTime ? ` · ${item.scheduledTime}` : ""}
                    {item.emailSentAt && (
                      <span className="mr-2 text-muted-foreground"> · {t("emailSent")}</span>
                    )}
                  </p>
                </div>
              </div>
            );

            if (item.href) {
              return (
                <Link
                  key={item._id}
                  href={item.href}
                  onClick={() => markRead.mutate({ ids: [item._id] })}
                >
                  {card}
                </Link>
              );
            }

            return (
              <button
                key={item._id}
                type="button"
                className="w-full text-right"
                onClick={() => markRead.mutate({ ids: [item._id] })}
              >
                {card}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
