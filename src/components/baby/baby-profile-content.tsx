"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useBabyStore } from "@/stores/baby-store";
import { BabyForm } from "@/components/baby/baby-form";
import { cn } from "@/lib/utils";

export function BabyProfileContent() {
  const t = useTranslations("baby");
  const babies = useBabyStore((s) => s.babies);
  const selectedBabyId = useBabyStore((s) => s.selectedBabyId);
  const selectBaby = useBabyStore((s) => s.selectBaby);
  const [addingNew, setAddingNew] = useState(babies.length === 0);

  const selectedBaby = babies.find((b) => b._id === selectedBabyId) ?? babies[0];
  const showNewForm = addingNew || !selectedBaby;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {babies.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {babies.map((baby) => (
            <button
              key={baby._id}
              type="button"
              onClick={() => {
                selectBaby(baby._id);
                setAddingNew(false);
              }}
              className={cn(
                "rounded-full border-2 px-4 py-2 text-sm font-bold transition-all",
                !addingNew && selectedBaby?._id === baby._id
                  ? "border-[var(--grass)] bg-[var(--grass)]/10 text-[var(--grass-deep)]"
                  : "border-[var(--stroke)] bg-white/70 text-[var(--muted-ink)] hover:bg-white"
              )}
            >
              {baby.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAddingNew(true)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border-2 px-4 py-2 text-sm font-bold transition-all",
              addingNew
                ? "border-[var(--coral)] bg-[var(--coral)]/10 text-[var(--coral)]"
                : "border-dashed border-[var(--stroke)] text-[var(--muted-ink)] hover:border-[var(--coral)]"
            )}
          >
            <Plus className="size-4" />
            {t("addAnother")}
          </button>
        </div>
      )}

      {showNewForm ? (
        <BabyForm key="new" />
      ) : (
        <BabyForm key={selectedBaby._id} baby={selectedBaby} />
      )}

      {babies.length > 0 && (
        <p className="text-center text-sm text-[var(--muted-ink)]">
          <Link href="/dashboard" className="font-bold text-[var(--grass-deep)] underline">
            {t("backToDashboard")}
          </Link>
        </p>
      )}
    </div>
  );
}
