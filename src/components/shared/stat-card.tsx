import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, subValue, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-card/80 p-4 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
        </div>
        {icon && (
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
