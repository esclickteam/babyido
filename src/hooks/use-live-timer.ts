"use client";

import { useEffect, useState } from "react";
import { formatElapsedTimerHms } from "@/utils/sleep";

/** Ticks every second while a session is active. */
export function useLiveTimer(startTime: string | null | undefined): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startTime) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startTime]);

  return startTime ? formatElapsedTimerHms(startTime, now) : "0:00:00";
}
