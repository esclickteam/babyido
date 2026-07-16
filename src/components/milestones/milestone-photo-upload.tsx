"use client";

import { Camera, ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { compressImageToDataUrl } from "@/utils/image";
import { cn } from "@/lib/utils";

interface MilestonePhotoUploadProps {
  value?: string;
  onChange: (dataUrl: string) => void;
  onClear?: () => void;
}

export function MilestonePhotoUpload({ value, onChange, onClear }: MilestonePhotoUploadProps) {
  const t = useTranslations("milestones");
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    try {
      const dataUrl = await compressImageToDataUrl(file, 900, 0.85);
      onChange(dataUrl);
    } catch {
      setError(t("photoError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1.5">
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

      {value ? (
        <div className="group relative overflow-hidden rounded-2xl border border-violet-200/80 bg-white shadow-sm">
          <div className="relative aspect-[4/3] max-h-44 w-full">
            <Image src={value} alt={t("photo")} fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
          </div>
          <div className="absolute left-2 top-2 flex gap-1.5 opacity-0 transition group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-violet-800 shadow"
            >
              <Camera className="size-3" />
              {t("changePhoto")}
            </button>
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="flex size-7 items-center justify-center rounded-full bg-white/95 text-muted-foreground shadow hover:text-destructive"
                aria-label={t("removePhoto")}
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-violet-200",
            "bg-gradient-to-b from-violet-50/80 to-white px-4 py-8 transition hover:border-violet-300 hover:bg-violet-50",
            loading && "pointer-events-none opacity-70"
          )}
        >
          <span className="flex size-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 ms-icon-float">
            {loading ? (
              <Camera className="size-6 animate-pulse" />
            ) : (
              <ImagePlus className="size-6" strokeWidth={2} />
            )}
          </span>
          <span className="text-sm font-bold text-violet-900">{t("uploadPhoto")}</span>
          <span className="text-[11px] text-muted-foreground">{t("uploadPhotoHint")}</span>
        </button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
