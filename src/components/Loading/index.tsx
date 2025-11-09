import { LoadingOutlined } from "@ant-design/icons";
import styles from './index.module.less';

interface ILoadingProps {
    text?: string | React.ReactNode
}

const Loading: React.FC<ILoadingProps> = (props) => {
    const { text = '加载中...' } = props

    return <div className={styles.loadingWrapper}>
        <div className={styles.content}>
            <div className={styles.icon}><LoadingOutlined /></div>
            {text}
        </div>
    </div>
}

export default Loading;