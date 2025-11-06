import { useElectron } from '@/hooks/useElectron';

// 定义返回值类型
interface IWindowControlsReturn {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

/**
 * 封装窗口控制的 Hook
 * @returns 
 */
export const useWindowControls = (): IWindowControlsReturn => {
  const { send } = useElectron();

  const minimize = (): void => send('window-minimize');
  const maximize = (): void => send('window-maximize');
  const close = (): void => send('window-close');

  return { minimize, maximize, close };
};