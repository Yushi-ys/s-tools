import type { ISettingData, TSettingDisplay } from "@/store/type";
import { Input } from "antd";
import { useEffect, useMemo, useState } from "react";

interface IProps {
  settings: ISettingData;
  onChangeFormState: (
    key: keyof ISettingData,
    value: TSettingDisplay | boolean | string
  ) => void;
}

export default function ShortKey({ settings, onChangeFormState }: IProps) {
  const [recording, setRecording] = useState(false);
  const [currentShortcut, setCurrentShortcut] = useState("");

  const showSortKey = useMemo(() => {
    if (recording) {
      return currentShortcut;
    }
    return settings.shortKey;
  }, [recording, currentShortcut, settings.shortKey]);

  // 开始录制快捷键
  const startRecording = async () => {
    try {
      // 通知主进程禁用全局快捷键
      await window.electronAPI.disableGlobalShortcuts();
      setRecording(true);
    } catch (error) {
      console.error("禁用快捷键失败:", error);
    }
  };

  // 停止录制快捷键
  const stopRecording = async () => {
    try {
      console.log("通知主进程更新快捷键", currentShortcut);
      setRecording(false);
      if (currentShortcut && currentShortcut.length > 0) {
        onChangeFormState("shortKey", currentShortcut);
        // 通知主进程重新启用全局快捷键
        await window.electronAPI.enableGlobalShortcuts(currentShortcut);
      } else {
        await window.electronAPI.enableGlobalShortcuts(settings.shortKey);
      }
    } catch (error) {
      console.error("启用快捷键失败:", error);
    }
  };

  useEffect(() => {
    if (!recording) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log("开始记录快捷键");
      e.preventDefault();
      e.stopPropagation();

      const keys = [];

      // 修饰键
      if (e.ctrlKey) keys.push("Control");
      if (e.altKey) keys.push("Alt");
      if (e.shiftKey) keys.push("Shift");
      if (e.metaKey) keys.push("Meta");

      // 排除修饰键本身
      if (!["Control", "Alt", "Shift", "Meta"].includes(e.key)) {
        if (e.key.startsWith("F") && e.key.length > 1) {
          keys.push(e.key);
        } else if (e.key === " ") {
          keys.push("Space");
        } else if (e.key.length === 1) {
          keys.push(e.key.toUpperCase());
        } else if (e.key.startsWith("Arrow")) {
          keys.push(e.key);
        } else {
          keys.push(e.key);
        }
      }

      if (keys.length > 0) {
        const shortcut = keys.join("+");
        console.log("shortcut", shortcut);
        setCurrentShortcut(shortcut);
      }
    };

    if (recording) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      console.log("移除记录");
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [recording]);

  return (
    <Input
      onFocus={startRecording}
      onBlur={stopRecording}
      placeholder="请在键盘上输入呼出快捷键"
      value={showSortKey}
    />
  );
}
