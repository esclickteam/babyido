"use client";

import type { LucideIcon } from "lucide-react";
import {
  Apple,
  Armchair,
  Baby,
  Bike,
  BookOpen,
  Bug,
  Calendar,
  Camera,
  Carrot,
  CheckCircle2,
  Circle,
  CircleDot,
  Clock,
  Copy,
  CupSoda,
  Dices,
  Drama,
  Droplets,
  Dumbbell,
  Ear,
  Eye,
  EyeOff,
  Footprints,
  Gift,
  Hand,
  HandMetal,
  Heart,
  Lightbulb,
  MessageCircle,
  Mic,
  Moon,
  Mountain,
  Palette,
  Pointer,
  RefreshCw,
  Search,
  Shirt,
  Smile,
  Sparkles,
  Sprout,
  Star,
  Target,
  ToyBrick,
  Utensils,
  UtensilsCrossed,
  Users,
  UsersRound,
  Waves,
} from "lucide-react";
import type { MilestoneCategory } from "@/constants/milestones";
import type { MilestoneStatus } from "@/utils/milestone-status";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<
  MilestoneCategory,
  { Icon: LucideIcon; gradient: string; ring: string }
> = {
  development: {
    Icon: Sprout,
    gradient: "from-violet-400 to-violet-600",
    ring: "ring-violet-200/80",
  },
  teeth: {
    Icon: CircleDot,
    gradient: "from-sky-400 to-sky-600",
    ring: "ring-sky-200/80",
  },
  nutrition: {
    Icon: UtensilsCrossed,
    gradient: "from-orange-400 to-amber-500",
    ring: "ring-orange-200/80",
  },
  sleep: {
    Icon: Moon,
    gradient: "from-indigo-400 to-indigo-600",
    ring: "ring-indigo-200/80",
  },
  firstMoments: {
    Icon: Heart,
    gradient: "from-rose-400 to-pink-500",
    ring: "ring-rose-200/80",
  },
};

const STATUS_ICONS: Record<MilestoneStatus, LucideIcon> = {
  completed: CheckCircle2,
  expected_soon: Clock,
  approaching: Eye,
  upcoming: Calendar,
  available: Sparkles,
};

function resolveMilestoneIcon(id: string, category: MilestoneCategory): LucideIcon {
  const rules: [RegExp, LucideIcon][] = [
    [/eye|face/, Eye],
    [/voice|sound|babble|word|words|vocab|sentences|two-words/, Mic],
    [/blink/, Sparkles],
    [/move|transfer|hands|hand|pinch|wave|clap|finger/, Hand],
    [/head|sit|stand|crawl|cruise|walk|run|jump|stairs|hop|climb|kick/, Baby],
    [/smile|laugh|emotion|year/, Smile],
    [/toy|grasp|play|pretend|imagine|cause|dice/, ToyBrick],
    [/calm|understand|body/, MessageCircle],
    [/roll|open/, RefreshCw],
    [/reach|point|object/, Target],
    [/mouth|solid/, Utensils],
    [/name|recognize/, Users],
    [/peekaboo|no/, EyeOff],
    [/elbows|mimic/, Copy],
    [/tooth|teeth/, CircleDot],
    [/solids|spoon|food-first|solid/, Utensils],
    [/fruit/, Apple],
    [/veg|carrot/, Carrot],
    [/water/, Droplets],
    [/cup/, CupSoda],
    [/bug/, Bug],
    [/search/, Search],
    [/light|understand/, Lightbulb],
    [/gift|give/, Gift],
    [/book|vocab/, BookOpen],
    [/sort|circle|paint/, Palette],
    [/friends|play/, UsersRound],
    [/bike/, Bike],
    [/dress|shirt/, Shirt],
    [/mountain|climb/, Mountain],
    [/foot|stomp/, Footprints],
    [/drama|pretend/, Drama],
    [/dice|cause/, Dices],
    [/pointer|point/, Pointer],
    [/handmetal|clap/, HandMetal],
    [/sleep|nap|night/, Moon],
    [/bath|swim|pool/, Waves],
    [/photo|picture/, Camera],
    [/heart|first/, Heart],
    [/step|walk/, Footprints],
  ];

  for (const [pattern, icon] of rules) {
    if (pattern.test(id)) return icon;
  }

  return CATEGORY_META[category].Icon;
}

function animationForStatus(status?: MilestoneStatus) {
  if (status === "expected_soon") return "ms-icon-wiggle";
  if (status === "available") return "ms-icon-float";
  if (status === "approaching") return "ms-icon-float";
  if (status === "completed") return "";
  return "";
}

interface MilestoneIconBadgeProps {
  id: string;
  category: MilestoneCategory;
  status?: MilestoneStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MilestoneIconBadge({
  id,
  category,
  status,
  size = "md",
  className,
}: MilestoneIconBadgeProps) {
  const meta = CATEGORY_META[category];
  const Icon = resolveMilestoneIcon(id, category);
  const dim = size === "sm" ? "size-9" : size === "lg" ? "size-14" : "size-11";
  const iconDim = size === "sm" ? "size-4" : size === "lg" ? "size-7" : "size-5";

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm ring-2",
        dim,
        meta.gradient,
        meta.ring,
        animationForStatus(status),
        status === "expected_soon" && "ms-icon-glow",
        className
      )}
    >
      {status === "expected_soon" && (
        <span className="absolute inset-0 animate-ping rounded-2xl bg-violet-400/25" />
      )}
      <Icon className={cn("relative", iconDim)} strokeWidth={2.2} />
    </span>
  );
}

interface CategoryTabIconProps {
  category: MilestoneCategory;
  active?: boolean;
}

export function CategoryTabIcon({ category, active }: CategoryTabIconProps) {
  const { Icon } = CATEGORY_META[category];
  return (
    <span
      className={cn(
        "inline-flex size-6 items-center justify-center rounded-lg transition-transform",
        active && "ms-icon-wiggle"
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.4} />
    </span>
  );
}

interface MilestoneStatusBadgeProps {
  status: MilestoneStatus;
  label: string;
  colorClass: string;
  bgClass: string;
}

export function MilestoneStatusBadge({
  status,
  label,
  colorClass,
  bgClass,
}: MilestoneStatusBadgeProps) {
  const Icon = STATUS_ICONS[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
        bgClass,
        colorClass,
        status === "expected_soon" && "ms-icon-glow"
      )}
    >
      <Icon
        className={cn(
          "size-3",
          status === "expected_soon" && "ms-icon-wiggle",
          status === "available" && "ms-icon-float"
        )}
        strokeWidth={2.5}
      />
      {label}
    </span>
  );
}

export function MilestoneHeroIcon({ category }: { category: MilestoneCategory }) {
  const { Icon, gradient } = CATEGORY_META[category];
  return (
    <div
      className={cn(
        "relative flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md ring-2 ring-white/60",
        gradient
      )}
    >
      <span className="absolute inset-0 animate-pulse rounded-2xl bg-white/10" />
      <Icon className="relative size-6 ms-icon-float" strokeWidth={2.2} />
    </div>
  );
}

export function CelebrationStar() {
  return (
    <div className="relative mx-auto size-16">
      <Star className="absolute inset-0 size-16 fill-amber-300 text-amber-400 ms-icon-wiggle" />
      <Sparkles className="absolute -right-1 -top-1 size-6 text-violet-500 ms-icon-float" />
      <Sparkles className="absolute -bottom-1 -left-1 size-5 text-sky-500 ms-icon-float" style={{ animationDelay: "0.4s" }} />
    </div>
  );
}
