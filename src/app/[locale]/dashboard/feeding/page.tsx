import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FeedingContent } from "@/components/feeding/feeding-content";
import { PageContainer } from "@/components/shared/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default async function FeedingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");
  return (
    <PageContainer title={t("feeding")}>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-3xl" />}>
        <FeedingContent />
      </Suspense>
    </PageContainer>
  );
}
