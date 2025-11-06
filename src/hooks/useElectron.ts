import { useEffect, useCallback, useState } from 'react';

interface IUseElectronReturn {
  isElectron: boolean;
  send: (channel: string, data?: any) => void;
  invoke: (channel: string, data?: any) => Promise<any>;
  on: (channel: string, callback: (data: any) => void) => (() => void) | undefined;
}

export const useElectron = (): IUseElectronReturn => {
  const [isElectron, setIsElectron] = useState<boolean>(false);

  useEffect(() => {
    setIsElectron(!!window.electronAPI);
  }, []);

  const send = useCallback((channel: string, data?: any) => {
    if (window.electronAPI) {
      window.electronAPI.send(channel, data);
    }
  }, []);

  const invoke = useCallback(async (channel: string, data?: any): Promise<any> => {
    if (window.electronAPI) {
      return window.electronAPI.invoke(channel, data);
    }
    throw new Error('Electron API 不可用');
  }, []);

  const on = useCallback((channel: string, callback: (data: any) => void): (() => void) | undefined => {
    if (window.electronAPI) {
      const handler = (event: any, data: any) => callback(data);
      window.electronAPI.on(channel, handler);

      // 返回清理函数
      return () => {
        window.electronAPI?.removeAllListeners(channel);
      };
    }
    return undefined;
  }, []);

  return {
    isElectron,
    send,
    invoke,
    on
  };
};