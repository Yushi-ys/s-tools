import type { IClipboardItem } from "@/hooks/useAdvancedClipboard";
import type { THEMESTYLE } from "@/types/constants";

export interface StoreState {
    theme: keyof typeof THEMESTYLE;
    setTheme: (theme: keyof typeof THEMESTYLE) => void;
    clipBoradData: IClipboardItem[];
    setclipBoradData: (data: IClipboardItem[]) => void;
}