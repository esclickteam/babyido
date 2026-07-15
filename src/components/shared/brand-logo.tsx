import { Baby } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  tagline?: string;
  appName?: string;
  className?: string;
}

const sizes = {
  sm: { box: "size-10", icon: "size-5", title: "text-base" },
  md: { box: "size-12", icon: "size-6", title: "text-lg" },
  lg: { box: "size-16", icon: "size-8", title: "text-2xl" },
};

export function BrandLogo({ size = "md", showTagline, tagline, appName = "BabyIdo", className }: BrandLogoProps) {
  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          s.box,
          "flex items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white shadow-lg shadow-[var(--primary)]/25"
        )}
      >
        <Baby className={s.icon} />
      </div>
      <div>
        <p className={cn(s.title, "font-bold tracking-tight text-foreground")}>{appName}</p>
        {showTagline && tagline && (
          <p className="text-xs text-muted-foreground">{tagline}</p>
        )}
      </div>
    </div>
  );
}
