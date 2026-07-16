import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/auth/login-form";
import { isGoogleAuthEnabled } from "@/lib/auth/google";
import { AuthShell } from "@/components/shared/auth-shell";
import { redirect } from "@/i18n/navigation";
import { auth } from "@/lib/auth/config";
import { getAuthUserId } from "@/lib/auth/session-user";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (getAuthUserId(session)) {
    redirect({ href: "/dashboard", locale: locale as "he" });
  }

  return (
    <AuthShell>
      <LoginForm googleEnabled={isGoogleAuthEnabled()} />
    </AuthShell>
  );
}
