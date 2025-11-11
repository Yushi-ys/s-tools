import { SwapOutlined } from "@ant-design/icons";
import { Select, Space } from "antd";
import { useEffect, useState } from "react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { baiduTranslate } from "@/api";

import styles from "./index.module.less";

const TranslationPage: React.FC = () => {
  const [originalLanguage, setOriginalLanguage] = useState("zh"); // 原语言
  const [translatedlLanguage, setTranslatedLanguage] = useState("en"); // 需要被翻译后的语言
  const [originalText, setOriginalText] = useState(""); // 初始文本
  const [translatedText, setTranslatedText] = useState(""); // 翻译之后的文本

  const handleOriginalLanguageChange = useMemoizedFn((val: string) => {
    setOriginalLanguage(val);
  });

  const handleTranslatedLanguageChange = useMemoizedFn((val: string) => {
    setTranslatedLanguage(val);
  });

  const handleInput = useMemoizedFn((e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || "";
    setOriginalText(text);
  });

  const { run: translate } = useDebounceFn(
    async () => {
      const res = await baiduTranslate({
        q: originalText,
        from: originalLanguage,
        to: translatedlLanguage,
      });
      if (res.status == 200) {
        const { data } = res;
        setTranslatedText(data.trans_result[0].dst);
      }
    },
    {
      wait: 1000,
    }
  );

  useEffect(() => {
    if (!!originalText.trim().length) {
      translate();
    } else {
      setTranslatedText("");
    }
  }, [originalText]);

  return (
    <div className={styles.translationWrapper}>
      {/* <div>
        <Space align="center">
          <Select
            value={originalLanguage}
            style={{ width: 120 }}
            onChange={handleOriginalLanguageChange}
            options={[{ value: "zh", label: "中文" }]}
          />
          <SwapOutlined />
          <Select
            value={translatedlLanguage}
            style={{ width: 120 }}
            onChange={handleTranslatedLanguageChange}
            options={[{ value: "en", label: "英文" }]}
          />
        </Space>
      </div> */}
      <div className={styles.content}>
        <div
          className={styles["original-language-wrapper"]}
          contentEditable={true}
          onInput={handleInput}
          suppressContentEditableWarning={true}
        />
        <div className={styles["translated-language-wrapper"]}>
          {translatedText}
        </div>
      </div>
    </div>
  );
};

export default TranslationPage;
