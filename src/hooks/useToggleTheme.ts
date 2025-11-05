import useStore from "../store/store";
import { THEMESTYLE } from "../types/constants";

interface UseToggleThemeReturn {
    theme: keyof typeof THEMESTYLE;
    toggleTheme: () => void;
}

export const useToggleTheme = (): UseToggleThemeReturn => {
    const { theme, setTheme } = useStore();

    const toggleTheme = (): void => {
        const htmlElement = document.documentElement;
        if (theme === THEMESTYLE.LIGHT) {
            setTheme(THEMESTYLE.DARK);
            htmlElement.setAttribute('data-theme', 'dark');
        } else {
            setTheme(THEMESTYLE.LIGHT);
            htmlElement.removeAttribute('data-theme');
        }
    };

    return {
        theme,
        toggleTheme
    };
};