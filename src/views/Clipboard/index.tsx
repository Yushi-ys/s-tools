import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
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
  List,
  message,
  Space,
  Tabs,
  type TabsProps,
} from "antd";
import { useInterval, useMemoizedFn, useUpdate, useSize } from "ahooks";
import { COPYKEYBOARDTYPE, COPYKEYBOARDTYPELABEL } from "@/types/constants";
import Loading from "@/components/Loading";
import EmptyPage from "@/components/Empty";
import VirtualList from 'rc-virtual-list';

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
    <List.Item
      className={cls(styles.renderItem, {
        [styles.selected]: selectIndex === index,
      })}
      onClick={handleClick}
      style={{
        padding: '8px 12px',
        marginBottom: '2px',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        cursor: 'pointer',
      }}
    >
      <div style={{ width: '100%' }}>
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
    </List.Item>
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
  const [containerHeight, setContainerHeight] = useState(0);

  // 动态计算容器高度
  useLayoutEffect(() => {
    const updateHeight = () => {
      if (scrollContainerRef.current) {
        const height = scrollContainerRef.current.clientHeight;
        setContainerHeight(height);
      }
    };

    updateHeight();

    // 监听窗口大小变化
    window.addEventListener('resize', updateHeight);
    
    // 使用 ResizeObserver 监听容器大小变化
    const resizeObserver = new ResizeObserver(updateHeight);
    if (scrollContainerRef.current) {
      resizeObserver.observe(scrollContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateHeight);
      resizeObserver.disconnect();
    };
  }, []);

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
      <div className={styles.dataSourceWrapper} ref={scrollContainerRef}>
        {contextHolder}
        {isLoading ? (
          <Loading />
        ) : !!dataSource.length && containerHeight > 0 ? (
          <List>
            <VirtualList
              data={dataSource}
              height={containerHeight}
              itemHeight={47}
              itemKey='clipboard'
            >
              {(item: IClipboardItem, index) => (
                <RenderItem
                  item={item}
                  index={index}
                  selectIndex={selectIndex}
                  updateSelectedIndex={updateSelectedIndex}
                  handleCopy={handleCopy}
                />
              )}
            </VirtualList>
          </List>
        ) : (
          <EmptyPage />
        )}
        <FloatButton.BackTop
          target={() => scrollContainerRef.current as HTMLElement}
          style={{
            insetBlockEnd: 70,
          }}
        />
      </div>
    </div>
  );
};

export default ClipboardPage;