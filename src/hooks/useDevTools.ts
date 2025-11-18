import { useEffect } from "react";
import { useElectron } from "@/hooks/useElectron";
import { useMemoizedFn } from "ahooks";
import { isDev } from "@/utils";

interface IUseDevToolsReturn {
  toggleDevTools: () => void;
}

/**
 * 快捷键打开/关闭开发者工具
 * @returns
 */
export const useDevTools = (): IUseDevToolsReturn => {
  const { send, isElectron } = useElectron();

  // 切换控制台
  const toggleDevTools = useMemoizedFn((): void => {
    if (isElectron) {
      send("toggle-devtools");
    }
  });

  const handleKeyDown = useMemoizedFn(
    (event: KeyboardEvent): void => {      
      if (event.key === "F12") {
        event.preventDefault();
        toggleDevTools();
      }

      if (event.key === "F11" || event.code === "122") {
        // 阻止默认的全屏行为，顺带就写在这个hook里了
        event.preventDefault();
      }

      if (event.key === "Control" || event.code === "KeyR") {
        event.preventDefault();
      }
    }
  );

  // 监听快捷键
  useEffect(() => {
    if (!isElectron) return;

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isElectron, toggleDevTools]);

  return { toggleDevTools };
};
