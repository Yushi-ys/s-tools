import { create } from "zustand";
import type { StoreState } from "./type";
import { THEMESTYLE } from "../types/constants";

const useStore = create<StoreState>((set) => ({
  // 主题色
  theme: THEMESTYLE.LIGHT,
  setTheme: (theme: keyof typeof THEMESTYLE) => set(() => ({ theme }) ),
}))

export default useStore;