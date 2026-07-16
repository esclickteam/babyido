"use client";

import { Camera, ImagePlus, Plus } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { GalleryLightbox } from "@/components/gallery/gallery-lightbox";
import { NoBabyPrompt } from "@/components/shared/no-baby-prompt";
import {
  useDeleteGalleryPhoto,
  useGalleryPhotos,
  useUploadGalleryPhoto,
} from "@/hooks/use-gallery";
import { useBabyStore } from "@/stores/baby-store";
import type { GalleryPhoto, Locale } from "@/types";
import { cn } from "@/lib/utils";
import {
  formatGallerySlotLabel,
  GALLERY_AGE_SLOTS,
  GALLERY_MAX_PHOTOS_PER_SLOT,
} from "@/utils/gallery";

export function GalleryContent() {
  const t = useTranslations("gallery");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const baby = useBabyStore((s) => s.getSelectedBaby());
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [viewer, setViewer] = useState<{ slot: number; index: number } | null>(null);

  const { data: photos = [], isLoading } = useGalleryPhotos(baby?._id ?? null);
  const upload = useUploadGalleryPhoto(baby?._id ?? null);
  const remove = useDeleteGalleryPhoto(baby?._id ?? null);

  const photosBySlot = useMemo(() => {
    const map = new Map<number, GalleryPhoto[]>();
    for (const photo of photos) {
      const list = map.get(photo.ageMonths) ?? [];
      list.push(photo);
      map.set(photo.ageMonths, list);
    }
    for (const [slot, list] of map) {
      list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      map.set(slot, list);
    }
    return map;
  }, [photos]);

  if (!baby) return <NoBabyPrompt />;

  const viewerPhotos = viewer ? (photosBySlot.get(viewer.slot) ?? []) : [];
  const viewerLabel = viewer
    ? formatGallerySlotLabel(viewer.slot, locale, baby.birthDate)
    : "";

  async function handleFile(file: File, ageMonths: number) {
    if (!baby) return;
    setUploadingSlot(ageMonths);
    try {
      await upload.mutateAsync({ babyId: baby._id, ageMonths, file });
      toast.success(t("saved"));
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "maxPhotosReached") {
          toast.error(t("maxPhotos", { max: GALLERY_MAX_PHOTOS_PER_SLOT }));
          return;
        }
        if (error.message === "cloudinaryNotConfigured") {
          toast.error(t("cloudinaryMissing"));
          return;
        }
      }
      toast.error(tc("error"));
    } finally {
      setUploadingSlot(null);
      setActiveSlot(null);
    }
  }

  function openUpload(slot: number) {
    const count = photosBySlot.get(slot)?.length ?? 0;
    if (count >= GALLERY_MAX_PHOTOS_PER_SLOT) {
      toast.error(t("maxPhotos", { max: GALLERY_MAX_PHOTOS_PER_SLOT }));
      return;
    }
    setActiveSlot(slot);
    inputRef.current?.click();
  }

  function openViewer(slot: number, index = 0) {
    const slotPhotos = photosBySlot.get(slot);
    if (!slotPhotos?.length) return;
    setViewer({ slot, index });
  }

  async function handleDeleteFromViewer(photo: GalleryPhoto) {
    try {
      await remove.mutateAsync(photo._id);
      toast.success(t("deleted"));
      const remaining = (photosBySlot.get(photo.ageMonths) ?? []).filter((p) => p._id !== photo._id);
      if (remaining.length === 0) {
        setViewer(null);
      } else if (viewer) {
        const nextIndex = Math.min(viewer.index, remaining.length - 1);
        setViewer({ slot: photo.ageMonths, index: nextIndex });
      }
    } catch {
      toast.error(tc("error"));
    }
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
          if (file && activeSlot !== null) void handleFile(file, activeSlot);
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
          {GALLERY_AGE_SLOTS.map((slot) => (
            <div key={slot} className="aspect-[3/4] animate-pulse rounded-2xl bg-muted/40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {GALLERY_AGE_SLOTS.map((slot) => {
            const slotPhotos = photosBySlot.get(slot) ?? [];
            const cover = slotPhotos[0];
            const label = formatGallerySlotLabel(slot, locale, baby.birthDate);
            const isBusy = uploadingSlot === slot;
            const atMax = slotPhotos.length >= GALLERY_MAX_PHOTOS_PER_SLOT;

            return (
              <div
                key={slot}
                className="group relative overflow-hidden rounded-2xl border border-rose-200/80 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => (cover ? openViewer(slot, 0) : openUpload(slot))}
                  disabled={isBusy}
                  className="block w-full text-start"
                >
                  <div className="relative aspect-[3/4] w-full bg-gradient-to-b from-rose-50 to-white">
                    {cover ? (
                      <Image
                        src={cover.photoUrl}
                        alt={label}
                        fill
                        className="object-cover transition group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 50vw, 200px"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                          {isBusy ? (
                            <Camera className="size-5 animate-pulse" />
                          ) : (
                            <ImagePlus className="size-5" />
                          )}
                        </span>
                        <span className="text-[10px] font-bold text-rose-900">{t("addPhoto")}</span>
                      </div>
                    )}

                    {slotPhotos.length > 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white">
                        {t("photoCount", {
                          count: slotPhotos.length,
                          max: GALLERY_MAX_PHOTOS_PER_SLOT,
                        })}
                      </span>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-2.5 pt-8">
                      <p className="text-[11px] font-bold leading-tight text-white">{label}</p>
                    </div>
                  </div>
                </button>

                {cover && !atMax && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openUpload(slot);
                    }}
                    disabled={isBusy}
                    className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/95 text-rose-700 shadow transition hover:bg-rose-50"
                    aria-label={t("addPhoto")}
                  >
                    <Plus className={cn("size-4", isBusy && "animate-pulse")} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-[11px] text-muted-foreground">{t("hint")}</p>

      <GalleryLightbox
        photos={viewerPhotos}
        initialIndex={viewer?.index ?? 0}
        label={viewerLabel}
        open={viewer !== null && viewerPhotos.length > 0}
        onClose={() => setViewer(null)}
        onDelete={handleDeleteFromViewer}
        deleting={remove.isPending}
      />
    </div>
  );
}
