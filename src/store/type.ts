import type { THEMESTYLE } from "../types/constants";

export interface StoreState {
    theme: keyof typeof THEMESTYLE;
    setTheme: (theme: keyof typeof THEMESTYLE) => void;
}