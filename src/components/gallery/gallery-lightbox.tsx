"use client";

import { ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryPhoto } from "@/types";
import { cn } from "@/lib/utils";

interface GalleryLightboxProps {
  photos: GalleryPhoto[];
  label: string;
  open: boolean;
  onClose: () => void;
  onDelete: (photo: GalleryPhoto) => void;
  deleting?: boolean;
}

export function GalleryLightbox({
  photos,
  label,
  open,
  onClose,
  onDelete,
  deleting,
}: GalleryLightboxProps) {
  const t = useTranslations("gallery");
  const tc = useTranslations("common");
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    if (open) setIndex(0);
  }, [open, photos]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : photos.length - 1));
  }, [photos.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i < photos.length - 1 ? i + 1 : 0));
  }, [photos.length]);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goPrev();
      if (e.key === "ArrowLeft") goNext();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, goPrev, goNext]);

  if (!open || photos.length === 0) return null;

  const current = photos[index] ?? photos[0];

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-[#fef6f0]"
      role="dialog"
      aria-modal
      aria-label={label}
    >
      <div className="flex items-center justify-between gap-3 border-b border-rose-100 bg-white/90 px-4 py-3 text-[var(--ink)] backdrop-blur-sm">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{label}</p>
          <p className="text-xs text-muted-foreground">
            {t("photoCounter", { current: index + 1, total: photos.length })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDelete(current)}
            disabled={deleting}
            className="flex size-10 items-center justify-center rounded-full bg-rose-50 text-rose-700 transition hover:bg-rose-100"
            aria-label={tc("delete")}
          >
            <Trash2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full bg-rose-50 text-rose-700 transition hover:bg-rose-100"
            aria-label={t("closeViewer")}
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-stretch justify-center"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? 0;
        }}
        onTouchEnd={(e) => {
          if (photos.length <= 1) return;
          const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
          if (dx < -40) goNext();
          else if (dx > 40) goPrev();
        }}
      >
        {photos.length > 1 && (
          <button
            type="button"
            onClick={goPrev}
            className="absolute right-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-rose-800 shadow-md"
            aria-label={t("prevPhoto")}
          >
            <ChevronRight className="size-6" />
          </button>
        )}

        <div className="relative h-full w-full">
          <Image
            key={current._id}
            src={current.photoUrl}
            alt={label}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>

        {photos.length > 1 && (
          <button
            type="button"
            onClick={goNext}
            className="absolute left-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-rose-800 shadow-md"
            aria-label={t("nextPhoto")}
          >
            <ChevronLeft className="size-6" />
          </button>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex justify-center gap-1.5 border-t border-rose-100 bg-white/90 px-4 py-4">
          {photos.map((photo, i) => (
            <button
              key={photo._id}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "h-2 rounded-full transition",
                i === index ? "w-5 bg-rose-500" : "w-2 bg-rose-200 hover:bg-rose-300"
              )}
              aria-label={t("photoCounter", { current: i + 1, total: photos.length })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
