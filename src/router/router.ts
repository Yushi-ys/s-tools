// src/router/router.ts
import { createBrowserRouter } from 'react-router-dom';
import Clipboard from '@/View/Clipboard';
import App from '@/App';

// 页面组件懒加载
// const Home = lazy(() => import('@/pages/Home'));

export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      {
        path: 'clipboard',
        Component: Clipboard,
      }
    ],
  },
]);