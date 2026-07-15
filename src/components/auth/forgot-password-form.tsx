"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { IdoButton } from "@/components/idoland/ido-button";
import { IdoPanel } from "@/components/idoland/ido-panel";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <IdoPanel className="space-y-5">
      <div className="space-y-1 text-center">
        <p className="ido-eyebrow">{t("forgotPassword")}</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">{t("resetPassword")}</h1>
        <p className="text-sm text-[var(--muted-ink)]">{t("resetPasswordDesc")}</p>
      </div>

      {sent ? (
        <p className="text-center text-sm text-[var(--muted-ink)]">{t("resetPasswordDesc")}</p>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="grid gap-1.5 font-semibold">
            {t("email")}
            <Input id="email" type="email" required className="rounded-2xl border-[var(--stroke)] bg-white py-3" />
          </label>
          <IdoButton type="submit" wide className="no-pulse">
            {t("resetPassword")}
          </IdoButton>
        </form>
      )}

      <p className="text-center text-sm">
        <Link href="/login" className="font-extrabold text-[var(--grass-deep)] underline">
          {t("login")}
        </Link>
      </p>
    </IdoPanel>
  );
}
