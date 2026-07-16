import { cookies } from "next/headers";
import { setRequestLocale } from "next-intl/server";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { PageContainer } from "@/components/shared/page-container";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PageContainer className="max-w-none">
      <DashboardContent />
      <LegalDisclaimer />
    </PageContainer>
  );
}
