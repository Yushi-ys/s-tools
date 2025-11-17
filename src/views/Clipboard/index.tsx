import React, { useMemo, useState } from "react";
import {
  useAdvancedClipboard,
  type IClipboardItem,
} from "@/hooks/useAdvancedClipboard";
import useStore from "@/store/store";
import cls from "classnames";
import { formatRelativeTime } from "@/utils";
import {
  CopyOutlined,
  FileImageOutlined,
  FileTextOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { Flex, Image, message, Tabs, type TabsProps } from "antd";
import { useInterval, useMemoizedFn, useUpdate } from "ahooks";
import { COPYKEYBOARDTYPE, COPYKEYBOARDTYPELABEL } from "@/types/constants";
import Loading from "@/components/Loading";
import EmptyPage from "@/components/Empty";

import styles from "./index.module.less";

interface IRenderItemProps {
  item: IClipboardItem;
  index: number;
  selectIndex: number;
  updateSelectedIndex: (index: number) => void;
  handleCopy: (e: React.MouseEvent, item: IClipboardItem) => void;
}

const RenderItem = ({
  item,
  index,
  updateSelectedIndex,
  handleCopy,
  selectIndex,
}: IRenderItemProps) => {
  const { type, data, width, height } = item;

  const renderContent = useMemo(() => {
    switch (type) {
      case "text":
        return <div>{data}</div>;

      case "image":
        return (
          <Flex
            align="flex-end"
            justify="space-between"
            style={{ paddingRight: "0.5rem" }}
          >
            <Image width={100} height={100} src={data} />
            <div>
              {width} × {height}
            </div>
          </Flex>
        );

      default:
        return null;
    }
  }, [type, data, width, height]);

  const handleClick = useMemoizedFn(() => {
    updateSelectedIndex(index);
  });

  const handleCopyClick = useMemoizedFn((e: React.MouseEvent) => {
    handleCopy(e, item);
  });

  return (
    <div
      className={cls(styles.renderItem, {
        [styles.selected]: selectIndex === index,
      })}
      onClick={handleClick}
    >
      <div>{renderContent}</div>
      <div className={styles.timestamp}>
        <div>{formatRelativeTime(item.timestamp!)}</div>
        <div className={styles.icon} onClick={handleCopyClick}>
          <CopyOutlined />
        </div>
      </div>
    </div>
  );
};

const items: TabsProps["items"] = [
  {
    key: COPYKEYBOARDTYPE.ALL,
    label: COPYKEYBOARDTYPELABEL.ALL,
    icon: <HomeOutlined />,
  },
  {
    key: COPYKEYBOARDTYPE.TEXT,
    label: COPYKEYBOARDTYPELABEL.TEXT,
    icon: <FileTextOutlined />,
  },
  {
    key: COPYKEYBOARDTYPE.IMAGE,
    label: COPYKEYBOARDTYPELABEL.IMAGE,
    icon: <FileImageOutlined />,
  },
];

const UPDATE_INTERVAL = 60 * 1000;

const ClipboardPage: React.FC = () => {
  const { clipBoradData } = useStore();
  const [messageApi, contextHolder] = message.useMessage();
  const update = useUpdate();
  const { isLoading, writeClipboard } = useAdvancedClipboard();
  // 剪切板数据列表，点击选中的第几个
  const [selectIndex, setSelectIndex] = useState<number>(0);
  const [selectTab, setSelectTab] = useState<string>(COPYKEYBOARDTYPE.ALL);

  const updateSelectedIndex = useMemoizedFn((index: number) => {
    setSelectIndex(index);
  });

  const handleChangeTab = useMemoizedFn((key: string) => {
    setSelectIndex(0);
    setSelectTab(key);
  });

  const handleCopy = useMemoizedFn(
    async (e: React.MouseEvent, item: IClipboardItem) => {
      e.stopPropagation();

      const success = await writeClipboard(item);
      if (success) {
        updateSelectedIndex(0);
        messageApi.open({
          type: "success",
          content:
            item.type === "image" ? "图片已复制到剪贴板" : "文本已复制到剪贴板",
        });
      } else {
        messageApi.open({
          type: "error",
          content: "复制失败",
        });
      }
    }
  );

  const dataSource = useMemo(() => {
    if (selectTab === COPYKEYBOARDTYPE.ALL) return clipBoradData;
    return clipBoradData.filter((item) => item.type === selectTab);
  }, [selectTab, clipBoradData]);

  useInterval(() => {
    update();
  }, UPDATE_INTERVAL);

  return (
    <div className={styles.clipboardWrapper}>
      <div className={styles.tabs}>
        <Tabs
          defaultActiveKey={COPYKEYBOARDTYPE.ALL}
          activeKey={selectTab}
          items={items}
          onChange={handleChangeTab}
        />
      </div>
      <div className={styles.dataSourceWrapper}>
        {contextHolder}
        {isLoading ? (
          <Loading />
        ) : !!dataSource.length ? (
          dataSource.map((item, index) => (
            <RenderItem
              item={item}
              index={index}
              selectIndex={selectIndex}
              updateSelectedIndex={updateSelectedIndex}
              handleCopy={handleCopy}
              key={"clipBorad" + index}
            />
          ))
        ) : (
          <EmptyPage />
        )}
      </div>
    </div>
  );
};

export default ClipboardPage;
