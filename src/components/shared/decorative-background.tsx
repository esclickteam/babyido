import { Baby, Heart, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function DecorativeBackground({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="absolute -top-24 -right-16 size-72 rounded-full bg-[var(--blob-peach)] opacity-70 blur-3xl" />
      <div className="absolute top-1/3 -left-20 size-80 rounded-full bg-[var(--blob-lavender)] opacity-60 blur-3xl" />
      <div className="absolute -bottom-16 right-1/4 size-96 rounded-full bg-[var(--blob-mint)] opacity-50 blur-3xl" />
      <Star className="absolute top-24 left-[12%] size-5 fill-[var(--accent)] text-[var(--accent)] opacity-60" />
      <Heart className="absolute top-40 right-[18%] size-6 fill-[var(--primary)] text-[var(--primary)] opacity-40" />
      <Sparkles className="absolute bottom-32 left-[20%] size-7 text-[var(--blob-lavender)] opacity-50" />
      <Baby className="absolute bottom-20 right-[12%] size-10 text-[var(--primary)] opacity-20" />
    </div>
  );
}
