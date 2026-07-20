"use client";

import { Bell, Check, Clock, Syringe, Utensils } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useMarkNotificationsRead, useNotifications } from "@/hooks/use-notifications";
import type { AppNotification, Locale } from "@/types";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const { data, isError } = useNotifications();
  const markRead = useMarkNotificationsRead();

  const unread = data?.unreadCount ?? 0;
  const items = data?.items ?? [];

  function handleRead(id: string) {
    markRead.mutate({ ids: [id] });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "relative size-11 rounded-xl border-sky-200 bg-sky-50 text-sky-800 shadow-sm hover:bg-sky-100"
        )}
        aria-label={t("title")}
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -left-1 flex min-w-5 items-center justify-center rounded-full bg-[var(--coral)] px-1.5 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-2xl p-0">
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
          <span>{t("title")}</span>
          {unread > 0 && (
            <button
              type="button"
              className="text-xs font-semibold text-[var(--grass-deep)] hover:underline"
              onClick={() => markRead.mutate({ markAll: true })}
            >
              {t("markAllRead")}
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isError ? (
          <p className="px-4 py-8 text-center text-sm text-destructive">{t("loadError")}</p>
        ) : items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <ScrollArea className="max-h-80">
            <div className="space-y-0.5 p-1">
              {items.slice(0, 8).map((item) => (
                <NotificationRow
                  key={item._id}
                  item={item}
                  locale={locale}
                  onRead={handleRead}
                />
              ))}
            </div>
          </ScrollArea>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-center py-3 font-semibold text-[var(--grass-deep)]"
          onClick={() => router.push("/dashboard/reminders")}
        >
          <Check className="size-4" />
          {t("viewAll")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
