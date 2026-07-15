import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { GrowthContent } from "@/components/growth/growth-content";
import { PageContainer } from "@/components/shared/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default async function GrowthPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");
  return (
    <PageContainer title={t("growth")}>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-3xl" />}>
        <GrowthContent />
      </Suspense>
    </PageContainer>
  );
}
