"use client";

import { useState } from "react";
import { ArrowRight, Bell, Check, Clock, Settings, Syringe, Utensils } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useMarkNotificationsRead, useNotifications } from "@/hooks/use-notifications";
import type { AppNotification, Locale } from "@/types";
import { PushNotificationsToggle } from "@/components/settings/push-notifications-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/utils/date";

const TYPE_ICON: Partial<Record<AppNotification["type"], React.ReactNode>> = {
  vaccination: <Syringe className="size-4 text-emerald-600" />,
  feeding: <Utensils className="size-4 text-orange-500" />,
  tasting: <Utensils className="size-4 text-amber-500" />,
  appointment: <Clock className="size-4 text-sky-600" />,
  reminder: <Bell className="size-4 text-violet-600" />,
  custom: <Bell className="size-4 text-violet-600" />,
};

function safeDateKey(iso: string): string {
  if (!iso) return "";
  return iso.includes("T") ? iso.split("T")[0]! : iso.slice(0, 10);
}

function NotificationRow({
  item,
  locale,
  onRead,
}: {
  item: AppNotification;
  locale: Locale;
  onRead: (id: string) => void;
}) {
  const when = formatShortDate(safeDateKey(item.scheduledAt), locale);
  const timeSuffix = item.scheduledTime ? ` · ${item.scheduledTime}` : "";

  return (
    <button
      type="button"
      className="w-full text-right"
      onClick={() => onRead(item._id)}
    >
      <div
        className={cn(
          "flex gap-3 rounded-xl px-3 py-2.5 transition hover:bg-muted/60",
          !item.read && "bg-sky-50/70"
        )}
      >
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          {TYPE_ICON[item.type] ?? <Bell className="size-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[var(--ink)]">{item.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{item.body}</p>
          <p className="mt-1 text-[11px] font-semibold text-sky-700">
            {when}
            {timeSuffix}
          </p>
        </div>
        {!item.read && <span className="mt-2 size-2 shrink-0 rounded-full bg-sky-500" />}
      </div>
    </button>
  );
}

export function NotificationsBell() {
  const t = useTranslations("notifications");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { data, isError, isLoading } = useNotifications();
  const markRead = useMarkNotificationsRead();
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const unread = data?.unreadCount ?? 0;
  const items = data?.items ?? [];

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setShowSettings(false);
  }

  function handleRead(id: string) {
    markRead.mutate({ ids: [id] });
  }

  function handleViewAll() {
    setOpen(false);
    router.push("/dashboard/reminders");
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="relative size-11 rounded-xl border-sky-200 bg-sky-50 text-sky-800 shadow-sm hover:bg-sky-100"
        aria-label={t("title")}
        onClick={() => setOpen(true)}
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -left-1 flex min-w-5 items-center justify-center rounded-full bg-[var(--coral)] px-1.5 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="flex max-h-[min(85svh,640px)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-md"
          showCloseButton
        >
          <DialogHeader className="shrink-0 border-b px-4 py-3 text-right">
            {showSettings ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg"
                  aria-label={t("backToList")}
                  onClick={() => setShowSettings(false)}
                >
                  <ArrowRight className="size-4" />
                </Button>
                <div className="min-w-0 flex-1 text-right">
                  <DialogTitle className="text-base font-bold">{t("pushSettings")}</DialogTitle>
                  <DialogDescription className="text-xs">{t("pushSettingsHint")}</DialogDescription>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-lg text-muted-foreground hover:text-foreground"
                    aria-label={t("pushSettings")}
                    onClick={() => setShowSettings(true)}
                  >
                    <Settings className="size-4" />
                  </Button>
                  {unread > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-lg px-2 text-xs font-semibold text-[var(--grass-deep)]"
                      onClick={() => markRead.mutate({ markAll: true })}
                    >
                      {t("markAllRead")}
                    </Button>
                  )}
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <DialogTitle className="text-base font-bold">{t("title")}</DialogTitle>
                  {unread > 0 && (
                    <DialogDescription className="text-xs">
                      {t("unreadCount", { count: unread })}
                    </DialogDescription>
                  )}
                </div>
              </div>
            )}
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
            {showSettings ? (
              <div className="px-2 py-3">
                <PushNotificationsToggle />
              </div>
            ) : isLoading ? (
              <div className="space-y-2 px-2 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/40" />
                ))}
              </div>
            ) : isError ? (
              <p className="px-4 py-10 text-center text-sm text-destructive">{t("loadError")}</p>
            ) : items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto size-8 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">{t("empty")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("emptyHint")}</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {items.map((item) => (
                  <NotificationRow
                    key={item._id}
                    item={item}
                    locale={locale}
                    onRead={handleRead}
                  />
                ))}
              </div>
            )}
          </div>

          {!showSettings && (
            <div className="shrink-0 border-t p-3">
              <button
                type="button"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-11 w-full justify-center gap-2 rounded-xl font-semibold text-[var(--grass-deep)]"
                )}
                onClick={handleViewAll}
              >
                <Check className="size-4" />
                {t("viewAll")}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
