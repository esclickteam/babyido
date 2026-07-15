import { getTranslations, setRequestLocale } from "next-intl/server";
import { BabyForm } from "@/components/baby/baby-form";
import { PageContainer } from "@/components/shared/page-container";

export default async function BabyProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("baby");

  return (
    <PageContainer title={t("profile")} description={t("addChild")}>
      <BabyForm />
    </PageContainer>
  );
}
