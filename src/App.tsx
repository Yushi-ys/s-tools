import { useEffect } from "react";
import Navigation from "@/layout/Navigation";
import Layout from "@/layout";
import { useDevTools } from "@/hooks/useDevTools";
import { useElectronClipboard } from "@/hooks/useElectronClipboard";
import { useElectron } from "@/hooks/useElectron";
import useStore from "@/store/store";
import { Spin } from "antd";

import "./App.css";

// App.tsx - 修改关闭处理
function App() {
  const { isElectron, startMonitoring, stopMonitoring } =
    useElectronClipboard();
  const { on, invoke, db, send } = useElectron();
  const {
    closeWindowLoading,
    setCloseWindowLoading,
    clipBoradData,
    setClipBoradData,
    setClipBoradDataLoading,
  } = useStore();

  useDevTools();

  const getLocalClipBoardData = async () => {
    setClipBoradDataLoading(true);
    try {
      const res = await db.getAllClipboardData(1000);
      setClipBoradData(res.map((item) => item.json_data));
      setClipBoradDataLoading(false);
    } catch (error) {
      console.error("获取数据失败:", error);
    }
  };

  useEffect(() => {
    if (isElectron) {
      // Electron
      startMonitoring();

      return () => {
        stopMonitoring();
      };
    }
  }, [isElectron, startMonitoring, stopMonitoring]);

  useEffect(() => {
    on("toggle-window-loading-changed", async () => {
      console.log("开始保存数据到数据库");
      setCloseWindowLoading(true);

      try {
        /**
         * 保存 clipBoradData
         */
        const promises = clipBoradData
          .filter((item) => !item.inDb)
          .map((item) =>
            db.addClipboardData({
              ...item,
              inDb: true,
            })
          );
        await Promise.all(promises); // 等待所有 IPC 调用完成

        console.log("保存数据成功");
        send("save-data-complete");
      } catch (error) {
        console.error("保存数据失败:", error);
        // 即使失败也关闭窗口
        send("save-data-complete");
      }
    });
  }, [on, invoke, setCloseWindowLoading, clipBoradData]);

  useEffect(() => {
    getLocalClipBoardData();
  }, []);

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
