import type { IClipboardItem } from "@/hooks/useAdvancedClipboard";
import type { THEMESTYLE } from "@/types/constants";

export interface StoreState {
  theme: keyof typeof THEMESTYLE;
  setTheme: (theme: keyof typeof THEMESTYLE) => void;
  clipBoradData: IClipboardItem[];
  setclipBoradData: (data: IClipboardItem[]) => void;
  diffData: {
    leftContent: string;
    rightContent: string;
  };
  setDiffData: (newVal: { leftContent: string; rightContent: string }) => void;
  translationData: {
    originalText: string;
    translatedText: string;
    originalLanguage: string;
    translatedlLanguage: string;
  };
  setTranslationData: (newVal: {
    originalText: string;
    translatedText: string;
    originalLanguage: string;
    translatedlLanguage: string;
  }) => void;
}
