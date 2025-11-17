import { useEffect } from "react";
import { useElectron } from "@/hooks/useElectron";
import useStore from "@/store/store";

/**
 * 监听退出程序之前事件，保存本地store的一些数据进入本地数据库
 */
export const useBeforeWindowClose = () => {
    const { on, invoke, db, send } = useElectron();
    const {
        setCloseWindowLoading,
        clipBoradData,
    } = useStore();

    useEffect(() => {
        on("toggle-window-loading-changed", async () => {
            console.log("开始保存数据到数据库");
            setCloseWindowLoading(true);

            try {
                /**
                 * 保存 clipBoradData
                 * inDb 表示已经存入过数据库
                 */
                const save_clipBoardData_promises = clipBoradData
                    .filter((item) => !item.inDb)
                    .map((item) =>
                        db.addClipboardData({
                            ...item,
                            inDb: true,
                        })
                    );
                await Promise.all(save_clipBoardData_promises); // 等待所有 IPC 调用完成

                console.log("保存数据成功");
                send("save-data-complete");
            } catch (error) {
                console.error("保存数据失败:", error);
                // 即使失败也关闭窗口
                send("save-data-complete");
            }
        });

    }, [on, invoke, setCloseWindowLoading, clipBoradData]);
}