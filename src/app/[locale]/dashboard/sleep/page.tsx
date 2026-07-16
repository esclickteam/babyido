import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SleepContent } from "@/components/sleep/sleep-content";
import { PageContainer } from "@/components/shared/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default async function SleepPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");
  return (
    <PageContainer title={t("sleep")}>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-3xl" />}>
        <SleepContent />
      </Suspense>
    </PageContainer>
  );
}
