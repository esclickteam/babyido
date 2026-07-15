import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
}

const sizes = {
  xs: "h-8",
  sm: "h-10",
  md: "h-14",
  lg: "h-20",
};

export function BrandLogo({ size = "md", className, priority }: BrandLogoProps) {
  return (
    <Image
      src="/babyido-logo.png"
      alt="BabyIdo"
      width={1024}
      height={1024}
      priority={priority}
      className={cn("w-auto object-contain", sizes[size], className)}
    />
  );
}
