// electron.d.ts 或 global.d.ts
export interface ClipboardData {
  type: "text" | "image";
  text?: string;
  image?: string;
  width?: number;
  height?: number;
  timestamp: number;
}

export interface DatabaseResult {
  success: boolean;
  id?: number;
  changes?: number;
  error?: string;
}
type Platform =
  | "aix"
  | "android"
  | "darwin"
  | "freebsd"
  | "haiku"
  | "linux"
  | "openbsd"
  | "sunos"
  | "win32"
  | "cygwin"
  | "netbsd";

export interface IElectronAPI {
  platform: Platform;
  // 窗口控制
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;

  // 剪贴板监控
  startClipboardMonitoring: () => void;
  stopClipboardMonitoring: () => void;
  getClipboardText: () => Promise<string>;

  // 剪贴板事件监听
  onClipboardChange: (callback: (data: ClipboardData) => void) => void;
  removeClipboardListeners: () => void;

  // 通用通信方法
  on: (channel: string, callback: (event: any, data: any) => void) => void;
  send: (channel: string, data?: any) => void;
  invoke: <T = any>(channel: string, data?: any) => Promise<T>;
  removeAllListeners: (channel: string) => void;

  // 数据库操作
  db: {
    // 剪贴板数据
    getAllClipboardData: (limit?: number) => Promise<ClipboardData[]>;
    addClipboardData: (data: ClipboardData) => Promise<DatabaseResult>;
    getClipboardCount: () => Promise<number>;

    // 系统设置
    getSystemSetting: () => Promise<SystemSettingRecord | null>;
    updateSystemSetting: (data: SystemSettings) => Promise<DatabaseResult>;
    updateSystemSettingField: (
      updates: Partial<SystemSettings>
    ) => Promise<DatabaseResult>;
    initializeSystemSetting: (
      defaultConfig?: Partial<SystemSettings>
    ) => Promise<DatabaseResult>;
    deleteSystemSetting: () => Promise<DatabaseResult>;
  };

  settings: {
    autoStart: {
      enableAutoStart: () => Promise<void>;
      disableAutoStart: () => Promise<void>;
      checkAutoStartStatus: () => Promise<void>;
    };
    shortCuts: {
      // 禁用全局快捷键
      disableGlobalShortcuts: () => Promise<void>;
      // 启用全局快捷键
      enableGlobalShortcuts: (data: string) => Promise<void>;
    };
  };
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
