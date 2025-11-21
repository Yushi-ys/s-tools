import { Form, Radio } from "antd";
import useStore from "@/store/store";

import styles from "./index.module.less";
import type { ISettingData, TSettingDisplay } from "@/store/type";
import ShortKey from "./ShortKey";

const SettingPage: React.FC = () => {
  const [form] = Form.useForm();
  const { settings, setSettings } = useStore();

  const onChangeFormState = (
    key: keyof ISettingData,
    value: TSettingDisplay | boolean | string
  ) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className={styles.settingWrapper}>
      <Form
        form={form}
        size="large"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        style={{ maxWidth: 600 }}
      >
        <Form.Item label="界面显示">
          <Radio.Group
            value={settings.display}
            onChange={(e) => onChangeFormState("display", e.target.value)}
          >
            <Radio value="full_screen">全屏</Radio>
            <Radio value="window">窗口</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="开机自启动">
          <Radio.Group
            value={settings.autoStart}
            onChange={(e) => onChangeFormState("autoStart", e.target.value)}
          >
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="呼出快捷键">
          <ShortKey onChangeFormState={onChangeFormState} settings={settings} />
        </Form.Item>
      </Form>
    </div>
  );
};

export default SettingPage;
