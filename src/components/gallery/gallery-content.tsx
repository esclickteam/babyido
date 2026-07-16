"use client";

import { Camera, Trash2 } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { NoBabyPrompt } from "@/components/shared/no-baby-prompt";
import { useDeleteGalleryPhoto, useGalleryPhotos, useUpsertGalleryPhoto } from "@/hooks/use-gallery";
import { useBabyStore } from "@/stores/baby-store";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";
import { compressImageToDataUrl } from "@/utils/image";
import { formatGalleryMonthLabel, GALLERY_MONTHS } from "@/utils/gallery";

export function GalleryContent() {
  const t = useTranslations("gallery");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const baby = useBabyStore((s) => s.getSelectedBaby());
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeMonth, setActiveMonth] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: photos = [], isLoading } = useGalleryPhotos(baby?._id ?? null);
  const upsert = useUpsertGalleryPhoto(baby?._id ?? null);
  const remove = useDeleteGalleryPhoto(baby?._id ?? null);

  const photoByMonth = useMemo(
    () => new Map(photos.map((p) => [p.ageMonths, p])),
    [photos]
  );

  if (!baby) return <NoBabyPrompt />;

  async function handleFile(file: File, ageMonths: number) {
    if (!baby) return;
    setUploading(true);
    try {
      const photoUrl = await compressImageToDataUrl(file, 900, 0.85);
      await upsert.mutateAsync({ babyId: baby._id, ageMonths, photoUrl });
      toast.success(t("saved"));
    } catch {
      toast.error(tc("error"));
    } finally {
      setUploading(false);
      setActiveMonth(null);
    }
  }

  function openUpload(month: number) {
    setActiveMonth(month);
    inputRef.current?.click();
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && activeMonth) void handleFile(file, activeMonth);
          e.target.value = "";
        }}
      />

      <div className="flex items-center gap-3 rounded-2xl border border-[var(--stroke)]/70 bg-white/90 px-4 py-3 shadow-sm">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-orange-500 text-white shadow-md">
          <Camera className="size-6 ms-icon-float" />
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--grass-deep)]">
            {t("title")}
          </h2>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {GALLERY_MONTHS.map((m) => (
            <div key={m} className="aspect-[3/4] animate-pulse rounded-2xl bg-muted/40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {GALLERY_MONTHS.map((month) => {
            const photo = photoByMonth.get(month);
            const label = formatGalleryMonthLabel(month, locale);
            const isBusy = uploading && activeMonth === month;

            return (
              <div
                key={month}
                className="group relative overflow-hidden rounded-2xl border border-rose-200/80 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => openUpload(month)}
                  disabled={isBusy}
                  className="block w-full text-start"
                >
                  <div className="relative aspect-[3/4] w-full bg-gradient-to-b from-rose-50 to-white">
                    {photo ? (
                      <Image
                        src={photo.photoUrl}
                        alt={label}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                          <Camera className={cn("size-5", isBusy && "animate-pulse")} />
                        </span>
                        <span className="text-[10px] font-bold text-rose-900">{t("addPhoto")}</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2.5 pt-8">
                      <p className="text-[11px] font-bold leading-tight text-white">{label}</p>
                    </div>
                  </div>
                </button>

                {photo && (
                  <button
                    type="button"
                    onClick={() => remove.mutate(photo._id)}
                    className="absolute left-2 top-2 flex size-7 items-center justify-center rounded-full bg-white/95 text-muted-foreground opacity-0 shadow transition group-hover:opacity-100 hover:text-destructive"
                    aria-label={tc("delete")}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-[11px] text-muted-foreground">{t("hint")}</p>
    </div>
  );
}
