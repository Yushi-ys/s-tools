import React from "react";
import { MoonOutlined, SunOutlined, WifiOutlined } from "@ant-design/icons";
import { Flex, Layout } from "antd";
import { THEMESTYLE } from "@/types/constants";
import { useToggleTheme } from "@/hooks/useToggleTheme";
import { useNetwork } from "ahooks";
import cls from "classnames";

import styles from "./index.module.less";

const Header: React.FC = () => {
  const { theme, toggleTheme } = useToggleTheme();
  const { online } = useNetwork();
  const { Header } = Layout;

  return (
    <Header className={styles.headerWrapper}>
      <div></div>
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
    </Header>
  );
};

export default Header;
