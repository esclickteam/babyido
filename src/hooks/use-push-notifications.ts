"use client";

import { useCallback, useEffect, useState } from "react";

type PushStatus = "loading" | "unsupported" | "disabled" | "prompt" | "enabled" | "denied";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length) as Uint8Array<ArrayBuffer>;
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>("loading");

  const checkStatus = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setStatus("unsupported");
      return;
    }

    const config = await fetch("/api/push/vapid-public-key").then((r) => r.json());
    if (!config.enabled || !config.publicKey) {
      setStatus("disabled");
      return;
    }

    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }

    const reg = await navigator.serviceWorker.getRegistration("/sw.js");
    const existing = reg ? await reg.pushManager.getSubscription() : null;
    setStatus(existing ? "enabled" : Notification.permission === "granted" ? "prompt" : "prompt");
  }, []);

  useEffect(() => {
    void checkStatus();
  }, [checkStatus]);

  const enable = useCallback(async (): Promise<boolean> => {
    if (status === "unsupported" || status === "disabled") return false;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setStatus("denied");
      return false;
    }

    const config = await fetch("/api/push/vapid-public-key").then((r) => r.json());
    if (!config.enabled || !config.publicKey) {
      setStatus("disabled");
      return false;
    }

    const reg = await navigator.serviceWorker.register("/sw.js");
    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(config.publicKey),
      });
    }

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription.toJSON()),
    });

    setStatus("enabled");
    return true;
  }, [status]);

  const disable = useCallback(async () => {
    const reg = await navigator.serviceWorker.getRegistration("/sw.js");
    const subscription = reg ? await reg.pushManager.getSubscription() : null;
    if (subscription) {
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      await subscription.unsubscribe();
    }
    setStatus("prompt");
  }, []);

  return { status, enable, disable, refresh: checkStatus };
}
