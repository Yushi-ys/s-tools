import type { IClipboardItem } from "@/hooks/useAdvancedClipboard";
import type { THEMESTYLE } from "@/types/constants";

export interface IUuidData {
  uuids: string[];
  character_length: number;
  generation_rules: "only_num" | "only_letter" | "num_letter";
  sum: number;
}

export interface IDiffData {
  leftContent: string;
  rightContent: string;
}

export interface ITranslationData {
  originalText: string;
  translatedText: string;
  originalLanguage: string;
  translatedlLanguage: string;
}

export interface ISettingData {
  autoStart: boolean;
  shortKey: string;
}

// store/type.ts
export interface IHomeData {
  monthlySalary: number;
  workDaysPerMonth: number;
  todayEarnings: number;
  // 新增字段
  workStartTime: string;    // 上班时间，格式 "09:00"
  workEndTime: string;      // 下班时间，格式 "18:00" 
  lunchBreakStart: string;  // 午休开始时间，格式 "12:00"
  lunchBreakEnd: string;    // 午休结束时间，格式 "13:00"
}
export interface StoreState {
  closeWindowLoading: boolean;
  setCloseWindowLoading: (closeWindowLoading: boolean) => void;
  theme: keyof typeof THEMESTYLE;
  setTheme: (theme: keyof typeof THEMESTYLE) => void;
  clipBoradData: IClipboardItem[];
  clipBoradFirstRender: boolean;
  setClipBoradFirstRender: (newVal: boolean) => void;
  setClipBoradData: (data: IClipboardItem[]) => void;
  clipBoradDataLoading: boolean;
  setClipBoradDataLoading: (newVal: boolean) => void;
  uuidData: IUuidData;
  setUuidData: (newVal: IUuidData) => void;
  diffData: IDiffData;
  setDiffData: (newVal: IDiffData) => void;
  translationData: ITranslationData;
  setTranslationData: (newVal: ITranslationData) => void;
  settings: ISettingData;
  setSettings: (newVal: ISettingData) => void;
  settingsLoading: boolean;
  setSettingsLoading: (newVal: boolean) => void;
  homeData: IHomeData;
  setHomeData: (newVal: IHomeData | ((prev: IHomeData) => IHomeData)) => void;
}
