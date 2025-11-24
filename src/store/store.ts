import { create } from "zustand";
import type {
  IDiffData,
  IHomeData,
  ISettingData,
  ITranslationData,
  IUuidData,
  StoreState,
} from "./type";
import { THEMESTYLE } from "@/types/constants";
import type { IClipboardItem } from "@/hooks/useAdvancedClipboard";

const getDefaultShortKey = () => {
  if (typeof window !== "undefined" && window.electronAPI.platform) {
    return window.electronAPI.platform === "darwin" ? "Command+1" : "Alt+1";
  }
  return "Alt+1";
};

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
  clipBoradFirstRender: true,
  setClipBoradFirstRender: (newVal: boolean) =>
    set(() => ({ clipBoradFirstRender: newVal })),
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

  // 设置相关
  settings: {
    autoStart: false,
    shortKey: getDefaultShortKey(),
  },
  setSettings: (newVal: ISettingData) => set(() => ({ settings: newVal })),
  settingsLoading: false,
  setSettingsLoading: (newVal: boolean) =>
    set(() => ({ settingsLoading: newVal })),

  // 主页的数据
  homeData: {
    monthlySalary: 0,
    workDaysPerMonth: 0,
    todayEarnings: 0,
    // 新增默认值
    workStartTime: "09:00",
    workEndTime: "18:00",
    lunchBreakStart: "12:00",
    lunchBreakEnd: "13:00",
  },
  setHomeData: (newVal: IHomeData | ((prev: IHomeData) => IHomeData)) =>
    set((state) => ({
      homeData: typeof newVal === "function" ? newVal(state.homeData) : newVal,
    })),
}));

export default useStore;
