import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function PageContainer({ children, className, title, description }: PageContainerProps) {
  return (
    <div
      className={cn(
        "ido-sprout mx-auto w-full max-w-7xl space-y-8 p-4 md:p-8",
        className
      )}
    >
      {(title || description) && (
        <header className="space-y-2">
          {title && <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </header>
      )}
      {children}
    </div>
  );
}
