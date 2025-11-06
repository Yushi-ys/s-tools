import { Layout } from "antd";
import React from "react";
import Header from "@/Layout/Header";
import Menus from "@/Layout/Menus";

import styles from './index.module.less'

const Index: React.FC = () => {
    const { Content, Sider } = Layout;

    return <Layout className={styles.layoutWrapper}>
        <Sider
            breakpoint="lg"
            defaultCollapsed={false}
        >
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
                    content
                </div>
            </Content>
        </Layout>
    </Layout>
}

export default Index;