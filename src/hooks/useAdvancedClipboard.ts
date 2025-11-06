import { useState } from "react";

interface IClipboardItem {
    type: string;
    data: string;
    blob: Blob;
}

interface IUseAdvancedClipboardReturn {
    clipboardItems: IClipboardItem[];
    error: string | null;
    isLoading: boolean;
    readClipboard: () => Promise<IClipboardItem[] | null>;
}

/**
 * 记录和读取剪贴板内容
 * @returns 
 */
export const useAdvancedClipboard = (): IUseAdvancedClipboardReturn => {
    const [clipboardItems, setClipboardItems] = useState<IClipboardItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const readClipboard = async (): Promise<IClipboardItem[] | null> => {
        setIsLoading(true);
        setError(null);
        try {
            if (!navigator.clipboard) {
                throw new Error("Clipboard API not supported");
            }

            const items: IClipboardItem[] = [];
            const clipboardItems = await navigator.clipboard.read();

            for (const item of clipboardItems) {
                for (const type of item.types) {
                    const blob = await item.getType(type);
                    const text = await blob.text();

                    items.push({
                        type,
                        data: text,
                        blob,
                    });
                }
            }

            setClipboardItems(items);
            return items;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to read clipboard";
            setError(errorMsg);
            console.error(errorMsg);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        clipboardItems,
        error,
        isLoading,
        readClipboard,
    };
}