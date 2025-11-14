import { MehOutlined, SwapOutlined } from "@ant-design/icons";
import { Button, message, Result, Select, Space } from "antd";
import { useRef, useState } from "react";
import {
  useDebounceFn,
  useMemoizedFn,
  useMount,
  useNetwork,
  useUnmount,
  useUpdateEffect,
} from "ahooks";
import { baiduTranslate } from "@/api";
import useStore from "@/store/store";
import { COMMONLANGUAGES } from "@/types/constants";
import Loading from "@/components/Loading";

import styles from "./index.module.less";

const TranslationPage: React.FC = () => {
  const { translationData, setTranslationData } = useStore();
  const { online } = useNetwork();
  const editableRef = useRef<HTMLDivElement>(null);
  const [originalLanguage, setOriginalLanguage] = useState(
    translationData.originalLanguage
  ); // 原语言
  const [translatedlLanguage, setTranslatedLanguage] = useState(
    translationData.translatedlLanguage
  ); // 需要被翻译后的语言
  const [originalText, setOriginalText] = useState(
    translationData.originalText || ""
  ); // 初始文本
  const [translatedText, setTranslatedText] = useState(
    translationData.translatedText || ""
  ); // 翻译之后的文本
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  // 是否切换了原语言和被翻译的语言，用来判断是否需要防抖请求
  const [isLanguageChanging, setIsLanguageChanging] = useState(false);

  const handleOriginalLanguageChange = useMemoizedFn((val: string) => {
    setIsLanguageChanging(true);
    setOriginalLanguage(val);
  });

  const handleTranslatedLanguageChange = useMemoizedFn((val: string) => {
    setIsLanguageChanging(true);
    setTranslatedLanguage(val);
  });

  const handleInput = useMemoizedFn((e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || "";
    setOriginalText(text);
  });

  const copyTranslatedText = useMemoizedFn(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(translatedText);
      messageApi.open({
        type: "success",
        content: "文本已复制到剪贴板",
      });
    } catch (error) {
      console.log("copyTranslatedText", error);
    }
  });

  const handleTranslate = useMemoizedFn(async () => {
    setLoading(true);
    const res = await baiduTranslate({
      q: originalText,
      from: originalLanguage,
      to: translatedlLanguage,
    });
    setLoading(false);
    setIsLanguageChanging(false);
    if (res.status == 200) {
      const { data } = res;
      setTranslatedText(data.trans_result[0].dst);
    }
  });

  const handleSwapLanguage = useMemoizedFn(() => {
    setIsLanguageChanging(true);

    const newOriginalLanguage = translatedlLanguage;
    const newTranslatedLanguage = originalLanguage;
    const newOriginalText = translatedText;

    setOriginalLanguage(newOriginalLanguage);
    setTranslatedLanguage(newTranslatedLanguage);

    if (newOriginalText.trim()) {
      setTranslatedText("");
    } else {
      setTranslatedText(originalText);
      setIsLanguageChanging(false);
    }
  });

  const { run: debouncedTranslate } = useDebounceFn(handleTranslate, {
    wait: 1000,
  });

  useUpdateEffect(() => {
    if (!!originalText.trim().length) {
      if (isLanguageChanging) {
        // 切换语言的时候不需要防抖
        handleTranslate();
      } else {
        debouncedTranslate();
      }
    } else {
      setTranslatedText("");
    }
  }, [originalText, originalLanguage, translatedlLanguage]);

  useMount(() => {
    if (editableRef.current) {
      editableRef.current.textContent = translationData.originalText || "";
    }
  });

  useUnmount(() => {
    setTranslationData({
      ...translationData,
      originalText,
      translatedText,
      originalLanguage,
      translatedlLanguage,
    });
  });

  return online ? (
    <div className={styles.translationWrapper}>
      {contextHolder}
      <div>
        <Space className={styles.spaceWrapper}>
          <Space>
            <Select
              disabled={loading}
              value={originalLanguage}
              style={{ width: 120 }}
              onChange={handleOriginalLanguageChange}
              options={COMMONLANGUAGES}
            />
            <SwapOutlined onClick={handleSwapLanguage} />
            <Select
              disabled={loading}
              value={translatedlLanguage}
              style={{ width: 120 }}
              onChange={handleTranslatedLanguageChange}
              options={COMMONLANGUAGES}
            />
          </Space>
          <div className={styles.copy}>
            <Button
              type="primary"
              onClick={copyTranslatedText}
              disabled={loading}
            >
              复制结果
            </Button>
          </div>
        </Space>
      </div>
      <div className={styles.content}>
        <div
          ref={editableRef}
          className={styles["original-language-wrapper"]}
          contentEditable={true}
          onInput={handleInput}
          suppressContentEditableWarning={true}
        />
        <div className={styles["translated-language-wrapper"]}>
          {loading ? <Loading /> : translatedText}
        </div>
      </div>
    </div>
  ) : (
    <Result icon={<MehOutlined />} title="这个功能需要联网...请检查网络连接" />
  );
};

export default TranslationPage;
