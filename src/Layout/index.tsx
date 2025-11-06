import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Header from "@/layout/Header";
import Menus from "@/layout/Menus";

import styles from './index.module.less'

const Index: React.FC = () => {
    const { Content, Sider } = Layout;

    return <Layout className={styles.layoutWrapper}>
        <Sider width={150} className={styles.sider}>
            <div className="demo-logo-vertical" />
            <Menus />
        </Sider>
        <Layout>
            <Header />
            <Content style={{ margin: '24px 16px 0' }}>
                <div
                    style={{
                        padding: 24,
                        minHeight: 360,
                    }}
                >
                    <Outlet />
                </div>
            </Content>
        </Layout>
    </Layout>
}

export default Index;