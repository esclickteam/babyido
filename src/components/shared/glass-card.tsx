import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        "ido-panel",
        hover && "transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(31,107,66,0.22)]",
        className
      )}
    >
      {children}
    </div>
  );
}
