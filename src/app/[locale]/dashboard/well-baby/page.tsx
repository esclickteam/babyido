import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { WellBabyContent } from "@/components/well-baby/well-baby-content";
import { PageContainer } from "@/components/shared/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default async function WellBabyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");
  return (
    <PageContainer title={t("wellBaby")}>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-3xl" />}>
        <WellBabyContent />
      </Suspense>
    </PageContainer>
  );
}
