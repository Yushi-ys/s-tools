import React from "react";
import { Empty } from "antd";

import styles from "./index.module.less";

const EmptyPage: React.FC = () => (
  <Empty
    className={styles.emptyWrapper}
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description="暂无数据"
  />
);

export default EmptyPage;
