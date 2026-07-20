"use client";

import { Bell, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { Button } from "@/components/ui/button";

export function PushNotificationsToggle() {
  const t = useTranslations("settings");
  const { status, enable, disable } = usePushNotifications();

  async function handleEnable() {
    const ok = await enable();
    if (ok) toast.success(t("pushEnabled"));
    else if (status === "denied") toast.error(t("pushDenied"));
    else if (status === "disabled") toast.error(t("pushNotConfigured"));
    else toast.error(t("pushFailed"));
  }

  async function handleDisable() {
    await disable();
    toast.success(t("pushDisabled"));
  }

  if (status === "loading") return null;

  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 items-center justify-center rounded-xl bg-violet-50">
        <Smartphone className="size-5 text-violet-600" />
      </div>
      <div className="flex-1 space-y-2">
        <div>
          <p className="font-bold">{t("pushNotifications")}</p>
          <p className="text-sm text-muted-foreground">{t("pushNotificationsHint")}</p>
        </div>
        {status === "unsupported" && (
          <p className="text-xs text-muted-foreground">{t("pushUnsupported")}</p>
        )}
        {status === "disabled" && (
          <p className="text-xs text-muted-foreground">{t("pushNotConfigured")}</p>
        )}
        {status === "denied" && (
          <p className="text-xs text-amber-700">{t("pushDenied")}</p>
        )}
        {status !== "unsupported" && status !== "disabled" && status !== "enabled" && (
          <Button type="button" className="rounded-xl gap-2" onClick={() => void handleEnable()}>
            <Bell className="size-4" />
            {t("enablePush")}
          </Button>
        )}
        {status === "enabled" && (
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => void handleDisable()}>
            {t("disablePush")}
          </Button>
        )}
      </div>
    </div>
  );
}
