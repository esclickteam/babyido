"use client";

import { ChevronLeft, ChevronRight, ImagePlus, Plus } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import type { GalleryPhoto } from "@/types";
import { cn } from "@/lib/utils";
import { GALLERY_MAX_PHOTOS_PER_SLOT } from "@/utils/gallery";

interface GallerySlotCardProps {
  label: string;
  photos: GalleryPhoto[];
  isBusy: boolean;
  onUpload: () => void;
  onOpenViewer: (index: number) => void;
}

export function GallerySlotCard({
  label,
  photos,
  isBusy,
  onUpload,
  onOpenViewer,
}: GallerySlotCardProps) {
  const t = useTranslations("gallery");
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(0);
  const atMax = photos.length >= GALLERY_MAX_PHOTOS_PER_SLOT;
  const hasPhotos = photos.length > 0;
  const safeIndex = Math.min(index, Math.max(photos.length - 1, 0));

  const goNext = useCallback(() => {
    if (photos.length <= 1) return;
    setIndex((i) => (i < photos.length - 1 ? i + 1 : 0));
  }, [photos.length]);

  const goPrev = useCallback(() => {
    if (photos.length <= 1) return;
    setIndex((i) => (i > 0 ? i - 1 : photos.length - 1));
  }, [photos.length]);

  return (
    <div className="overflow-hidden rounded-2xl border border-rose-200/80 bg-white shadow-sm">
      <div
        className="relative aspect-[3/4] w-full touch-pan-y bg-gradient-to-b from-rose-50 to-white"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? 0;
        }}
        onTouchEnd={(e) => {
          if (photos.length <= 1) return;
          const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
          if (dx < -36) goNext();
          else if (dx > 36) goPrev();
        }}
      >
        {hasPhotos ? (
          <>
            <button
              type="button"
              className="relative block h-full w-full"
              onClick={() => onOpenViewer(safeIndex)}
            >
              <div className="relative h-full w-full overflow-hidden">
                <div
                  className="flex h-full transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${safeIndex * 100}%)` }}
                >
                  {photos.map((photo) => (
                    <div key={photo._id} className="relative h-full w-full shrink-0">
                      <Image
                        src={photo.photoUrl}
                        alt={label}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 200px"
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </button>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  className="absolute right-1.5 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
                  aria-label={t("prevPhoto")}
                >
                  <ChevronRight className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  className="absolute left-1.5 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
                  aria-label={t("nextPhoto")}
                >
                  <ChevronLeft className="size-4" />
                </button>
              </>
            )}

            <span className="absolute left-2 top-2 z-10 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white">
              {t("photoCount", {
                count: photos.length,
                max: GALLERY_MAX_PHOTOS_PER_SLOT,
              })}
            </span>
          </>
        ) : (
          <button
            type="button"
            onClick={onUpload}
            disabled={isBusy}
            className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <ImagePlus className={cn("size-5", isBusy && "animate-pulse")} />
            </span>
            <span className="text-[10px] font-bold text-rose-900">{t("addPhoto")}</span>
          </button>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-2.5 pt-8">
          <p className="text-[11px] font-bold leading-tight text-white">{label}</p>
        </div>
      </div>

      {hasPhotos && photos.length > 1 && (
        <div className="flex justify-center gap-1 border-t border-rose-100 bg-rose-50/50 py-2">
          {photos.map((photo, i) => (
            <button
              key={photo._id}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "size-1.5 rounded-full transition",
                i === safeIndex ? "w-4 bg-rose-500" : "bg-rose-300 hover:bg-rose-400"
              )}
              aria-label={t("photoCounter", { current: i + 1, total: photos.length })}
            />
          ))}
        </div>
      )}

      {hasPhotos && !atMax && (
        <button
          type="button"
          onClick={onUpload}
          disabled={isBusy}
          className="flex w-full items-center justify-center gap-1.5 border-t border-rose-100 bg-white py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
        >
          <Plus className={cn("size-3.5", isBusy && "animate-pulse")} />
          {isBusy ? t("uploading") : t("addMore")}
        </button>
      )}
    </div>
  );
}
