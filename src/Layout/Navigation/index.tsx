import type React from "react";
import {
  LineOutlined,
  BorderOutlined,
  CloseOutlined,
  MoonOutlined,
  SunOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import { useWindowControls } from "@/hooks/useWindowControls";
import cls from "classnames";
import { Flex } from "antd";
import { useToggleTheme } from "@/hooks/useToggleTheme";
import { useNetwork } from "ahooks";
import { THEMESTYLE } from "@/types/constants";

import styles from "./index.module.less";

/**
 * 自定义 缩小 放大 退出 导航
 * @returns
 */
const Navigation: React.FC = () => {
  const { minimize, maximize, close } = useWindowControls();
  const { theme, toggleTheme } = useToggleTheme();
  const { online } = useNetwork();

  return (
    <div className={styles.main}>
      <Flex
        justify="end"
        align="center"
        gap="small"
        className={styles["tools-btn"]}
      >
        {
          <WifiOutlined
            className={cls(
              styles.icon,
              online ? styles.wifi : styles["no-wifi"]
            )}
            style={{
              color: theme === THEMESTYLE.LIGHT ? "#000" : "#fff",
            }}
            title={online ? "网络在线" : "离线了...."}
          />
        }
        {theme === THEMESTYLE.LIGHT ? (
          <SunOutlined
            title="切换主题色"
            className={styles.icon}
            onClick={toggleTheme}
          />
        ) : (
          <MoonOutlined
            title="切换主题色"
            className={styles.icon}
            onClick={toggleTheme}
            style={{ color: "#fff" }}
          />
        )}
      </Flex>
      <div className={styles.operate} onClick={minimize}>
        <LineOutlined />
      </div>
      <div className={styles.operate} onClick={maximize}>
        <BorderOutlined />
      </div>
      <div className={styles.operate} onClick={close}>
        <CloseOutlined />
      </div>
    </div>
  );
};

export default Navigation;
