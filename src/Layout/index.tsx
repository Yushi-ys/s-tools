import React from "react";
import { FloatButton, Layout } from "antd";
import { Outlet } from "react-router-dom";
import Header from "@/layout/Header";
import Menus from "@/layout/Menus";

import styles from "./index.module.less";

const Index: React.FC = () => {
  const { Content, Sider } = Layout;

  return (
    <Layout className={styles.layoutWrapper}>
      <Sider width={150} className={styles.sider}>
        <div className="demo-logo-vertical" />
        <Menus />
      </Sider>
      <Layout className={styles.innerLayoutWrapper}>
        <div className={styles.header}>
          <Header />
        </div>
        <Content className={styles.content}>
          <Outlet />
          <FloatButton.BackTop />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Index;
