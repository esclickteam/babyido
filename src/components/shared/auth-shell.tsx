import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SkyDecor } from "@/components/idoland/sky-decor";

interface AuthShellProps {
  children: React.ReactNode;
  backHref?: string;
}

export async function AuthShell({ children, backHref = "/" }: AuthShellProps) {
  const t = await getTranslations("common");

  return (
    <div className="ido-sprout relative min-h-screen">
      <SkyDecor />
      <main className="relative z-10 mx-auto max-w-lg px-6 py-8">
        <Link
          href={backHref}
          className="mb-4 inline-block border-0 bg-transparent p-0 font-bold text-[var(--grass-deep)] no-underline"
        >
          {t("back")}
        </Link>
        {children}
      </main>
    </div>
  );
}
