import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/auth/login-form";
import { isGoogleAuthEnabled } from "@/lib/auth/google";
import { AuthShell } from "@/components/shared/auth-shell";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthShell>
      <LoginForm googleEnabled={isGoogleAuthEnabled()} />
    </AuthShell>
  );
}
