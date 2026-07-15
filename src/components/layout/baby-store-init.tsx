"use client";

import { useRef } from "react";
import { useBabyStore } from "@/stores/baby-store";
import type { Baby } from "@/types";

export function BabyStoreInit({ babies }: { babies: Baby[] }) {
  const initialized = useRef(false);

  if (!initialized.current && babies.length > 0) {
    const state = useBabyStore.getState();
    const selectedBabyId =
      state.selectedBabyId && babies.some((b) => b._id === state.selectedBabyId)
        ? state.selectedBabyId
        : babies[0]._id;

    useBabyStore.setState({ babies, selectedBabyId });
    initialized.current = true;
  }

  return null;
}
