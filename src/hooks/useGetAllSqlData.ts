import useStore from "@/store/store";
import { useElectron } from "@/hooks/useElectron";
import { useMount } from "ahooks";

/**
 * 读取所有的本地数据库中的数据
 */
export const useGetAllSqlData = () => {
    const { db } = useElectron();
    const { setClipBoradData, setClipBoradDataLoading } = useStore();

    /**
     * 读取数据库中的 剪切板数据
     */
    const getLocalClipBoardData = async () => {
        setClipBoradDataLoading(true);
        try {
            const res = await db.getAllClipboardData(1000);
            setClipBoradData(res.map((item) => item.json_data));
        } catch (error) {
            console.error("获取数据失败:", error);
        } finally {
            setClipBoradDataLoading(false);
        }
    };

    useMount(() => {
        getLocalClipBoardData();
    });

}