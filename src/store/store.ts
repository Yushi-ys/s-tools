import { create } from "zustand";
import type { StoreState } from "./type";
import { THEMESTYLE } from "../types/constants";
import type { IClipboardItem } from "@/hooks/useAdvancedClipboard";

const useStore = create<StoreState>((set) => ({
  // 主题色
  theme: THEMESTYLE.LIGHT,
  setTheme: (theme: keyof typeof THEMESTYLE) => set(() => ({ theme })),
  clipBoradData: [],
  setclipBoradData: (data: IClipboardItem[]) =>
    set(() => ({ clipBoradData: data })),
  diffData: {
    leftContent: "",
    rightContent: "",
  },
  setDiffData: (newVal: { leftContent: string; rightContent: string }) =>
    set(() => ({ diffData: newVal })),
  translationData: {
    originalText: "",
    translatedText: "",
    originalLanguage: "zh",
    translatedlLanguage: "en",
  },
  setTranslationData: (newVal: {
    originalText: string;
    translatedText: string;
    originalLanguage: string;
    translatedlLanguage: string;
  }) => set(() => ({ translationData: newVal })),
}));

export default useStore;
