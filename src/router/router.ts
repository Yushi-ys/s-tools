import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "@/App";

// 页面组件懒加载
const Clipboard = lazy(() => import("@/views/Clipboard"));
const Uuid = lazy(() => import("@/views/Uuid"));
const Diff = lazy(() => import("@/views/Diff"));
const Translation = lazy(() => import("@/views/Translation"));

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        index: true, // 设置为默认路由
        Component: Clipboard,
      },
      {
        path: "clipboard",
        Component: Clipboard,
      },
      {
        path: "uuid",
        Component: Uuid,
      },
      {
        path: "diff",
        Component: Diff,
      },
      {
        path: "translation",
        Component: Translation,
      },
    ],
  },
]);
