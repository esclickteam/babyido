import { cookies } from "next/headers";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth/config";
import { BABY_COOKIE } from "@/lib/baby-selection.server";
import { getDashboardStats } from "@/lib/data/dashboard-stats";
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

  const session = await auth();
  let initialStats = null;
  let selectedBabyId: string | null = null;

  if (session?.user?.id) {
    const cookieStore = await cookies();
    selectedBabyId = cookieStore.get(BABY_COOKIE)?.value ?? null;
    if (selectedBabyId) {
      initialStats = await getDashboardStats(selectedBabyId, session.user.id);
    }
  }

  return (
    <PageContainer className="max-w-none">
      <DashboardContent
        initialStats={initialStats}
        selectedBabyId={selectedBabyId}
      />
      <LegalDisclaimer />
    </PageContainer>
  );
}
