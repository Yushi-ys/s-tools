import React, { useEffect, useState } from "react";
import { useAdvancedClipboard, type IClipboardItem } from "@/hooks/useAdvancedClipboard";
import useStore from "@/store/store";
import cls from 'classnames';

import styles from './index.module.less';
import { formatRelativeTime } from "@/utils";

interface IRenderItemProps {
    item: IClipboardItem;
    index: number;
    selectIndex: number;
    updateSelectedIndex: (index: number) => void;
}

const RenderItem = ({ item, index, updateSelectedIndex, selectIndex }: IRenderItemProps) => {
    const { type, data } = item;

    if (type.includes('text')) {
        return <div className={
            cls(styles.renderItem, {
                [styles.selected]: selectIndex === index
            })
        } onClick={() => updateSelectedIndex(index)}>
            <div>{data}</div>
            <div className={styles.timestamp}>{formatRelativeTime(item.timestamp!)}</div>
        </div>
    }
}

const Clipboard: React.FC = () => {
    const { clipBoradData } = useStore();
    const { isLoading, updateClipboardData } = useAdvancedClipboard();
    const [selectIndex, setSelectIndex] = useState<number>(0);

    const updateSelectedIndex = (index: number) => {
        setSelectIndex(index);
    }

    useEffect(() => {
        updateClipboardData();
    }, [])

    return <>{
        isLoading ? '加载中..........' : clipBoradData.map((item, index) => <RenderItem item={item} index={index} selectIndex={selectIndex} updateSelectedIndex={updateSelectedIndex} key={'clipBorad' + index} />)
    }</>;
}

export default Clipboard;