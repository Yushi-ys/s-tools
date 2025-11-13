import useStore from "@/store/store";
import { useMemoizedFn } from "ahooks";
import { useState } from "react";

export interface IClipboardItem {
  type: string;
  text?: string;
  image?: string; // base64 数据
  data: string;
  preview?: string;
  width?: number;
  height?: number;
  blob: Blob | null;
  timestamp: number;
  inDb?: boolean; // 是否已经存入数据库
}

interface IUseAdvancedClipboardReturn {
  error: string | null;
  isLoading: boolean;
  writeClipboard: (item: IClipboardItem) => Promise<boolean>;
}

/**
 * 记录和读取剪贴板内容
 * @returns
 */
export const useAdvancedClipboard = (): IUseAdvancedClipboardReturn => {
  const [error, setError] = useState<string | null>(null);
  const { setClipBoradDataLoading, clipBoradDataLoading } = useStore();

  /**
   * 写入剪贴板内容
   */
  const writeClipboard = useMemoizedFn(
    async (item: IClipboardItem): Promise<boolean> => {
      setError(null);
      setClipBoradDataLoading(true);

      if (item.type === "text") {
        // 处理文本复制
        if (!navigator.clipboard) {
          throw new Error("Clipboard API 不支持");
        }
        await navigator.clipboard.writeText(item.data);
        setClipBoradDataLoading(false);
        return true;
      } else if (item.type === "image" && item.blob) {
        // 处理图片复制
        if (!navigator.clipboard) {
          throw new Error("Clipboard API 不支持");
        }

        // 将 blob 转换为 ClipboardItem
        const clipboardItem = new ClipboardItem({
          [item.blob.type]: item.blob,
        });

        await navigator.clipboard.write([clipboardItem]);
        setClipBoradDataLoading(false);
        return true;
      } else if (item.type === "image" && item.data.startsWith("data:image")) {
        // 处理 base64 图片
        const response = await fetch(item.data);
        const blob = await response.blob();

        const clipboardItem = new ClipboardItem({
          [blob.type]: blob,
        });

        await navigator.clipboard.write([clipboardItem]);
        setClipBoradDataLoading(false);
        return true;
      } else {
        throw new Error(`不支持的数据类型: ${item.type}`);
      }
    }
  );

  return {
    error,
    writeClipboard,
    isLoading: clipBoradDataLoading,
  };
};
