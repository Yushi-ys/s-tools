import useStore from "@/store/store";
import { useEffect } from "react";

export const useAutoStart = () => {
  const { settings } = useStore();
  const { autoStart } = settings;

  useEffect(() => {
    console.log("开机自启动", autoStart);
    if (!!autoStart) {
      window.electronAPI.settings.autoStart.enableAutoStart();
    } else {
      window.electronAPI.settings.autoStart.disableAutoStart();
    }
  }, [autoStart]);
};
