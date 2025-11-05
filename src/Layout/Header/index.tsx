import { Flex, Layout } from "antd";
import React from "react";
import styles from './index.module.less'
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import useStore from "../../store/store";
import { THEMESTYLE } from "../../types/constants";

const Header: React.FC = () => {
    const { theme, setTheme } = useStore()
    const { Header } = Layout;

    const toggleTheme = () => {
        const htmlElement = document.documentElement;
        if (theme === THEMESTYLE.LIGHT) {
            setTheme(THEMESTYLE.DARK);
            htmlElement.setAttribute('data-theme', 'dark');

        } else {
            setTheme(THEMESTYLE.LIGHT);
            htmlElement.removeAttribute('data-theme');
        }
    }

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