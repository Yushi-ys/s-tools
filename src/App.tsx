import { useEffect } from "react";
import Navigation from "@/layout/Navigation";
import Layout from "@/layout";
import AiPage from "@/views/Ai";
import { useDevTools } from "@/hooks/useDevTools";
import { useElectronClipboard } from "@/hooks/useElectronClipboard";
import { useGetAllSqlData } from "@/hooks/useGetAllSqlData";
import { useBeforeWindowCloseSave } from "@/hooks/useBeforeWindowCloseSave";
import useStore from "@/store/store";
import { ConfigProvider, Spin } from "antd";
import zh_CN from "antd/es/locale/zh_CN";

import "./App.css";

function App() {
  const { isElectron, startMonitoring, stopMonitoring } =
    useElectronClipboard();
  const { closeWindowLoading } = useStore();

  useDevTools();

  useGetAllSqlData();

  useBeforeWindowCloseSave();

  /**
   * 监听复制事件
   */
  useEffect(() => {
    if (isElectron) {
      startMonitoring();
      return () => {
        stopMonitoring();
      };
    }
  }, [isElectron, startMonitoring, stopMonitoring]);

  return (
    <ConfigProvider locale={zh_CN}>
      <div style={{ overflow: "hidden" }}>
        <Navigation />
        <Spin spinning={closeWindowLoading} tip="正在保存数据...">
          <Layout />
        </Spin>
        <AiPage />
      </div>
    </ConfigProvider>
  );
}

export default App;
