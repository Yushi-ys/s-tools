import { useState, useEffect } from "react";
import useStore from "@/store/store";
import type { IClipboardItem } from "@/hooks/useAdvancedClipboard";
import { useMemoizedFn } from "ahooks";

export const useElectronClipboard = () => {
  const { setClipBoradData, clipBoradData } = useStore();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [firstRender, setFirstRender] = useState(true);

  const isElectron = useMemoizedFn(() => {
    return !!(window && (window as any).electronAPI);
  });

  // 处理从 Electron 主进程传来的剪贴板数据
  const handleClipboardChange = useMemoizedFn((data: IClipboardItem) => {
    // app 启动的时候，会读取数据库的本地剪切板数据，但是本地数据库的第一条数据 和 系统读取到的目前剪切板第一条是重复的，不需要追加上去
    if (firstRender && clipBoradData.length > 0) {
      setFirstRender(false);
      return;
    }
    if (data.type === "text" && data.text && data.text.trim().length !== 0) {
      const newItem = {
        type: data.type,
        data: data.text,
        blob: new Blob([data.text], { type: "text/plain" }),
        timestamp: data.timestamp,
      };

      // 添加到 store，避免重复数据
      const isDuplicate = clipBoradData.some(
        (item) =>
          item.data === data.text &&
          item.timestamp &&
          Date.now() - item.timestamp < 1000 // 1秒内的重复数据
      );

      if (!isDuplicate) {
        setClipBoradData([newItem, ...clipBoradData]);
      }
    } else if (data.type === "image" && data.image) {
      // 处理图片数据
      const newItem = {
        type: data.type,
        data: data.image, // base64 数据
        preview: data.image, // 用于直接显示
        width: data.width,
        height: data.height,
        blob: null, // 可以稍后转换为 blob
        timestamp: data.timestamp,
      } as IClipboardItem;

      // 检查重复数据 - 比较时间戳和尺寸
      const isDuplicate = clipBoradData.some(
        (item) =>
          item.type === "image" &&
          item.width === data.width &&
          item.height === data.height &&
          item.timestamp &&
          Date.now() - item.timestamp < 1000
      );

      if (!isDuplicate) {
        if (data.image.startsWith("data:image")) {
          setClipBoradData([newItem, ...clipBoradData]);
        }
      }
    } else {
    }
  });

  // 开始监控
  const startMonitoring = useMemoizedFn(() => {
    if (!isElectron()) {
      return false;
    }

    try {
      const { electronAPI } = window as any;

      // 设置监听器
      electronAPI.onClipboardChange(handleClipboardChange);

      // 开始监控
      electronAPI.startClipboardMonitoring();

      setIsMonitoring(true);
      return true;
    } catch (error) {
      return false;
    }
  });

  // 停止监控
  const stopMonitoring = useMemoizedFn(() => {
    if (!isElectron()) return;

    try {
      const { electronAPI } = window as any;
      electronAPI.stopClipboardMonitoring();
      electronAPI.removeClipboardListeners();
      setIsMonitoring(false);
    } catch (error) {
      return;
    }
  });

  // 获取当前剪贴板内容
  const getCurrentClipboard = useMemoizedFn(async (): Promise<string> => {
    if (!isElectron()) return "";

    try {
      const { electronAPI } = window as any;
      return await electronAPI.getClipboardText();
    } catch (error) {
      return "";
    }
  });

  // 组件卸载时停止监控
  useEffect(() => {
    return () => {
      if (isElectron()) {
        stopMonitoring();
      }
    };
  }, [isElectron, stopMonitoring]);

  return {
    isElectron: isElectron(),
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getCurrentClipboard,
  };
};
