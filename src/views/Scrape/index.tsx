import React, { useRef } from "react";
import styles from "./index.module.less";

const ScrapePage: React.FC = () => {
  const webviewRef = useRef<HTMLWebViewElement>(null);

  return (
    <div className={styles.scrapeWrapper}>
      <webview
        ref={webviewRef}
        src="https://www.datatool.vip/zh"
        className={styles.webview}
        nodeintegration
        plugins
        allowpopups
        webpreferences="contextIsolation=false"
      ></webview>
    </div>
  );
};

export default ScrapePage;
