import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sidebar" | "dashboard" | "header" | "hero";
  className?: string;
  priority?: boolean;
}

const sizes = {
  sidebar: "h-12",
  dashboard: "h-14 md:h-16",
  header: "h-24 sm:h-28 md:h-32",
  hero: "h-32 sm:h-36 md:h-40",
};

export function BrandLogo({ size = "header", className, priority }: BrandLogoProps) {
  return (
    <Image
      src="/babyido-logo.png"
      alt="BabyIdo"
      width={1024}
      height={1024}
      priority={priority}
      className={cn(
        "w-auto object-contain drop-shadow-[0_8px_24px_rgba(47,143,91,0.18)]",
        sizes[size],
        className
      )}
    />
  );
}
