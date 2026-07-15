import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandSize = "sidebar" | "dashboard" | "header" | "hero";

interface BrandAssetProps {
  size?: BrandSize;
  className?: string;
  priority?: boolean;
}

const symbolSizes = {
  sidebar: "h-12 w-12",
  dashboard: "h-14 w-14 md:h-16 md:w-16",
  header: "h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28",
  hero: "h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36",
};

const wordmarkSizes = {
  sidebar: "text-xl",
  dashboard: "text-2xl md:text-3xl",
  header: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
  hero: "text-5xl sm:text-6xl md:text-7xl",
};

export function BrandSymbol({ size = "header", className, priority }: BrandAssetProps) {
  return (
    <Image
      src="/babyido-symbol.png"
      alt=""
      width={652}
      height={652}
      priority={priority}
      aria-hidden
      className={cn(
        "object-contain drop-shadow-[0_8px_24px_rgba(47,143,91,0.2)]",
        symbolSizes[size],
        className
      )}
    />
  );
}

export function BrandWordmark({ size = "header", className }: BrandAssetProps) {
  return (
    <span
      aria-label="BabyIdo"
      className={cn(
        "font-[family-name:var(--font-display)] font-bold leading-none tracking-tight",
        wordmarkSizes[size],
        className
      )}
    >
      <span className="text-[var(--grass-deep)]">Baby</span>
      <span className="text-[#f4a082]">I</span>
      <span className="text-[#f4a082]">d</span>
      <span className="text-[#6ecfc0]">o</span>
    </span>
  );
}

/** @deprecated Use BrandSymbol + BrandWordmark */
export function BrandLogo({ size = "header", className, priority }: BrandAssetProps) {
  return <BrandWordmark size={size} className={className} priority={priority} />;
}

interface BrandHeaderProps {
  size?: BrandSize;
  className?: string;
  priority?: boolean;
}

export function BrandHeader({ size = "header", className, priority }: BrandHeaderProps) {
  return (
    <div className={cn("flex items-center justify-center gap-3 sm:gap-4 md:gap-5", className)}>
      <BrandSymbol size={size} priority={priority} />
      <BrandWordmark size={size} />
    </div>
  );
}
