"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useRouter } from "@/i18n/navigation";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { IdoButton } from "@/components/idoland/ido-button";
import { IdoPanel } from "@/components/idoland/ido-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginFormProps {
  googleEnabled: boolean;
}

export function LoginForm({ googleEnabled }: LoginFormProps) {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(
        result.error === "CredentialsSignin" ? t("invalidCredentials") : t("serverError")
      );
      return;
    }

    router.push("/dashboard");
  }

  return (
    <IdoPanel className="space-y-5">
      <div className="space-y-1 text-center">
        <p className="ido-eyebrow">{t("login")}</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">{t("welcomeBack")}</h1>
        <p className="text-sm text-[var(--muted-ink)]">{t("welcomeSubtitle")}</p>
      </div>

      <GoogleSignInButton enabled={googleEnabled} />

      <div className="relative text-center text-xs uppercase text-[var(--muted-ink)]">
        <span className="bg-[var(--panel)] px-3">{t("orEmail")}</span>
        <div className="absolute inset-x-0 top-1/2 -z-10 border-t border-[var(--stroke)]" />
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <label className="grid gap-1.5 font-semibold">
          {t("email")}
          <Input id="email" type="email" className="rounded-2xl border-[var(--stroke)] bg-white py-3" {...form.register("email")} />
        </label>
        <label className="grid gap-1.5 font-semibold">
          {t("password")}
          <Input id="password" type="password" className="rounded-2xl border-[var(--stroke)] bg-white py-3" {...form.register("password")} />
        </label>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <IdoButton type="submit" wide disabled={loading} className="no-pulse">
          {loading ? tc("loading") : t("login")}
        </IdoButton>
      </form>

      <div className="space-y-2 text-center text-sm text-[var(--muted-ink)]">
        <Link href="/forgot-password" className="font-bold text-[var(--grass-deep)] underline">
          {t("forgotPassword")}
        </Link>
        <p>
          {t("noAccount")}{" "}
          <Link href="/register" className="font-extrabold text-[var(--grass-deep)] underline">
            {t("register")}
          </Link>
        </p>
      </div>
    </IdoPanel>
  );
}
