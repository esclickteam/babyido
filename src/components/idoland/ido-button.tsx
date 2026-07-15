import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type IdoButtonProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "ghost";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  wide?: boolean;
};

export function IdoButton({
  children,
  className,
  variant = "primary",
  href,
  onClick,
  type = "button",
  disabled,
  wide,
}: IdoButtonProps) {
  const cls = cn(
    variant === "primary" ? "ido-btn-primary" : "ido-btn-ghost",
    wide && "w-full",
    disabled && "pointer-events-none opacity-60",
    className
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
