import useStore from "@/store/store";
import { THEMESTYLE } from "@/types/constants";

interface IUseToggleThemeReturn {
  theme: keyof typeof THEMESTYLE;
  toggleTheme: () => void;
}

/**
 * 切换主题
 * @returns
 */
export const useToggleTheme = (): IUseToggleThemeReturn => {
  const { theme, setTheme } = useStore();

  const toggleTheme = (): void => {
    const htmlElement = document.documentElement;
    if (theme === THEMESTYLE.LIGHT) {
      setTheme(THEMESTYLE.DARK);
      htmlElement.setAttribute("data-theme", "dark");
    } else {
      setTheme(THEMESTYLE.LIGHT);
      htmlElement.removeAttribute("data-theme");
    }
  };

  return {
    theme,
    toggleTheme,
  };
};
