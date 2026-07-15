import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type LinkButtonProps = React.ComponentProps<typeof Link> & {
  className?: string;
  variant?: "primary" | "ghost";
  size?: "default" | "lg" | "sm";
};

export function LinkButton({
  href,
  variant = "primary",
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        variant === "primary" ? "ido-btn-primary" : "ido-btn-ghost",
        variant === "primary" && "no-pulse",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
