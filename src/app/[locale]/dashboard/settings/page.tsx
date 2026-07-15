import { getTranslations, setRequestLocale } from "next-intl/server";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { PageContainer } from "@/components/shared/page-container";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("settings");
  return (
    <PageContainer title={t("title")}>
      <SettingsPanel />
    </PageContainer>
  );
}
