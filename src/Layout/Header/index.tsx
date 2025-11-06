import React, { useCallback, useMemo, useState } from "react";
import { LoadingOutlined, MoonOutlined, ReloadOutlined, SunOutlined } from "@ant-design/icons";
import { Flex, Layout } from "antd";
import { THEMESTYLE } from "@/types/constants";
import { useToggleTheme } from "@/hooks/useToggleTheme";
import { useRouter } from "@/hooks/useRouter";
import { useAdvancedClipboard } from "@/hooks/useAdvancedClipboard";

import styles from './index.module.less'

const Header: React.FC = () => {
    const { theme, toggleTheme } = useToggleTheme()
    const { updateClipboardData } = useAdvancedClipboard()
    const { pathname } = useRouter()
    const [refreshLoading, setRefreshLoading] = useState(false)
    const { Header } = Layout;

    const showRefreshIcon = useMemo(() => {
        return pathname === '/clipboard'
    }, [pathname])

    const refreshHandle = useCallback(async () => {
        if (pathname === '/clipboard') {
            setRefreshLoading(true);
            await updateClipboardData();
            setRefreshLoading(false);
        }
    }, [pathname, updateClipboardData])

    return <Header className={styles.headerWrapper}>
        <div></div>
        <Flex justify="end" align="center" gap="small" className={styles['tools-btn']}>
            {showRefreshIcon && (
                refreshLoading ? <LoadingOutlined /> : <ReloadOutlined onClick={refreshHandle} title="更新数据"/>
            )}
            {
                theme === THEMESTYLE.LIGHT ? <SunOutlined title="切换主题色" className={styles.icon} onClick={toggleTheme} /> : <MoonOutlined title="切换主题色" className={styles.icon} onClick={toggleTheme} style={{ color: '#fff' }} />
            }
        </Flex>
    </Header>
}

export default Header;