import { useState } from "react";

interface ClipboardItem {
  type: string;
  data: string;
  blob: Blob;
}

interface UseAdvancedClipboardReturn {
  clipboardItems: ClipboardItem[];
  error: string | null;
  isLoading: boolean;
  readClipboard: () => Promise<ClipboardItem[] | null>;
  readText: () => Promise<string | null>;
}

function useAdvancedClipboard(): UseAdvancedClipboardReturn {
  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const readClipboard = async (): Promise<ClipboardItem[] | null> => {
    setIsLoading(true);
    setError(null);
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API not supported");
      }
      
      const items: ClipboardItem[] = [];
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

  const readText = async (): Promise<string | null> => {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API not supported");
      }
      return await navigator.clipboard.readText();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to read text from clipboard";
      console.error(errorMsg);
      return null;
    }
  };

  return {
    clipboardItems,
    error,
    isLoading,
    readClipboard,
    readText,
  };
}

export default useAdvancedClipboard;