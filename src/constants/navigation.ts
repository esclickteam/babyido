import { Baby, BookOpen, Home, Settings, Stethoscope } from "lucide-react";

export const NAV_ITEMS = [
  { key: "dashboard", href: "/dashboard", icon: Home },
  { key: "baby", href: "/dashboard/baby", icon: Baby },
  { key: "journal", href: "/dashboard/journal", icon: BookOpen },
  { key: "wellBaby", href: "/dashboard/well-baby", icon: Stethoscope },
  { key: "settings", href: "/dashboard/settings", icon: Settings },
] as const;

export const QUICK_ACTIONS = [
  { key: "journal", href: "/dashboard/journal", icon: BookOpen },
  { key: "wellBaby", href: "/dashboard/well-baby", icon: Stethoscope },
] as const;
