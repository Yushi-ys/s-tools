import { Flex, Layout } from "antd";
import React from "react";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { THEMESTYLE } from "../../types/constants";
import { useToggleTheme } from "../../hooks/useToggleTheme";

import styles from './index.module.less'

const Header: React.FC = () => {
    const { theme, toggleTheme } = useToggleTheme()
    const { Header } = Layout;

    return <Header className={styles.headerWrapper}>
        <div></div>
        <Flex justify="end" align="center" gap="small" className={styles['tools-btn']}>
            <div className={styles.icon} onClick={toggleTheme}>
                {
                    theme === THEMESTYLE.LIGHT ? <SunOutlined title="切换主题色" /> : <MoonOutlined title="切换主题色" style={{ color: '#fff' }} />
                }
            </div>
        </Flex>
    </Header>
}

export default Header;