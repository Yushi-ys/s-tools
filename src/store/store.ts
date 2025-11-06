import { create } from "zustand";
import type { StoreState } from "./type";
import { THEMESTYLE } from "../types/constants";
import type { IClipboardItem } from "@/hooks/useAdvancedClipboard";

const useStore = create<StoreState>((set) => ({
  // 主题色
  theme: THEMESTYLE.LIGHT,
  setTheme: (theme: keyof typeof THEMESTYLE) => set(() => ({ theme }) ),
  clipBoradData: [],
  setclipBoradData: (data: IClipboardItem[]) => set(() => ({ clipBoradData: data })),
}))

export default useStore;