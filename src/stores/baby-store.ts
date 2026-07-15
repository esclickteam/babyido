import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Baby } from "@/types";

interface BabyStore {
  babies: Baby[];
  selectedBabyId: string | null;
  setBabies: (babies: Baby[]) => void;
  selectBaby: (id: string) => void;
  addBaby: (baby: Baby) => void;
  updateBaby: (baby: Baby) => void;
  removeBaby: (id: string) => void;
  getSelectedBaby: () => Baby | null;
}

export const useBabyStore = create<BabyStore>()(
  persist(
    (set, get) => ({
      babies: [],
      selectedBabyId: null,
      setBabies: (babies) =>
        set((state) => ({
          babies,
          selectedBabyId:
            state.selectedBabyId && babies.some((b) => b._id === state.selectedBabyId)
              ? state.selectedBabyId
              : babies[0]?._id ?? null,
        })),
      selectBaby: (id) => set({ selectedBabyId: id }),
      addBaby: (baby) =>
        set((state) => ({
          babies: [...state.babies, baby],
          selectedBabyId: state.selectedBabyId ?? baby._id,
        })),
      updateBaby: (baby) =>
        set((state) => ({
          babies: state.babies.map((b) => (b._id === baby._id ? baby : b)),
        })),
      removeBaby: (id) =>
        set((state) => {
          const babies = state.babies.filter((b) => b._id !== id);
          return {
            babies,
            selectedBabyId:
              state.selectedBabyId === id ? babies[0]?._id ?? null : state.selectedBabyId,
          };
        }),
      getSelectedBaby: () => {
        const { babies, selectedBabyId } = get();
        return babies.find((b) => b._id === selectedBabyId) ?? babies[0] ?? null;
      },
    }),
    {
      name: "babydo-baby-store",
      partialize: (state) => ({ selectedBabyId: state.selectedBabyId }),
    }
  )
);
