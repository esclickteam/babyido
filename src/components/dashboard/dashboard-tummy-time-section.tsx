"use client";

import { TummyTimeTracker } from "@/components/tummy-time/tummy-time-tracker";

interface DashboardTummyTimeSectionProps {
  babyId: string;
}

export function DashboardTummyTimeSection({ babyId }: DashboardTummyTimeSectionProps) {
  return <TummyTimeTracker babyId={babyId} variant="dashboard" />;
}
