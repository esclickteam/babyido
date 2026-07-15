"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { QUICK_ACTIONS } from "@/constants/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function QuickAddSheet() {
  const t = useTranslations("common");
  const tn = useTranslations("nav");

  return (
    <Sheet>
      <SheetTrigger
        className={cn(buttonVariants({ size: "sm" }), "rounded-xl")}
      >
        <Plus className="size-4" />
        {t("quickAdd")}
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>{t("quickAdd")}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 grid grid-cols-2 gap-3 pb-6">
          {QUICK_ACTIONS.map(({ key, href, icon: Icon }) => (
            <Link
              key={key}
              href={href}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-auto flex-col gap-2 rounded-2xl py-4"
              )}
            >
              <Icon className="size-5" />
              <span className="text-sm">{tn(key)}</span>
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
