"use client";

import { Camera, UserRound } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { compressImageToDataUrl } from "@/utils/image";
import { cn } from "@/lib/utils";

interface BabyPhotoUploadProps {
  value?: string;
  name?: string;
  onChange: (dataUrl: string) => void;
}

export function BabyPhotoUpload({ value, name, onChange }: BabyPhotoUploadProps) {
  const t = useTranslations("baby");
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      onChange(dataUrl);
    } catch {
      setError(t("photoError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className={cn(
          "group relative size-32 overflow-hidden rounded-full border-4 border-white",
          "bg-gradient-to-br from-[var(--leaf)]/30 to-[var(--coral)]/20 shadow-[var(--shadow-ido)]",
          "transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--grass)]"
        )}
        aria-label={t("uploadPhoto")}
      >
        {value ? (
          <Image src={value} alt={name ?? t("photo")} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex size-full items-center justify-center text-[var(--grass-deep)]">
            <UserRound className="size-14 opacity-50" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-[var(--ink)]/55 py-2 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="size-3.5" />
          {value ? t("changePhoto") : t("uploadPhoto")}
        </div>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-semibold text-[var(--grass-deep)]">
            {t("uploading")}
          </div>
        )}
      </button>
      <p className="max-w-[220px] text-center text-xs text-[var(--muted-ink)]">{t("photoHint")}</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
