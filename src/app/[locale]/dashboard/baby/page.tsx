import { setRequestLocale } from "next-intl/server";
import { BabyProfileContent } from "@/components/baby/baby-profile-content";
import { PageContainer } from "@/components/shared/page-container";

export default async function BabyProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PageContainer>
      <BabyProfileContent />
    </PageContainer>
  );
}
