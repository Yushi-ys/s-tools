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

export type TSettingDisplay = "full_screen" | "window";
export interface ISettingData {
  display: TSettingDisplay;
  autoStart: boolean;
  shortKey: string;
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
}
