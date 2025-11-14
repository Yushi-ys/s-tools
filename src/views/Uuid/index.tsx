import {
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  Button,
  Col,
  Form,
  InputNumber,
  message,
  Radio,
  Row,
  Space,
  Typography,
} from "antd";
import { generateRandomString } from "@/utils";
import useStore from "@/store/store";
import { useMemoizedFn, useVirtualList } from "ahooks";
import styles from "./index.module.less";

const UuidPage: React.FC = () => {
  const { uuidData, setUuidData } = useStore();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [copyLoading, setCopyLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const { Paragraph } = Typography;

  const initialValues = useMemo(
    () => ({
      character_length: uuidData.character_length,
      generation_rules: uuidData.generation_rules,
      sum: uuidData.sum,
    }),
    [uuidData]
  );

  // const onFormLayoutChange = useMemoizedFn(() => {
  //   const { character_length, generation_rules, sum } =
  //     form.getFieldsValue() || {};
  //   startTransition(() => {
  //     // 生成指定数量的UUID
  //     for (let i = 0; i < sum; i++) {
  //       const uuid = generateRandomString(character_length, generation_rules);
  //       generatedUuids.push(uuid);
  //     }
  //     setUuidData({
  //       ...uuidData,
  //       uuids: generatedUuids,
  //       character_length,
  //       generation_rules,
  //       sum,
  //     });
  //   });
  // });

  const onFormLayoutChange = useMemoizedFn(() => {
    const { character_length, generation_rules, sum } =
      form.getFieldsValue() || {};
    // 生成指定数量的UUID
    const generatedUuids: string[] = [];
    for (let i = 0; i < sum; i++) {
      const uuid = generateRandomString(character_length, generation_rules);
      generatedUuids.push(uuid);
    }
    setUuidData({
      ...uuidData,
      uuids: generatedUuids,
      character_length,
      generation_rules,
      sum,
    });
  });

  const handleCopyAll = useMemoizedFn(async () => {
    setCopyLoading(true);
    const allUuids = uuidData.uuids.join("\n");
    await navigator.clipboard.writeText(allUuids);
    setCopyLoading(false);
    messageApi.open({
      type: "success",
      content: "已复制到剪贴板",
    });
  });

  // const originalList = useMemo(() => uuidData.uuids, [uuidData.uuids]);

  /**
   * 注意：originalList 必须经过 useMemo 处理或者永不变化，否则会死循环 - ahooks官方文档提到的
   */
  const [uuidList] = useVirtualList(uuidData.uuids, {
    containerTarget: containerRef,
    wrapperTarget: wrapperRef,
    itemHeight: 60,
    overscan: 10,
  });

  return (
    <div className={styles.container}>
      {contextHolder}
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
          <Space>
            <Button type="primary" onClick={onFormLayoutChange}>
              生成
            </Button>
            <Button
              onClick={handleCopyAll}
              loading={copyLoading}
              disabled={!uuidData.uuids.length}
            >
              一键复制所有
            </Button>
          </Space>
        </Form.Item>
      </Form>
      <div className={styles.content}>
        {/* {isPending ? (
          <span>加载中...</span>
        ) : ( */}
        <div ref={containerRef} style={{ overflow: "auto", minHeight: "1px" }}>
          <div ref={wrapperRef}>
            {uuidList.map((item) => {
              return (
                <Paragraph
                  className={styles["uuit-item"]}
                  copyable={{ tooltips: ["复制这个uuid", "已复制"] }}
                  ellipsis={{ rows: 1, expandable: false }}
                  key={"uuid" + item.index}
                >
                  <span className={styles.no}>No. {item.index + 1}</span>
                  {item.data}
                </Paragraph>
              );
            })}
          </div>
        </div>
        {/* )} */}
      </div>
    </div>
  );
};

export default UuidPage;
