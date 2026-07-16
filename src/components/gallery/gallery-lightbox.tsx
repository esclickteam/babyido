"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const touchStartX = useRef(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) setIndex(0);
  }, [open, photos]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

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
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, goPrev, goNext]);

  if (!mounted || !open || photos.length === 0) return null;

  const current = photos[index] ?? photos[0];
  const counter = `${String(index + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-[#1a2218] text-white"
      role="dialog"
      aria-modal
      aria-label={label}
    >
      <header className="relative z-20 flex items-start justify-between gap-4 px-5 py-5 md:px-8 md:py-6">
        <div className="min-w-0 space-y-1">
          <p className="truncate font-[family-name:var(--font-display)] text-lg font-bold md:text-xl">
            {label}
          </p>
          <p className="text-xs tracking-[0.2em] text-white/45 uppercase">{counter}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onDelete(current)}
            disabled={deleting}
            className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-white/35 hover:text-white"
            aria-label={tc("delete")}
          >
            <Trash2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-white/35"
            aria-label={t("closeViewer")}
          >
            <X className="size-5" />
          </button>
        </div>
      </header>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-3 py-2 md:px-12 md:py-4"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? 0;
        }}
        onTouchEnd={(e) => {
          if (photos.length <= 1) return;
          const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
          if (dx < -48) goNext();
          else if (dx > 48) goPrev();
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current._id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-full w-full max-w-6xl"
          >
            {/* Soft fill behind portrait photos on wide screens */}
            <Image
              src={current.photoUrl}
              alt=""
              fill
              aria-hidden
              className="scale-110 object-cover opacity-25 blur-2xl"
              sizes="100vw"
            />
            <Image
              src={current.photoUrl}
              alt={label}
              fill
              className="relative z-10 object-contain"
              sizes="(max-width: 768px) 100vw, 1200px"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute right-4 top-1/2 z-20 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-sm transition hover:bg-black/40 md:flex"
              aria-label={t("prevPhoto")}
            >
              <ChevronRight className="size-6" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute left-4 top-1/2 z-20 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-sm transition hover:bg-black/40 md:flex"
              aria-label={t("nextPhoto")}
            >
              <ChevronLeft className="size-6" />
            </button>
          </>
        )}
      </div>

      <footer className="relative z-20 flex flex-col items-center gap-5 px-5 pb-8 pt-4 md:pb-10">
        {photos.length > 1 && (
          <nav className="flex items-center gap-3" aria-label={t("photoCounter", { current: index + 1, total: photos.length })}>
            {photos.map((photo, i) => (
              <button
                key={photo._id}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "rounded-full border-2 transition-all duration-500 ease-out",
                  i === index
                    ? "size-3.5 border-white bg-transparent shadow-[0_0_12px_rgba(255,255,255,0.35)]"
                    : "size-2 border-white/35 bg-transparent hover:border-white/70"
                )}
                aria-label={t("photoCounter", { current: i + 1, total: photos.length })}
                aria-current={i === index ? "true" : undefined}
              />
            ))}
          </nav>
        )}
        <p className="text-center text-[11px] tracking-wide text-white/40">{t("swipeHint")}</p>
      </footer>
    </div>,
    document.body
  );
}
