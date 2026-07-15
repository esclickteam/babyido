"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useRouter } from "@/i18n/navigation";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { IdoButton } from "@/components/idoland/ido-button";
import { IdoPanel } from "@/components/idoland/ido-panel";
import { Input } from "@/components/ui/input";

const API_ERRORS: Record<string, string> = {
  "Invalid input": "invalidInput",
  "Email already exists": "emailExists",
  "Internal server error": "serverError",
};

interface RegisterFormProps {
  googleEnabled: boolean;
}

export function RegisterForm({ googleEnabled }: RegisterFormProps) {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const registerSchema = useMemo(
    () =>
      z
        .object({
          name: z.string().min(2),
          email: z.string().email(),
          password: z.string().min(6),
          confirmPassword: z.string().min(6),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "passwordsMismatch",
          path: ["confirmPassword"],
        }),
    []
  );

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(data: z.infer<typeof registerSchema>) {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json();
      const key = API_ERRORS[body.error as string];
      setError(key ? t(key) : t("registrationFailed"));
      return;
    }

    router.push("/login");
  }

  const confirmError = form.formState.errors.confirmPassword?.message;

  return (
    <IdoPanel className="space-y-5">
      <div className="space-y-1 text-center">
        <p className="ido-eyebrow">{t("register")}</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">{t("createAccount")}</h1>
        <p className="text-sm text-[var(--muted-ink)]">{t("welcomeSubtitle")}</p>
      </div>

      <GoogleSignInButton enabled={googleEnabled} />

      <div className="relative text-center text-xs uppercase text-[var(--muted-ink)]">
        <span className="bg-[var(--panel)] px-3">{t("orEmail")}</span>
        <div className="absolute inset-x-0 top-1/2 -z-10 border-t border-[var(--stroke)]" />
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <label className="grid gap-1.5 font-semibold">
          {t("name")}
          <Input id="name" className="rounded-2xl border-[var(--stroke)] bg-white py-3" {...form.register("name")} />
        </label>
        <label className="grid gap-1.5 font-semibold">
          {t("email")}
          <Input id="email" type="email" className="rounded-2xl border-[var(--stroke)] bg-white py-3" {...form.register("email")} />
        </label>
        <label className="grid gap-1.5 font-semibold">
          {t("password")}
          <Input id="password" type="password" className="rounded-2xl border-[var(--stroke)] bg-white py-3" {...form.register("password")} />
        </label>
        <label className="grid gap-1.5 font-semibold">
          {t("confirmPassword")}
          <Input id="confirmPassword" type="password" className="rounded-2xl border-[var(--stroke)] bg-white py-3" {...form.register("confirmPassword")} />
          {confirmError === "passwordsMismatch" && (
            <span className="text-sm text-destructive">{t("passwordsMismatch")}</span>
          )}
        </label>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <IdoButton type="submit" wide disabled={loading} className="no-pulse">
          {loading ? tc("loading") : t("register")}
        </IdoButton>
      </form>

      <p className="text-center text-sm text-[var(--muted-ink)]">
        {t("hasAccount")}{" "}
        <Link href="/login" className="font-extrabold text-[var(--grass-deep)] underline">
          {t("login")}
        </Link>
      </p>
    </IdoPanel>
  );
}
