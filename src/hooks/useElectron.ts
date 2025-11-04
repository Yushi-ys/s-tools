import { useEffect, useCallback, useState } from 'react';

export const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    setIsElectron(!!window.electronAPI);
  }, []);

  const send = useCallback((channel: string, data?: any) => {
    if (window.electronAPI) {
      window.electronAPI.send(channel, data);
    }
  }, []);

  const invoke = useCallback(async (channel: string, data?: any) => {
    if (window.electronAPI) {
      return window.electronAPI.invoke(channel, data);
    }
    throw new Error('Electron API 不可用');
  }, []);

  const on = useCallback((channel: string, callback: (data: any) => void) => {
    if (window.electronAPI) {
      const handler = (event: any, data: any) => callback(data);
      window.electronAPI.on(channel, handler);
      
      // 返回清理函数
      return () => {
        window.electronAPI.removeAllListeners(channel);
      };
    }
  }, []);

  return {
    isElectron,
    send,
    invoke,
    on
  };
};