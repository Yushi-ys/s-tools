import React, { useMemo, useRef, useState } from "react";
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
import {
  Flex,
  FloatButton,
  Image,
  message,
  Space,
  Tabs,
  type TabsProps,
} from "antd";
import { useInterval, useMemoizedFn, useUpdate, useVirtualList } from "ahooks";
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

const UPDATE_INTERVAL = 60 * 1000;

const RenderItem = ({
  item,
  index,
  updateSelectedIndex,
  handleCopy,
  selectIndex,
}: IRenderItemProps) => {
  const { type, data, width, height } = item;

  const renderContent = () => {
    switch (type) {
      case "text":
        return <div className={styles.ellipsis}>{data}</div>;

      case "image":
        return (
          <Flex
            align="flex-end"
            justify="space-between"
            style={{ paddingRight: "0.5rem" }}
          >
            <Image height={100} src={data} style={{ minWidth: "100px" }} />
          </Flex>
        );

      default:
        return null;
    }
  };

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
      <div>{renderContent()}</div>
      <div className={styles.timestamp}>
        <Space>
          {formatRelativeTime(item.timestamp!)}
          {type === "image" && (
            <div>
              {width} × {height}
            </div>
          )}
        </Space>
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

const ClipboardPage: React.FC = () => {
  const { clipBoradData } = useStore();
  const [messageApi, contextHolder] = message.useMessage();
  const update = useUpdate();
  const { isLoading, writeClipboard } = useAdvancedClipboard();
  // 剪切板数据列表，点击选中的第几个
  const [selectIndex, setSelectIndex] = useState<number>(0);
  const [selectTab, setSelectTab] = useState<string>(COPYKEYBOARDTYPE.ALL);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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

  const calculateItemHeight = (
    dataSource: IClipboardItem[],
    index: number
  ): number => {
    let height = 0;
    const item = dataSource[index];
    if (item.type === "image") {
      height = 125.05; // 图片项目较高
    }
    height = 47.05;

    if (index === selectIndex) height += 2;

    return height;
  };

  const [virtualList] = useVirtualList(dataSource, {
    containerTarget: scrollContainerRef,
    wrapperTarget: listRef,
    itemHeight: (index) => calculateItemHeight(dataSource, index),
    overscan: 5,
  });

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
      <div className={styles.dataSourceWrapper} ref={scrollContainerRef}>
        {contextHolder}
        {isLoading ? (
          <Loading />
        ) : !!dataSource.length ? (
          <div ref={listRef} className={styles.virtualListWrapper}>
            {virtualList.map((item) => (
              <div
                key={"clipBorad" + item.index}
                style={{
                  padding: 0,
                  margin: 0,
                }}
              >
                <RenderItem
                  item={item.data}
                  index={item.index}
                  selectIndex={selectIndex}
                  updateSelectedIndex={updateSelectedIndex}
                  handleCopy={handleCopy}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyPage />
        )}
        <FloatButton.BackTop
          target={() => scrollContainerRef.current as HTMLElement}
        />
      </div>
    </div>
  );
};

export default ClipboardPage;
