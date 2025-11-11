import { useState, useRef } from "react";
import { Button, Select } from "antd";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useMemoizedFn } from "ahooks";
import { LANGUAGE_OPTIONS } from "@/types/constants";

import styles from "./index.module.less";

const { Option } = Select;

interface DiffLine {
  line: string;
  type: 'added' | 'removed' | 'unchanged';
  leftLineNumber?: number;
  rightLineNumber?: number;
}

const DiffPage: React.FC = () => {
  const [leftContent, setLeftContent] = useState<string>("");
  const [rightContent, setRightContent] = useState<string>("");
  const [activeSide, setActiveSide] = useState<"left" | "right" | null>(null);
  const [language, setLanguage] = useState<string>("javascript");
  const [diffResult, setDiffResult] = useState<DiffLine[]>([]);
  const [isDiffMode, setIsDiffMode] = useState<boolean>(false);
  const [currentDiffIndex, setCurrentDiffIndex] = useState<number>(-1);

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const leftDiffLinesRef = useRef<(HTMLDivElement | null)[]>([]);
  const rightDiffLinesRef = useRef<(HTMLDivElement | null)[]>([]);

  // 计算行数
  const getLineCount = useMemoizedFn((content: string) => {
    if (!content) return 0;
    return content.split("\n").length;
  });

  // 简单的差异比较算法
  const computeDiff = useMemoizedFn((left: string, right: string): DiffLine[] => {
    const leftLines = left.split('\n');
    const rightLines = right.split('\n');
    const result: DiffLine[] = [];
    
    let i = 0, j = 0;
    let leftLineNum = 1, rightLineNum = 1;

    while (i < leftLines.length || j < rightLines.length) {
      if (i < leftLines.length && j < rightLines.length && leftLines[i] === rightLines[j]) {
        // 相同的行
        result.push({
          line: leftLines[i],
          type: 'unchanged',
          leftLineNumber: leftLineNum++,
          rightLineNumber: rightLineNum++
        });
        i++;
        j++;
      } else if (j < rightLines.length && (i >= leftLines.length || !leftLines.slice(i).includes(rightLines[j]))) {
        // 新增的行
        result.push({
          line: rightLines[j],
          type: 'added',
          rightLineNumber: rightLineNum++
        });
        j++;
      } else if (i < leftLines.length && (j >= rightLines.length || !rightLines.slice(j).includes(leftLines[i]))) {
        // 删除的行
        result.push({
          line: leftLines[i],
          type: 'removed',
          leftLineNumber: leftLineNum++
        });
        i++;
      } else {
        // 处理修改的情况（先删除旧行，再添加新行）
        if (i < leftLines.length) {
          result.push({
            line: leftLines[i],
            type: 'removed',
            leftLineNumber: leftLineNum++
          });
          i++;
        }
        if (j < rightLines.length) {
          result.push({
            line: rightLines[j],
            type: 'added',
            rightLineNumber: rightLineNum++
          });
          j++;
        }
      }
    }

    return result;
  });

  // 获取所有差异行的索引
  const getDiffIndexes = useMemoizedFn((): number[] => {
    return diffResult.reduce((indexes: number[], diffLine, index) => {
      if (diffLine.type === 'added' || diffLine.type === 'removed') {
        indexes.push(index);
      }
      return indexes;
    }, []);
  });

  // 滚动到下一个差异处
  const scrollToNextDiff = useMemoizedFn(() => {
    const diffIndexes = getDiffIndexes();
    if (diffIndexes.length === 0) return;

    let nextIndex = currentDiffIndex + 1;
    if (nextIndex >= diffIndexes.length) {
      nextIndex = 0; // 循环到第一个
    }

    const targetIndex = diffIndexes[nextIndex];
    setCurrentDiffIndex(nextIndex);

    // 获取目标差异行
    const targetDiff = diffResult[targetIndex];
    
    // 重置所有高亮
    leftDiffLinesRef.current.forEach((element, index) => {
      if (element && diffResult[index].type === 'removed') {
        element.style.backgroundColor = 'rgba(255, 77, 79, 0.2)';
      }
    });
    rightDiffLinesRef.current.forEach((element, index) => {
      if (element && diffResult[index].type === 'added') {
        element.style.backgroundColor = 'rgba(82, 196, 26, 0.2)';
      }
    });

    // 高亮当前差异行
    if (targetDiff.type === 'removed' && leftDiffLinesRef.current[targetIndex]) {
      const element = leftDiffLinesRef.current[targetIndex];
      if (element) {
        element.style.backgroundColor = 'rgba(255, 77, 79, 0.4)';
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }

    if (targetDiff.type === 'added' && rightDiffLinesRef.current[targetIndex]) {
      const element = rightDiffLinesRef.current[targetIndex];
      if (element) {
        element.style.backgroundColor = 'rgba(82, 196, 26, 0.4)';
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  });

  // 行号显示 - 差异模式
  const renderDiffLineNumbers = useMemoizedFn((side: 'left' | 'right') => {
    if (!isDiffMode || diffResult.length === 0) return null;

    return (
      <div className={styles.lineNumbers}>
        {diffResult.map((diffLine, index) => {
          const lineNumber = side === 'left' ? diffLine.leftLineNumber : diffLine.rightLineNumber;
          if (!lineNumber) return <div key={index} className={styles.lineNumber}></div>;
          
          return (
            <div 
              key={index} 
              className={`${styles.lineNumber} ${
                diffLine.type === 'removed' && side === 'left' ? styles.diffLineRemoved :
                diffLine.type === 'added' && side === 'right' ? styles.diffLineAdded : ''
              }`}
            >
              {lineNumber}
            </div>
          );
        })}
      </div>
    );
  });

  // 行号显示 - 普通模式
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

  // 渲染差异内容
  const renderDiffContent = useMemoizedFn((side: 'left' | 'right') => {
    if (diffResult.length === 0) {
      return <div className={styles.placeholder}>点击 Diff 按钮比较内容</div>;
    }

    return (
      <div className={styles.diffContent}>
        {diffResult.map((diffLine, index) => {
          const shouldShow = 
            (side === 'left' && (diffLine.type === 'removed' || diffLine.type === 'unchanged')) ||
            (side === 'right' && (diffLine.type === 'added' || diffLine.type === 'unchanged'));

          if (!shouldShow) {
            return <div key={index} className={styles.emptyLine}></div>;
          }

          return (
            <div
              key={index}
              ref={(el) => {
                if (side === 'left') {
                  leftDiffLinesRef.current[index] = el;
                } else {
                  rightDiffLinesRef.current[index] = el;
                }
              }}
              className={`${styles.diffLine} ${
                diffLine.type === 'added' && side === 'right' ? styles.diffLineAdded :
                diffLine.type === 'removed' && side === 'left' ? styles.diffLineRemoved :
                styles.diffLineUnchanged
              }`}
            >
              {diffLine.line || ' '}
            </div>
          );
        })}
      </div>
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
    // 粘贴新内容时退出差异模式
    setIsDiffMode(false);
    setDiffResult([]);
    setCurrentDiffIndex(-1);
  });

  const handleClear = useMemoizedFn(() => {
    setLeftContent("");
    setRightContent("");
    setActiveSide(null);
    setIsDiffMode(false);
    setDiffResult([]);
    setCurrentDiffIndex(-1);
  });

  const handleLanguageChange = useMemoizedFn((value: string) => {
    setLanguage(value);
  });

  const handleDiff = useMemoizedFn(() => {
    if (!leftContent && !rightContent) {
      return;
    }
    
    const diff = computeDiff(leftContent, rightContent);
    setDiffResult(diff);
    setIsDiffMode(true);
    setCurrentDiffIndex(-1);
  });

  const handleExitDiff = useMemoizedFn(() => {
    setIsDiffMode(false);
    setDiffResult([]);
    setCurrentDiffIndex(-1);
  });

  return (
    <div className={styles.diffWrapper}>
      <div className={styles.header}>
        <Button onClick={handleClear}>清空</Button>
        <Button 
          type="primary" 
          onClick={isDiffMode ? handleExitDiff : handleDiff}
          disabled={!leftContent && !rightContent}
        >
          {isDiffMode ? "退出 Diff" : "Diff"}
        </Button>
        {isDiffMode && (
          <Button 
            onClick={scrollToNextDiff}
            disabled={getDiffIndexes().length === 0}
          >
            下一个差异 ({currentDiffIndex + 1}/{getDiffIndexes().length})
          </Button>
        )}
        <div className={styles.languageSelector}>
          <span className={styles.selectorLabel}>语言：</span>
          <Select
            value={language}
            onChange={handleLanguageChange}
            style={{ width: 120 }}
            size="middle"
            disabled={isDiffMode}
          >
            {LANGUAGE_OPTIONS.map((lang) => (
              <Option key={lang.value} value={lang.value}>
                {lang.label}
              </Option>
            ))}
          </Select>
        </div>
        <div className={styles.status}>
          {isDiffMode ? `差异比较模式 (${getDiffIndexes().length} 个差异)` : activeSide && `已粘贴到${activeSide === "left" ? "左侧" : "右侧"}`}
        </div>
      </div>
      <div className={styles.content}>
        <div
          ref={leftPanelRef}
          className={`${styles.panel} ${styles.leftPanel} ${
            activeSide === "left" && !isDiffMode ? styles.active : ""
          } ${isDiffMode ? styles.diffMode : ''}`}
          onClick={() => !isDiffMode && handlePaste("left")}
        >
          <div className={styles.panelHeader}>左侧内容</div>
          <div className={styles.panelBody}>
            {isDiffMode ? renderDiffLineNumbers('left') : renderLineNumbers(leftContent)}
            <div className={styles.panelContent}>
              {isDiffMode ? renderDiffContent('left') : renderCodeContent(leftContent)}
            </div>
          </div>
        </div>
        <div
          ref={rightPanelRef}
          className={`${styles.panel} ${styles.rightPanel} ${
            activeSide === "right" && !isDiffMode ? styles.active : ""
          } ${isDiffMode ? styles.diffMode : ''}`}
          onClick={() => !isDiffMode && handlePaste("right")}
        >
          <div className={styles.panelHeader}>右侧内容</div>
          <div className={styles.panelBody}>
            {isDiffMode ? renderDiffLineNumbers('right') : renderLineNumbers(rightContent)}
            <div className={styles.panelContent}>
              {isDiffMode ? renderDiffContent('right') : renderCodeContent(rightContent)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiffPage;