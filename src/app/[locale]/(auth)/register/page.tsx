import { setRequestLocale } from "next-intl/server";
import { RegisterForm } from "@/components/auth/register-form";
import { isGoogleAuthEnabled } from "@/lib/auth/google";
import { AuthShell } from "@/components/shared/auth-shell";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthShell>
      <RegisterForm googleEnabled={isGoogleAuthEnabled()} />
    </AuthShell>
  );
}
