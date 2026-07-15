import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { IdoButton } from "@/components/idoland/ido-button";
import { SkyDecor } from "@/components/idoland/sky-decor";
import { BrandLogo } from "@/components/shared/brand-logo";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { Link } from "@/i18n/navigation";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");

  const features = [
    { emoji: "📏", title: t("featureGrowth"), desc: t("featureGrowthDesc") },
    { emoji: "🍼", title: t("featureFeeding"), desc: t("featureFeedingDesc") },
    { emoji: "😴", title: t("featureSleep"), desc: t("featureSleepDesc") },
    { emoji: "✨", title: t("featureAI"), desc: t("featureAIDesc") },
  ];

  return (
    <div className="ido-sprout relative min-h-screen">
      <SkyDecor />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-end px-6 py-5">
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <BrandLogo size="md" priority />
        </Link>
        <div className="relative z-10 flex flex-wrap items-center gap-2">
          <IdoButton href="/login" variant="ghost" className="!px-5 !py-2.5 text-sm">
            {t("signIn")}
          </IdoButton>
          <IdoButton href="/register" className="!px-5 !py-2.5 text-sm no-pulse">
            {t("getStarted")}
          </IdoButton>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
        <section className="grid min-h-[min(72vh,640px)] items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <p className="ido-eyebrow">{t("eyebrow")}</p>
            <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.8rem,9vw,5.5rem)] font-bold leading-[0.95] text-[var(--ink)] [text-shadow:0_8px_0_rgba(126,217,87,0.25)]">
              {t("heroTitle")}
            </h1>
            <p className="max-w-lg text-lg text-[var(--muted-ink)] md:text-xl">{t("heroSubtitle")}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <IdoButton href="/register">
                {t("getStarted")}
                <ArrowLeft className="size-4" />
              </IdoButton>
              <IdoButton href="/login" variant="ghost">
                {t("haveAccount")}
              </IdoButton>
            </div>
          </div>

          <div className="grid place-items-center" aria-hidden>
            <div className="ido-planet ido-float">
              <div className="ido-planet-ring" />
              <div className="absolute inset-0 grid place-items-center text-[4.5rem]">👶</div>
            </div>
          </div>
        </section>

        <section className="mt-10 space-y-6">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold md:text-3xl">{t("features")}</h2>
          <ul className="grid list-none gap-4 p-0 md:grid-cols-2">
            {features.map(({ emoji, title, desc }) => (
              <li key={title} className="ido-panel flex gap-4 !p-5">
                <span className="text-3xl">{emoji}</span>
                <div>
                  <strong className="block font-[family-name:var(--font-display)] text-xl">{title}</strong>
                  <span className="text-[var(--muted-ink)]">{desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <LegalDisclaimer />
        </section>
      </main>
    </div>
  );
}
