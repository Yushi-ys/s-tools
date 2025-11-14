import { create } from "zustand";
import type {
  IDiffData,
  ITranslationData,
  IUuidData,
  StoreState,
} from "./type";
import { THEMESTYLE } from "@/types/constants";
import type { IClipboardItem } from "@/hooks/useAdvancedClipboard";

const useStore = create<StoreState>((set) => ({
  // 关闭项目的时候的loading，存数据到本地的sql中使用
  closeWindowLoading: false,
  setCloseWindowLoading: (closeWindowLoading: boolean) =>
    set(() => ({ closeWindowLoading })),

  // 主题色
  theme: THEMESTYLE.LIGHT,
  setTheme: (theme: keyof typeof THEMESTYLE) => set(() => ({ theme })),

  // 剪切板相关
  clipBoradData: [],
  setClipBoradData: (data: IClipboardItem[]) =>
    set(() => ({ clipBoradData: data })),
  clipBoradDataLoading: false,
  setClipBoradDataLoading: (newVal: boolean) =>
    set(() => ({ clipBoradDataLoading: newVal })),

  // uuid相关
  uuidData: {
    uuids: [],
    character_length: 10,
    generation_rules: "only_num",
    sum: 1,
  },
  setUuidData: (newVal: IUuidData) => set(() => ({ uuidData: newVal })),

  // diff相关
  diffData: {
    leftContent: "",
    rightContent: "",
  },
  setDiffData: (newVal: IDiffData) => set(() => ({ diffData: newVal })),

  // 翻译相关
  translationData: {
    originalText: "",
    translatedText: "",
    originalLanguage: "zh",
    translatedlLanguage: "en",
  },
  setTranslationData: (newVal: ITranslationData) =>
    set(() => ({ translationData: newVal })),
}));

export default useStore;
