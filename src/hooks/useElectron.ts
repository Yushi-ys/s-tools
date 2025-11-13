import { useMemoizedFn } from "ahooks";
import { useEffect, useState, useRef } from "react";

interface IUseElectronReturn {
  isElectron: boolean;
  // 窗口控制
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;

  // 剪贴板监控
  startClipboardMonitoring: () => void;
  stopClipboardMonitoring: () => void;
  getClipboardText: () => Promise<string>;

  // 剪贴板事件
  onClipboardChange: (
    callback: (data: any) => void
  ) => (() => void) | undefined;

  // 数据库操作
  db: {
    getAllClipboardData: (limit?: number) => Promise<
      {
        update_at: string;
        id: string;
        json_data: any;
      }[]
    >;
    addClipboardData: (data: any) => Promise<any>;
    getClipboardCount: () => Promise<number>;
  };

  // 通用通信方法
  send: (channel: string, data?: any) => void;
  invoke: (channel: string, data?: any) => Promise<any>;
  on: (
    channel: string,
    callback: (data: any) => void
  ) => (() => void) | undefined;
  removeAllListeners: (channel: string) => void;
}

/**
 * 封装 Electron API 的 Hook
 */
export const useElectron = (): IUseElectronReturn => {
  const [isElectron, setIsElectron] = useState<boolean>(false);
  const listenerRefs = useRef<Map<string, Function>>(new Map());

  useEffect(() => {
    setIsElectron(!!window.electronAPI);
  }, []);

  // 窗口控制
  const minimizeWindow = useMemoizedFn(() => {
    window.electronAPI?.minimizeWindow();
  });

  const maximizeWindow = useMemoizedFn(() => {
    window.electronAPI?.maximizeWindow();
  });

  const closeWindow = useMemoizedFn(() => {
    window.electronAPI?.closeWindow();
  });

  // 剪贴板监控
  const startClipboardMonitoring = useMemoizedFn(() => {
    window.electronAPI?.startClipboardMonitoring();
  });

  const stopClipboardMonitoring = useMemoizedFn(() => {
    window.electronAPI?.stopClipboardMonitoring();
  });

  const getClipboardText = useMemoizedFn((): Promise<string> => {
    if (window.electronAPI) {
      return window.electronAPI.getClipboardText();
    }
    return Promise.resolve("");
  });

  // 剪贴板事件监听
  const onClipboardChange = useMemoizedFn(
    (callback: (data: any) => void): (() => void) | undefined => {
      if (window.electronAPI) {
        window.electronAPI.onClipboardChange(callback);

        // 返回清理函数
        return () => {
          window.electronAPI?.removeClipboardListeners();
        };
      }
      return undefined;
    }
  );

  // 数据库操作
  const db = {
    getAllClipboardData: useMemoizedFn((limit?: number): Promise<any[]> => {
      if (window.electronAPI?.db?.getAllClipboardData) {
        return window.electronAPI.db.getAllClipboardData(limit);
      }
      return Promise.resolve([]);
    }),

    addClipboardData: useMemoizedFn((data: any): Promise<any> => {
      if (window.electronAPI?.db?.addClipboardData) {
        return window.electronAPI.db.addClipboardData(data);
      }
      return Promise.resolve({ success: false, error: "Electron API 不可用" });
    }),

    getClipboardCount: useMemoizedFn((): Promise<number> => {
      if (window.electronAPI?.db?.getClipboardCount) {
        return window.electronAPI.db.getClipboardCount();
      }
      return Promise.resolve(0);
    }),
  };

  // 通用通信方法
  const send = useMemoizedFn((channel: string, data?: any) => {
    if (window.electronAPI) {
      window.electronAPI.send(channel, data);
    }
  });

  const invoke = useMemoizedFn(
    async (channel: string, data?: any): Promise<any> => {
      if (window.electronAPI) {
        return window.electronAPI.invoke(channel, data);
      }
      throw new Error("Electron API 不可用");
    }
  );

  const on = useMemoizedFn(
    (
      channel: string,
      callback: (data: any) => void
    ): (() => void) | undefined => {
      if (window.electronAPI) {
        const handler = (_: any, data: any) => callback(data);
        window.electronAPI.on(channel, handler);

        // 存储监听器引用以便清理
        listenerRefs.current.set(channel, handler);

        // 返回清理函数
        return () => {
          const handler = listenerRefs.current.get(channel);
          if (handler) {
            window.electronAPI?.removeAllListeners(channel);
            listenerRefs.current.delete(channel);
          }
        };
      }
      return undefined;
    }
  );

  const removeAllListeners = useMemoizedFn((channel: string) => {
    if (window.electronAPI) {
      window.electronAPI.removeAllListeners(channel);
      listenerRefs.current.delete(channel);
    }
  });

  // 组件卸载时清理所有监听器
  useEffect(() => {
    return () => {
      if (window.electronAPI) {
        for (const channel of listenerRefs.current.keys()) {
          window.electronAPI.removeAllListeners(channel);
        }
        listenerRefs.current.clear();
      }
    };
  });

  return {
    isElectron,
    // 窗口控制
    minimizeWindow,
    maximizeWindow,
    closeWindow,
    // 剪贴板监控
    startClipboardMonitoring,
    stopClipboardMonitoring,
    getClipboardText,
    // 剪贴板事件
    onClipboardChange,
    // 数据库操作
    db,
    // 通用通信方法
    send,
    invoke,
    on,
    removeAllListeners,
  };
};
