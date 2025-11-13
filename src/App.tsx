import { useEffect } from "react";
import Navigation from "@/layout/Navigation";
import Layout from "@/layout";
import { useDevTools } from "@/hooks/useDevTools";
import { useElectronClipboard } from "@/hooks/useElectronClipboard";
import { useGetAllSqlData } from "@/hooks/useGetAllSqlData";
import { useBeforeWindowClose } from "@/hooks/useBeforeWindowClose";
import useStore from "@/store/store";
import { Spin } from "antd";

import "./App.css";

function App() {
  const { isElectron, startMonitoring, stopMonitoring } =
    useElectronClipboard();
  const {
    closeWindowLoading,
  } = useStore();

  useDevTools();

  useGetAllSqlData();

  useBeforeWindowClose()

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
    <div style={{ overflow: "hidden" }}>
      <Navigation />
      <Spin spinning={closeWindowLoading} tip="正在保存数据...">
        <Layout />
      </Spin>
    </div>
  );
}

export default App;
