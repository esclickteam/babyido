"use client";

import { ImagePlus, Plus } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { GalleryPhoto } from "@/types";
import { cn } from "@/lib/utils";
import { GALLERY_MAX_PHOTOS_PER_SLOT } from "@/utils/gallery";

interface GallerySlotCardProps {
  label: string;
  photos: GalleryPhoto[];
  isBusy: boolean;
  onUpload: () => void;
  onOpenViewer: () => void;
}

export function GallerySlotCard({
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

  return (
    <div className="overflow-hidden rounded-2xl border border-rose-200/80 bg-white shadow-sm">
      <div className="relative aspect-[3/4] w-full bg-rose-50">
        {hasPhotos && cover ? (
          <>
            <button
              type="button"
              className="absolute inset-0 block"
              onClick={onOpenViewer}
            >
              <Image
                src={cover.photoUrl}
                alt={label}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 220px"
                priority
              />
            </button>

            <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-rose-900 shadow-sm">
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

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-rose-950/80 via-rose-900/25 to-transparent p-2.5 pt-10">
          <p className="text-[11px] font-bold leading-tight text-white drop-shadow-sm">{label}</p>
        </div>
      </div>

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
