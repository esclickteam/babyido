import { getTranslations, setRequestLocale } from "next-intl/server";
import { FeedingCalculator } from "@/components/feeding/feeding-calculator";
import { PageContainer } from "@/components/shared/page-container";

export default async function FeedingCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");
  return (
    <PageContainer title={t("feedingCalculator")}>
      <FeedingCalculator />
    </PageContainer>
  );
}
