import { cn } from "@/lib/utils";

interface IdoPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function IdoPanel({ children, className }: IdoPanelProps) {
  return <div className={cn("ido-panel ido-sprout", className)}>{children}</div>;
}
