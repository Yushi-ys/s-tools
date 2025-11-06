import { Flex, Layout } from "antd";
import React from "react";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { THEMESTYLE } from "@/types/constants";
import { useToggleTheme } from "@/hooks/useToggleTheme";

import styles from './index.module.less'

const Header: React.FC = () => {
    const { theme, toggleTheme } = useToggleTheme()
    const { Header } = Layout;

    return <Header className={styles.headerWrapper}>
        <div></div>
        <Flex justify="end" align="center" gap="small" className={styles['tools-btn']}>
            {
                theme === THEMESTYLE.LIGHT ? <SunOutlined title="切换主题色" className={styles.icon} onClick={toggleTheme} /> : <MoonOutlined title="切换主题色" className={styles.icon} onClick={toggleTheme} style={{ color: '#fff' }} />
            }
        </Flex>
    </Header>
}

export default Header;