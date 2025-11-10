import { useState } from "react";
import { Button, Select } from "antd";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useMemoizedFn } from "ahooks";
import { LANGUAGE_OPTIONS } from "@/types/constants";

import styles from "./index.module.less";

const { Option } = Select;

const DiffPage: React.FC = () => {
  const [leftContent, setLeftContent] = useState<string>("");
  const [rightContent, setRightContent] = useState<string>("");
  const [activeSide, setActiveSide] = useState<"left" | "right" | null>(null);
  const [language, setLanguage] = useState<string>("javascript");

  // 计算行数
  const getLineCount = useMemoizedFn((content: string) => {
    if (!content) return 0;
    return content.split("\n").length;
  });

  // 行号显示
  const renderLineNumbers = useMemoizedFn((content: string) => {
    const lineCount = getLineCount(content);
    if (lineCount === 0) return null;

    return (
      <div className={styles.lineNumbers}>
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i + 1} className={styles.lineNumber}>
            {i + 1}
          </div>
        ))}
      </div>
    );
  });

  // 渲染代码内容
  const renderCodeContent = useMemoizedFn((content: string) => {
    if (!content) {
      return <div className={styles.placeholder}>点击此处粘贴内容</div>;
    }

    return (
      <SyntaxHighlighter
        language={language}
        showLineNumbers={false}
        customStyle={{
          background: "transparent",
          padding: 0,
          margin: 0,
          fontSize: "0.8rem",
          lineHeight: "1.5",
        }}
        codeTagProps={{
          style: {
            background: "transparent",
            fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
          },
        }}
      >
        {content}
      </SyntaxHighlighter>
    );
  });

  const handlePaste = useMemoizedFn(async (side: "left" | "right") => {
    const text = await navigator.clipboard.readText();
    if (side === "left") {
      setLeftContent(text);
    } else {
      setRightContent(text);
    }
    setActiveSide(side);
  });

  const handleClear = useMemoizedFn(() => {
    setLeftContent("");
    setRightContent("");
    setActiveSide(null);
  });

  const handleLanguageChange = useMemoizedFn((value: string) => {
    setLanguage(value);
  });

  return (
    <div className={styles.diffWrapper}>
      <div className={styles.header}>
        <Button onClick={handleClear}>清空</Button>
        <div className={styles.languageSelector}>
          <span className={styles.selectorLabel}>语言：</span>
          <Select
            value={language}
            onChange={handleLanguageChange}
            style={{ width: 120 }}
            size="middle"
          >
            {LANGUAGE_OPTIONS.map((lang) => (
              <Option key={lang.value} value={lang.value}>
                {lang.label}
              </Option>
            ))}
          </Select>
        </div>
        <div className={styles.status}>
          {activeSide && `已粘贴到${activeSide === "left" ? "左侧" : "右侧"}`}
        </div>
      </div>
      <div className={styles.content}>
        <div
          className={`${styles.panel} ${styles.leftPanel} ${
            activeSide === "left" ? styles.active : ""
          }`}
          onClick={() => handlePaste("left")}
        >
          <div className={styles.panelHeader}>左侧内容</div>
          <div className={styles.panelBody}>
            {renderLineNumbers(leftContent)}
            <div className={styles.panelContent}>
              {renderCodeContent(leftContent)}
            </div>
          </div>
        </div>
        <div
          className={`${styles.panel} ${styles.rightPanel} ${
            activeSide === "right" ? styles.active : ""
          }`}
          onClick={() => handlePaste("right")}
        >
          <div className={styles.panelHeader}>右侧内容</div>
          <div className={styles.panelBody}>
            {renderLineNumbers(rightContent)}
            <div className={styles.panelContent}>
              {renderCodeContent(rightContent)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiffPage;
