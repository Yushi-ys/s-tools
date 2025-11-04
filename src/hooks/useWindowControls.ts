import { useElectron } from './useElectron';

export const useWindowControls = () => {
  const { send } = useElectron();

  const minimize = () => send('window-minimize');
  const maximize = () => send('window-maximize');
  const close = () => send('window-close');

  return { minimize, maximize, close };
};