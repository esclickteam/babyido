import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageContainer } from "@/components/shared/page-container";
import { ModuleScaffold } from "@/components/shared/module-scaffold";

export default async function SleepPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");
  return (
    <PageContainer title={t("sleep")}>
      <ModuleScaffold showLegal />
    </PageContainer>
  );
}
