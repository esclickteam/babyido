"use client";

import { useEffect, useState } from "react";
import { formatElapsedTimerHms, getElapsedMs } from "@/utils/sleep";

export interface LiveTimerState {
  label: string;
  elapsedMs: number;
  elapsedSeconds: number;
}

const IDLE: LiveTimerState = { label: "0:00:00", elapsedMs: 0, elapsedSeconds: 0 };

/** Smooth live timer — ticks from 0:00:00 with second precision. */
export function useLiveTimer(startTime: string | null | undefined): LiveTimerState {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startTime) return;

    setNow(Date.now());
    let raf = 0;
    let lastSecond = -1;

    const tick = () => {
      const t = Date.now();
      const second = Math.floor(getElapsedMs(startTime, t) / 1000);
      if (second !== lastSecond) {
        lastSecond = second;
        setNow(t);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [startTime]);

  if (!startTime) return IDLE;

  const elapsedMs = getElapsedMs(startTime, now);
  return {
    label: formatElapsedTimerHms(startTime, now),
    elapsedMs,
    elapsedSeconds: Math.floor(elapsedMs / 1000),
  };
}
