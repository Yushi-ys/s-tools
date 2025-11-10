import { useEffect, useState } from "react";
import { Button, Col, Form, InputNumber, Radio, Row, Typography } from "antd";
import { generateRandomString } from "@/utils";

import styles from "./index.module.less";

const UuidPage: React.FC = () => {
  const [form] = Form.useForm();
  const [uuids, setUuids] = useState<string[]>([]);
  const { Title } = Typography;

  const initialValues = {
    character_length: 10,
    generation_rules: "only_num",
    sum: 1,
  };

  const onFormLayoutChange = () => {
    const { character_length, generation_rules, sum } =
      form.getFieldsValue() || {};
    // 生成指定数量的UUID
    const generatedUuids: string[] = [];
    for (let i = 0; i < sum; i++) {
      const uuid = generateRandomString(character_length, generation_rules);
      generatedUuids.push(uuid);
    }

    setUuids(generatedUuids);
  };

  useEffect(() => {
    onFormLayoutChange();
  }, []);

  return (
    <div className={styles.container}>
      <Form
        className={styles.formWrapper}
        layout="inline"
        form={form}
        initialValues={initialValues}
      >
        <Row className={styles.row}>
          <Col flex={1}>
            <Form.Item name="character_length" label="字符长度">
              <InputNumber min={1} max={100} />
            </Form.Item>
          </Col>
          <Col flex={2}>
            <Form.Item name="generation_rules" label="生成规则">
              <Radio.Group>
                <Radio value="only_num">纯数字</Radio>
                <Radio value="only_letter">纯字母</Radio>
                <Radio value="num_letter">数字 + 字母</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col flex={1}>
            <Form.Item name="sum" label="数量">
              <InputNumber min={1} max={999} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={null}>
          <Button type="primary" htmlType="submit" onClick={onFormLayoutChange}>
            生成
          </Button>
        </Form.Item>
      </Form>
      <div className={styles.content}>
        {uuids.map((item, index) => {
          return (
            <Title level={5} copyable title="复制" key={"uuid" + index}>
              {`${index + 1}.  `}
              {item}
            </Title>
          );
        })}
      </div>
    </div>
  );
};

export default UuidPage;
