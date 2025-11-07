import {
  useNavigate,
  useLocation,
  type To,
  type NavigateOptions,
} from "react-router-dom";

// 路由状态类型
export interface RouterState {
  from?: string;
  [key: string]: any;
}

// useRouter 返回类型
export interface IUseRouterReturn {
  push: (
    path: To,
    state?: RouterState,
    options?: Omit<NavigateOptions, "state">
  ) => void;
  replace: (
    path: To,
    state?: RouterState,
    options?: Omit<NavigateOptions, "state">
  ) => void;
  goBack: () => void;
  goForward: () => void;
  pathname: string;
  state: RouterState | null;
  search: string;
  query: URLSearchParams;
  hash: string;
}

/**
 * 自定义路由Hook，提供类型安全的导航方法
 */
export const useRouter = (): IUseRouterReturn => {
  const navigate = useNavigate();
  const location = useLocation();

  const push = (
    path: To,
    state?: RouterState,
    options?: Omit<NavigateOptions, "state">
  ) => {
    navigate(path, { state, ...options });
  };

  const replace = (
    path: To,
    state?: RouterState,
    options?: Omit<NavigateOptions, "state">
  ) => {
    navigate(path, { replace: true, state, ...options });
  };

  const goBack = () => {
    navigate(-1);
  };

  const goForward = () => {
    navigate(1);
  };

  // 解析URL查询参数
  const query = new URLSearchParams(location.search);

  return {
    push,
    replace,
    goBack,
    goForward,
    pathname: location.pathname,
    state: location.state as RouterState | null,
    search: location.search,
    query,
    hash: location.hash,
  };
};
