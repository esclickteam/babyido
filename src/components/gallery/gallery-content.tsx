"use client";

import { Camera } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { GalleryLightbox } from "@/components/gallery/gallery-lightbox";
import { GallerySlotCard } from "@/components/gallery/gallery-slot-card";
import { NoBabyPrompt } from "@/components/shared/no-baby-prompt";
import {
  useDeleteGalleryPhoto,
  useGalleryPhotos,
  useUploadGalleryPhoto,
} from "@/hooks/use-gallery";
import { useBabyStore } from "@/stores/baby-store";
import type { GalleryPhoto, Locale } from "@/types";
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

  async function uploadFiles(files: File[], ageMonths: number) {
    if (!baby) return;

    const existing = photosBySlot.get(ageMonths)?.length ?? 0;
    const room = GALLERY_MAX_PHOTOS_PER_SLOT - existing;
    if (room <= 0) {
      toast.error(t("maxPhotos", { max: GALLERY_MAX_PHOTOS_PER_SLOT }));
      return;
    }

    const batch = files.slice(0, room);
    if (files.length > batch.length) {
      toast.message(t("uploadTrimmed", { max: GALLERY_MAX_PHOTOS_PER_SLOT }));
    }

    setUploadingSlot(ageMonths);
    let uploaded = 0;

    try {
      for (const file of batch) {
        await upload.mutateAsync({ babyId: baby._id, ageMonths, file });
        uploaded += 1;
      }
      toast.success(
        uploaded === 1 ? t("saved") : t("savedMany", { count: uploaded })
      );
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
        if (error.message === "legacyIndex") {
          toast.error(t("legacyIndex"));
          return;
        }
      }
      if (uploaded > 0) {
        toast.message(t("partialUpload", { count: uploaded }));
      } else {
        toast.error(tc("error"));
      }
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
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length && activeSlot !== null) void uploadFiles(files, activeSlot);
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
          {GALLERY_AGE_SLOTS.map((slot) => (
            <GallerySlotCard
              key={slot}
              label={formatGallerySlotLabel(slot, locale, baby.birthDate)}
              photos={photosBySlot.get(slot) ?? []}
              isBusy={uploadingSlot === slot}
              onUpload={() => openUpload(slot)}
              onOpenViewer={(index) => openViewer(slot, index)}
            />
          ))}
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
