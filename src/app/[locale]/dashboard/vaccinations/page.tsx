import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VaccinationsContent } from "@/components/vaccinations/vaccinations-content";
import { PageContainer } from "@/components/shared/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default async function VaccinationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");
  return (
    <PageContainer title={t("vaccinations")}>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-3xl" />}>
        <VaccinationsContent />
      </Suspense>
    </PageContainer>
  );
}
