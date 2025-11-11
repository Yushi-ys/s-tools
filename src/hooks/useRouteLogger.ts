import { Logger } from "@/utils";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const routeConfig = {
  "/clipboard": "剪贴板工具",
  "/uuid": "UUID生成器",
  "/diff": "文本对比工具",
};

/**
 * 路由变化，记录日志
 */
export const useRouteLogger = () => {
  const location = useLocation();

  useEffect(() => {
    const pageName =
      routeConfig[location.pathname as keyof typeof routeConfig] || "未知页面";

    Logger("页面路由变化", {
      event: "route_change",
      from: document.referrer || "直接访问",
      to: location.pathname,
      pageName: pageName,
      fullUrl: window.location.href,
    });
  }, [location.pathname]);
};
