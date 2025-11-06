import useStore from "@/store/store";
import { useMemoizedFn } from "ahooks";
import { useState } from "react";

export interface IClipboardItem {
    type: string;
    data: string;
    blob: Blob;
    timestamp?: number;
}

interface IUseAdvancedClipboardReturn {
    clipboardItems: IClipboardItem[];
    error: string | null;
    isLoading: boolean;
    readClipboard: () => Promise<IClipboardItem[] | null>;
    updateClipboardData: () => Promise<void>;
}

/**
 * 记录和读取剪贴板内容
 * @returns 
 */
export const useAdvancedClipboard = (): IUseAdvancedClipboardReturn => {
    const { setclipBoradData } = useStore();
    const [clipboardItems, setClipboardItems] = useState<IClipboardItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const readClipboard = useMemoizedFn(async (): Promise<IClipboardItem[] | null> => {
        setIsLoading(true);
        setError(null);
        try {
            if (!navigator.clipboard) {
                throw new Error("Clipboard API not supported");
            }

            const items: IClipboardItem[] = [];
            const clipboardItems = await navigator.clipboard.read();

            for (const clipboardItem of clipboardItems) {
                for (const type of clipboardItem.types) {
                    const blob = await clipboardItem.getType(type);
                    const text = await blob.text();

                    items.push({
                        type,
                        data: text,
                        blob,
                        timestamp: Date.now()
                    });
                }
            }

            setClipboardItems(items);
            return items;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to read clipboard";
            setError(errorMsg);
            return null;
        } finally {
            setIsLoading(false);
        }
    });

    const updateClipboardData = useMemoizedFn(async () => {
        const items = await readClipboard();
        if (items?.length === 0) return;
        const currentData = useStore.getState().clipBoradData;

        if (items![0].data === currentData[0]?.data) return;
        setclipBoradData([...items!, ...currentData]);
    });

    return {
        clipboardItems,
        error,
        isLoading,
        readClipboard,
        updateClipboardData
    };
}