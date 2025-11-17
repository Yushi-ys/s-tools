import React, { useMemo, useState } from "react";
import { Menu, type MenuProps } from "antd";
import {
  BugOutlined,
  CopyOutlined,
  DiffOutlined,
  NumberOutlined,
  TranslationOutlined,
} from "@ant-design/icons";
import { useRouter } from "@/hooks/useRouter";

type MenuItem = Required<MenuProps>["items"][number];

const Menus: React.FC = () => {
  const { push } = useRouter();
  const [current, setCurrent] = useState("clipboard");

  const items: MenuItem[] = useMemo(() => {
    return [
      {
        key: "clipboard",
        label: "剪切板",
        icon: <CopyOutlined />,
        onClick: () => {
          push("/clipboard");
        },
      },
      {
        key: "uuid",
        label: "Uuid",
        icon: <NumberOutlined />,
        onClick: () => {
          push("/uuid");
        },
      },
      {
        key: "diff",
        label: "Diff",
        icon: <DiffOutlined />,
        onClick: () => {
          push("/diff");
        },
      },
      {
        key: "translation",
        label: "翻译",
        icon: <TranslationOutlined />,
        onClick: () => {
          push("/translation");
        },
      },
      {
        key: "scrape",
        label: "爬取视频",
        icon: <BugOutlined />,
        onClick: () => {
          push("/scrape");
        },
      },
    ];
  }, []);

  const onClick: MenuProps["onClick"] = (e) => {
    setCurrent(e.key);
  };

  return (
    <div>
      <Menu
        selectedKeys={[current]}
        onClick={onClick}
        items={items}
        mode="vertical"
      />
    </div>
  );
};

export default Menus;
