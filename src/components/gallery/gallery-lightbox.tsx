"use client";

import { ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import type { GalleryPhoto } from "@/types";
import { cn } from "@/lib/utils";

interface GalleryLightboxProps {
  photos: GalleryPhoto[];
  initialIndex: number;
  label: string;
  open: boolean;
  onClose: () => void;
  onDelete: (photo: GalleryPhoto) => void;
  deleting?: boolean;
}

export function GalleryLightbox({
  photos,
  initialIndex,
  label,
  open,
  onClose,
  onDelete,
  deleting,
}: GalleryLightboxProps) {
  const t = useTranslations("gallery");
  const tc = useTranslations("common");
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

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

  const current = photos[index];

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95"
      role="dialog"
      aria-modal
      aria-label={label}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{label}</p>
          <p className="text-xs text-white/70">
            {t("photoCounter", { current: index + 1, total: photos.length })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDelete(current)}
            disabled={deleting}
            className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-red-500/80"
            aria-label={tc("delete")}
          >
            <Trash2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label={t("closeViewer")}
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-14 py-4">
        {photos.length > 1 && (
          <button
            type="button"
            onClick={goPrev}
            className="absolute right-3 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
            aria-label={t("prevPhoto")}
          >
            <ChevronRight className="size-7" />
          </button>
        )}

        <div className="relative h-full w-full max-h-[75vh] max-w-3xl">
          <Image
            key={current._id}
            src={current.photoUrl}
            alt={label}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>

        {photos.length > 1 && (
          <button
            type="button"
            onClick={goNext}
            className="absolute left-3 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
            aria-label={t("nextPhoto")}
          >
            <ChevronLeft className="size-7" />
          </button>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex justify-center gap-1.5 px-4 pb-6">
          {photos.map((photo, i) => (
            <button
              key={photo._id}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "size-2 rounded-full transition",
                i === index ? "bg-white" : "bg-white/35 hover:bg-white/60"
              )}
              aria-label={t("photoCounter", { current: i + 1, total: photos.length })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
