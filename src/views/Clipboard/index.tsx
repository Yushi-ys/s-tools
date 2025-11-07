import React, { useEffect, useMemo, useState } from "react";
import {
  useAdvancedClipboard,
  type IClipboardItem,
} from "@/hooks/useAdvancedClipboard";
import useStore from "@/store/store";
import cls from "classnames";

import styles from "./index.module.less";
import { formatRelativeTime } from "@/utils";
import {
  CopyOutlined,
  FileImageOutlined,
  FileTextOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { Flex, Image, message, Tabs, type TabsProps } from "antd";
import { useMemoizedFn } from "ahooks";
import { COPYKEYBOARDTYPE, COPYKEYBOARDTYPELABEL } from "@/types/constants";

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
    if (type === "text") return <div>{data}</div>;
    if (type === "image")
      return (
        <Flex
          align="flex-end"
          justify="space-between"
          style={{ paddingRight: "0.5rem" }}
        >
          <Image width={100} height={100} src={data} />
          <div>
            {width} * {height}
          </div>
        </Flex>
      );
    return <></>;
  }, [type, data]);

  return (
    <div
      className={cls(styles.renderItem, {
        [styles.selected]: selectIndex === index,
      })}
      onClick={() => updateSelectedIndex(index)}
    >
      <div>{renderContent}</div>
      <div className={styles.timestamp}>
        <div>{formatRelativeTime(item.timestamp!)}</div>
        <div className={styles.icon} onClick={(e) => handleCopy(e, item)}>
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

const Clipboard: React.FC = () => {
  const { clipBoradData } = useStore();
  const [messageApi, contextHolder] = message.useMessage();
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

  return (
    <>
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
        {isLoading
          ? "加载中.........."
          : dataSource.map((item, index) => (
              <RenderItem
                item={item}
                index={index}
                selectIndex={selectIndex}
                updateSelectedIndex={updateSelectedIndex}
                handleCopy={handleCopy}
                key={"clipBorad" + index}
              />
            ))}
      </div>
    </>
  );
};

export default Clipboard;
