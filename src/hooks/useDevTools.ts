// hooks/useDevTools.ts
import { useEffect, useCallback } from 'react';
import { useElectron } from '@/hooks/useElectron';

export const useDevTools = () => {
  const { send, isElectron } = useElectron();

  // 切换控制台
  const toggleDevTools = useCallback((): void => {
    if (isElectron) {
      send('toggle-devtools');
    }
  }, [isElectron, send]);

  const handleKeyDown = useCallback((event: KeyboardEvent): void => {
    console.log(event);

    if (event.key === 'F12') {
      event.preventDefault();
      toggleDevTools();
    }
  }, [toggleDevTools]);

  // 监听快捷键
  useEffect(() => {
    if (!isElectron) return;

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isElectron, toggleDevTools]);

  return { toggleDevTools };
};