"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [viewer, setViewer] = useState<{ slot: number } | null>(null);

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

  function openViewer(slot: number) {
    const slotPhotos = photosBySlot.get(slot);
    if (!slotPhotos?.length) return;
    setViewer({ slot });
  }

  function scrollStrip(direction: "prev" | "next") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.85, 360);
    el.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  }

  async function handleDeleteFromViewer(photo: GalleryPhoto) {
    try {
      await remove.mutateAsync(photo._id);
      toast.success(t("deleted"));
      const remaining = (photosBySlot.get(photo.ageMonths) ?? []).filter((p) => p._id !== photo._id);
      if (remaining.length === 0) {
        setViewer(null);
      }
    } catch {
      toast.error(tc("error"));
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
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

      <section className="overflow-hidden rounded-[2rem] bg-[#1a2218] text-white shadow-2xl shadow-[#1a2218]/20">
        <div className="flex items-end justify-between gap-4 px-5 pb-2 pt-8 md:px-10 md:pt-10">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold tracking-[0.28em] text-white/40 uppercase">
              {t("eyebrow")}
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold md:text-4xl">
              {t("title")}
            </h2>
            <p className="max-w-md text-sm text-white/55">{t("subtitle")}</p>
          </div>

          <div className="hidden shrink-0 gap-2 md:flex">
            <button
              type="button"
              onClick={() => scrollStrip("prev")}
              className="flex size-11 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-white/35 hover:text-white"
              aria-label={t("scrollPrev")}
            >
              <ChevronRight className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollStrip("next")}
              className="flex size-11 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-white/35 hover:text-white"
              aria-label={t("scrollNext")}
            >
              <ChevronLeft className="size-5" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex gap-5 overflow-hidden px-5 py-8 md:px-10">
            {GALLERY_AGE_SLOTS.map((slot) => (
              <div
                key={slot}
                className="aspect-[3/4] w-[min(78vw,340px)] shrink-0 animate-pulse rounded-sm bg-[#394b33]"
              />
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            dir="ltr"
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 py-8 [scrollbar-width:none] md:gap-8 md:px-10 md:py-10 [&::-webkit-scrollbar]:hidden"
          >
            {GALLERY_AGE_SLOTS.map((slot, slotIndex) => (
              <GallerySlotCard
                key={slot}
                slotIndex={slotIndex}
                label={formatGallerySlotLabel(slot, locale, baby.birthDate)}
                photos={photosBySlot.get(slot) ?? []}
                isBusy={uploadingSlot === slot}
                onUpload={() => openUpload(slot)}
                onOpenViewer={() => openViewer(slot)}
              />
            ))}
          </div>
        )}

        <p className="px-5 pb-8 text-center text-[11px] tracking-wide text-white/35 md:pb-10">
          {t("scrollHint")}
        </p>
      </section>

      <GalleryLightbox
        photos={viewerPhotos}
        label={viewerLabel}
        open={viewer !== null && viewerPhotos.length > 0}
        onClose={() => setViewer(null)}
        onDelete={handleDeleteFromViewer}
        deleting={remove.isPending}
      />
    </div>
  );
}
