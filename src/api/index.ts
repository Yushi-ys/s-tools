import { generateRandomString } from "@/utils";
import axios from "axios";
import CryptoJS from "crypto-js";

export interface IBaiduTranslateProps {
  q: string; // 待翻译文本，utf-8编码
  from: string; // 原文语言代码
  to: string; // 译文语言代码
}

const getSign = (appid: string, q: string, salt: string, appkey: string) => {
  const sign_str = appid + q + salt + appkey;
  return CryptoJS.MD5(sign_str).toString();
};

/**
 * 百度翻译
 * @param props
 * @returns
 */
export const baiduTranslate = async (props: IBaiduTranslateProps) => {
  const appid = "20251104002490229";
  const salt = generateRandomString(5, "only_num"); // 函数生成的随机码, 可为字母或数字的字符串
  const appkey = "3qqeAFDctR5EwArBswHx";
  const { q, from, to } = props || {};

  const sign = getSign(appid, q, salt, appkey);

  const res = await axios.post("http://localhost:3002/proxy/translate", {
    q,
    from,
    to,
    appid,
    salt,
    sign,
  });

  return res;
};

// 类型定义
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface StreamDeepSeekOptions {
  systemMessage?: string;
  conversationHistory?: ChatMessage[]; // 新增：对话历史
  onChunk?: (chunk: string, fullResponse: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

/**
 * DeepSeek 流式聊天（支持上下文）
 * @param {string} userMessage - 用户消息
 * @param {StreamDeepSeekOptions} options - 配置选项
 */
export const streamDeepSeek = async (
  userMessage: string,
  options: StreamDeepSeekOptions = {}
): Promise<string> => {
  const {
    systemMessage = "你是一个有用的助手。",
    conversationHistory = [],
    onChunk,
    onComplete,
    onError
  } = options;

  if (!userMessage?.trim()) {
    const error = new Error("请输入有效的用户消息");
    onError?.(error);
    throw error;
  }

  try {
    // 构建完整的消息数组
    const messages: ChatMessage[] = [
      { role: "system", content: systemMessage },
      ...conversationHistory,
      { role: "user", content: userMessage.trim() }
    ];

    console.log('发送请求，消息数量:', messages.length);
    console.log('对话历史长度:', conversationHistory.length);

    // 在浏览器环境中使用 fetch，因为 axios 不支持 responseType: 'stream'
    const streamResponse = await fetch(
      "http://localhost:3002/api/chat/stream",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages,
        }),
      }
    );

    if (!streamResponse.ok) {
      // 使用 axios 来获取错误响应的详细信息
      try {
        const errorText = await streamResponse.text();
        throw new Error(`HTTP错误! 状态: ${streamResponse.status}, 详情: ${errorText}`);
      } catch (textError) {
        throw new Error(`HTTP错误! 状态: ${streamResponse.status}`);
      }
    }

    if (!streamResponse.body) {
      throw new Error("响应体为空");
    }

    const reader = streamResponse.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullResponse = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        // 确保 chunk 不是空字符串
        if (chunk && chunk.trim()) {
          fullResponse += chunk;

          if (onChunk) {
            onChunk(chunk, fullResponse);
          }
        }
      }

      // 确保所有数据都被解码
      const finalChunk = decoder.decode();
      if (finalChunk && finalChunk.trim()) {
        fullResponse += finalChunk;
        if (onChunk) {
          onChunk(finalChunk, fullResponse);
        }
      }

      console.log('流式响应完成，总长度:', fullResponse.length);
      
      if (onComplete) {
        onComplete(fullResponse);
      }

      return fullResponse;

    } finally {
      // 确保释放 reader
      reader.releaseLock();
    }

  } catch (error) {
    console.error("请求失败:", error);
    
    // 提供更友好的错误信息
    let errorMessage = "请求失败";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    const finalError = new Error(errorMessage);
    onError?.(finalError);
    throw finalError;
  }
};