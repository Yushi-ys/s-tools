export interface IElectronAPI {
  // 窗口操作
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  
  // 自定义事件
  on: (channel: string, callback: (event: any, data: any) => void) => void;
  send: (channel: string, data?: any) => void;
  invoke: (channel: string, data?: any) => Promise<any>;

  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}