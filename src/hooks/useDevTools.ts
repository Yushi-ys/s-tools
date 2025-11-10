// hooks/useDevTools.ts
import { useEffect, useCallback } from "react";
import { useElectron } from "@/hooks/useElectron";

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
  const toggleDevTools = useCallback((): void => {
    if (isElectron) {
      send("toggle-devtools");
    }
  }, [isElectron, send]);

  const handleKeyDown = useCallback(
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
    },
    [toggleDevTools]
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
