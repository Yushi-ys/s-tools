import type React from "react";
import { LineOutlined, BorderOutlined, CloseOutlined } from "@ant-design/icons";
import styles from './index.module.less'
import { useWindowControls } from "../../hooks/useWindowControls";

const Navigation: React.FC = () => {
    const { minimize, maximize, close } = useWindowControls()
    
    return <div className={styles.main}>
        <div className={styles.operate} onClick={minimize}><LineOutlined /></div>
        <div className={styles.operate} onClick={maximize}><BorderOutlined /></div>
        <div className={styles.operate} onClick={close}><CloseOutlined /></div>
    </div>
}

export default Navigation