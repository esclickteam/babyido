"use client";

import { ImagePlus, Plus } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { GalleryPhoto } from "@/types";
import { cn } from "@/lib/utils";
import { GALLERY_MAX_PHOTOS_PER_SLOT } from "@/utils/gallery";

interface GallerySlotCardProps {
  slotIndex: number;
  label: string;
  photos: GalleryPhoto[];
  isBusy: boolean;
  onUpload: () => void;
  onOpenViewer: () => void;
}

export function GallerySlotCard({
  slotIndex,
  label,
  photos,
  isBusy,
  onUpload,
  onOpenViewer,
}: GallerySlotCardProps) {
  const t = useTranslations("gallery");
  const atMax = photos.length >= GALLERY_MAX_PHOTOS_PER_SLOT;
  const hasPhotos = photos.length > 0;
  const cover = photos[0];
  const slotNumber = String(slotIndex + 1).padStart(2, "0");

  return (
    <article className="w-[min(78vw,340px)] shrink-0 snap-center sm:w-[300px] md:w-[340px]">
      <div className="group relative aspect-[3/4] overflow-hidden bg-[#394b33]">
        {hasPhotos && cover ? (
          <>
            <button
              type="button"
              className="absolute inset-0 block transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              onClick={onOpenViewer}
            >
              <Image
                src={cover.photoUrl}
                alt={label}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 78vw, 340px"
              />
            </button>

            <span className="pointer-events-none absolute left-4 top-4 z-10 font-[family-name:var(--font-display)] text-3xl font-bold leading-none text-white/25">
              {slotNumber}
            </span>

            <span className="pointer-events-none absolute right-4 top-4 z-10 rounded-full border border-white/25 bg-black/25 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white backdrop-blur-sm">
              {t("photoCount", {
                count: photos.length,
                max: GALLERY_MAX_PHOTOS_PER_SLOT,
              })}
            </span>

            {!atMax && (
              <button
                type="button"
                onClick={onUpload}
                disabled={isBusy}
                className="absolute bottom-16 right-4 z-10 flex size-10 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur-md transition hover:scale-105 hover:bg-black/50"
                aria-label={t("addMore")}
              >
                <Plus className={cn("size-4", isBusy && "animate-pulse")} />
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={onUpload}
            disabled={isBusy}
            className="flex h-full w-full flex-col items-center justify-center gap-3 border border-dashed border-white/15 text-white/70 transition hover:border-white/30 hover:text-white"
          >
            <span className="flex size-12 items-center justify-center rounded-full border border-white/20">
              <ImagePlus className={cn("size-5", isBusy && "animate-pulse")} />
            </span>
            <span className="text-xs font-semibold tracking-wide">{t("addPhoto")}</span>
          </button>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a2218] via-[#1a2218]/55 to-transparent p-4 pt-16">
          <p className="text-sm font-semibold leading-snug text-white">{label}</p>
          {hasPhotos && (
            <p className="mt-1 text-[11px] text-white/55">
              {t("tapToView")}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
