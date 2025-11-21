import { useState, useRef, useEffect } from "react";
import {
  CustomerServiceOutlined,
  SendOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { FloatButton, Button, Avatar } from "antd";
import { streamDeepSeek, type ChatMessage } from "@/api";
import styles from "./index.module.less";
import { useUpdateEffect } from "ahooks";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const AiPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "你好！我是AI助手，有什么可以帮助你的吗？",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAiMessageId, setCurrentAiMessageId] = useState<string | null>(
    null
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const editableDivRef = useRef<HTMLDivElement>(null);

  // 将 messages 转换为 API 需要的 ChatMessage 格式
  const getConversationHistory = (): ChatMessage[] => {
    return messages
      .filter(msg => msg.content.trim()) // 过滤空消息
      .map(msg => ({
        role: msg.isUser ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));
  };

  // 处理输入变化
  const handleInputChange = () => {
    if (editableDivRef.current) {
      setInputValue(editableDivRef.current.textContent || "");
    }
  };

  // 处理发送消息
  const handleSendMessage = async () => {
    const content = inputValue.trim();
    if (!content || isLoading) return;

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      content: content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // 清空可编辑div的内容
    if (editableDivRef.current) {
      editableDivRef.current.textContent = "";
    }

    setIsLoading(true);

    // 添加初始的AI消息（空内容）
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      content: "",
      isUser: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMessage]);
    setCurrentAiMessageId(aiMessageId);

    try {
      // 获取对话历史（不包含当前正在生成的空消息）
      const conversationHistory = getConversationHistory().slice(0, -1); // 排除当前的空AI消息

      await streamDeepSeek(content, {
        systemMessage: "你是一个有用的AI助手，请用友好、专业的语气回答用户的问题。回答要简洁明了，避免冗长。",
        conversationHistory, // 传入对话历史
        onChunk: (_: string, fullResponse: string) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId ? { ...msg, content: fullResponse } : msg
            )
          );
        },
        onComplete: (fullResponse: string) => {
          console.log("流式响应完成:", fullResponse);
        },
        onError: (error: Error) => {
          console.error("AI请求失败:", error);
          // 更新消息显示错误
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    content: `抱歉，请求失败：${error.message}`,
                  }
                : msg
            )
          );
        }
      });
    } catch (error) {
      console.error("AI请求失败:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: `抱歉，请求失败：${
                  error instanceof Error ? error.message : "未知错误"
                }`,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setCurrentAiMessageId(null);
    }
  };

  // 清空对话历史
  const handleClearHistory = () => {
    setMessages([
      {
        id: Date.now().toString(),
        content: "对话历史已清空，有什么可以帮助你的吗？",
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 处理粘贴事件（去除格式）
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useUpdateEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  return (
    <div className={styles.aiContainer}>
      {/* 悬浮按钮 */}
      <FloatButton
        shape="circle"
        type="primary"
        style={{
          width: "60px",
          height: "60px",
          backgroundColor: "var(--accent-color)",
          border: "none",
        }}
        description="AI助手"
        icon={<CustomerServiceOutlined />}
        onClick={() => setIsOpen(true)}
      />

      {/* 对话框 */}
      {isOpen && (
        <div className={styles.chatModal}>
          {/* 对话框头部 */}
          <div className={styles.chatHeader}>
            <div className={styles.headerInfo}>
              <Avatar
                size={32}
                icon={<CustomerServiceOutlined />}
                style={{ backgroundColor: "var(--accent-color)" }}
              />
              <div className={styles.headerText}>
                <div className={styles.aiName}>AI助手</div>
                <div className={styles.status}>
                  {isLoading ? "思考中..." : "在线"}
                </div>
              </div>
            </div>
            <div className={styles.headerActions}>
              {messages.length > 1 && (
                <Button
                  type="text"
                  size="small"
                  onClick={handleClearHistory}
                  className={styles.clearButton}
                >
                  清空对话
                </Button>
              )}
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setIsOpen(false)}
                className={styles.closeButton}
              />
            </div>
          </div>

          {/* 消息区域 */}
          <div className={styles.messagesContainer}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${
                  message.isUser ? styles.userMessage : styles.aiMessage
                }`}
              >
                <div className={styles.messageAvatar}>
                  {message.isUser ? (
                    <Avatar size={32} style={{ backgroundColor: "#87d068" }}>
                      你
                    </Avatar>
                  ) : (
                    <Avatar
                      size={32}
                      icon={<CustomerServiceOutlined />}
                      style={{ backgroundColor: "var(--accent-color)" }}
                    />
                  )}
                </div>
                <div className={styles.messageContent}>
                  <div className={styles.messageBubble}>
                    {message.content ||
                      (message.id === currentAiMessageId && (
                        <div className={styles.typingIndicator}>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      ))}
                  </div>
                  {message.content && (
                    <div className={styles.messageTime}>
                      {formatTime(message.timestamp)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className={styles.inputContainer}>
            <div className={styles.inputWrapper}>
              <div
                ref={editableDivRef}
                className={styles.editableDiv}
                contentEditable={!isLoading}
                onInput={handleInputChange}
                onKeyPress={handleKeyPress}
                onPaste={handlePaste}
                data-placeholder="输入您的问题..."
                suppressContentEditableWarning={true}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={styles.sendButton}
                loading={isLoading}
              >
                发送
              </Button>
            </div>
            <div className={styles.contextInfo}>
              当前对话轮次: {Math.floor(messages.length / 2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiPage;