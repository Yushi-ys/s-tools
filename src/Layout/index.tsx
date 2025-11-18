import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Menus from "@/layout/Menus";

import styles from "./index.module.less";

const LayoutPage: React.FC = () => {
  const { Content, Sider } = Layout;

  return (
    <Layout className={styles.layoutWrapper}>
      <Sider width={150} className={styles.sider}>
        <div className="demo-logo-vertical" />
        <Menus />
      </Sider>
      <Layout className={styles.innerLayoutWrapper}>
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutPage;
