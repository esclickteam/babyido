"use client";

import dynamic from "next/dynamic";
import { Baby, ChevronDown, LogOut, Moon, Plus, Sun } from "lucide-react";
import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { NAV_ITEMS } from "@/constants/navigation";
import { useBabyStore } from "@/stores/baby-store";
import { useBabies } from "@/hooks/use-babies";
import { getExactAge } from "@/utils/age";
import { setSelectedBabyCookie } from "@/lib/baby-selection.client";
import type { Locale } from "@/types";
import { LinkButton } from "@/components/shared/link-button";
import { BrandSymbol, BrandWordmark } from "@/components/shared/brand-logo";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ReminderAlertsInit } from "@/components/notifications/reminder-alerts-init";

const QuickAddSheet = dynamic(
  () => import("@/components/layout/quick-add-sheet").then((m) => m.QuickAddSheet),
  { ssr: false }
);

const NotificationsBell = dynamic(
  () => import("@/components/layout/notifications-bell").then((m) => m.NotificationsBell),
  { ssr: false }
);

interface AppShellUser {
  name?: string | null;
  image?: string | null;
}

function BabySwitcher() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const locale = useLocale() as Locale;
  const babies = useBabyStore((s) => s.babies);
  const selectedBabyId = useBabyStore((s) => s.selectedBabyId);
  const selectBaby = useBabyStore((s) => s.selectBaby);
  const selected = babies.find((b) => b._id === selectedBabyId) ?? babies[0];

  if (!babies.length) {
    return (
      <LinkButton href="/dashboard/baby" variant="ghost" className="!px-4 !py-2 text-sm">
        {t("addBaby")}
      </LinkButton>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "outline" }),
          "max-w-[200px] justify-between rounded-xl"
        )}
      >
        <span className="truncate">{selected?.name ?? t("selectBaby")}</span>
        <ChevronDown className="size-4 shrink-0 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 rounded-xl">
        {babies.map((baby) => (
          <DropdownMenuItem
            key={baby._id}
            onClick={() => {
              selectBaby(baby._id);
              setSelectedBabyCookie(baby._id);
            }}
          >
            <Baby className="size-4" />
            <span>{baby.name}</span>
            <span className="ms-auto text-xs text-muted-foreground">
              {getExactAge(baby.birthDate, locale)}
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard/baby")}>
          <Plus className="size-4" />
          {t("addBaby")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("settings");

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-xl"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={t("theme")}
    >
      <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}

function AppSidebar() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const ta = useTranslations("auth");

  return (
    <Sidebar
      side="right"
      variant="sidebar"
      collapsible="icon"
      className="[&_[data-sidebar=sidebar]]:border-l [&_[data-sidebar=sidebar]]:border-[var(--stroke)] [&_[data-sidebar=sidebar]]:bg-white"
    >
      <SidebarHeader className="border-b border-[var(--stroke)] p-5">
        <Link href="/dashboard" className="flex flex-col items-center justify-center gap-2 py-1">
          <BrandSymbol size="sidebar" className="group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10" />
          <BrandWordmark size="sidebar" className="group-data-[collapsible=icon]:hidden" />
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100svh-11rem)]">
              <SidebarMenu className="gap-1">
                {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <SidebarMenuItem key={key}>
                      <SidebarMenuButton
                        isActive={active}
                        size="lg"
                        render={<Link href={href} />}
                        className={cn(
                          "h-11 rounded-xl px-3 font-semibold transition-colors",
                          active
                            ? "bg-[var(--coral)] text-white hover:bg-[var(--coral)] hover:text-white"
                            : "text-[var(--ink)] hover:bg-[var(--grass)]/10"
                        )}
                      >
                        <Icon className={cn(active && "text-white")} />
                        <span>{t(key)}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-[var(--stroke)] p-4">
        <Button
          variant="ghost"
          className="h-11 w-full justify-start gap-2 rounded-xl font-semibold group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:p-0"
          onClick={() => void signOut({ callbackUrl: "/", redirect: true })}
        >
          <LogOut className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">{ta("logout")}</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AppShellUser;
}) {
  useBabies();

  return (
    <SidebarProvider defaultOpen={true}>
      <ReminderAlertsInit />
      <AppSidebar />
      <SidebarInset className="ido-sprout min-h-svh min-w-0 flex-1 overflow-x-hidden">
        <header className="relative sticky top-0 z-10 h-16 shrink-0 border-b border-[var(--stroke)] bg-white/90 backdrop-blur-md md:h-24">
          <Link
            href="/dashboard"
            className="absolute top-1/2 left-3 z-20 -translate-y-1/2 sm:left-4 md:left-6"
          >
            <BrandSymbol size="dashboard" className="h-11 w-11 sm:h-14 sm:w-14" />
          </Link>

          <Link
            href="/dashboard"
            className="absolute top-1/2 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 sm:flex"
          >
            <BrandWordmark size="dashboard" />
          </Link>

          <div className="absolute top-1/2 right-3 z-20 flex -translate-y-1/2 items-center gap-1 sm:gap-2 md:right-6">
            <SidebarTrigger className="size-11 shrink-0 rounded-xl border border-[var(--stroke)] bg-white shadow-sm md:hidden" />
            <div className="hidden md:block">
              <BabySwitcher />
            </div>
            <QuickAddSheet />
            <NotificationsBell />
            <div className="hidden sm:contents">
              <ThemeToggle />
            </div>
            {user.image ? (
              <Image
                src={user.image}
                alt=""
                width={32}
                height={32}
                className="size-8 shrink-0 rounded-full sm:size-9"
                sizes="36px"
              />
            ) : (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium sm:size-9">
                {user.name?.[0] ?? "?"}
              </div>
            )}
          </div>
        </header>
        <main className="flex min-h-[calc(100svh-5rem)] w-full flex-1 flex-col md:min-h-[calc(100svh-6rem)]">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
