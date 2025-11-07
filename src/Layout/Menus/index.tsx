import React, { useMemo } from "react";
import { Menu, type MenuProps } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { useRouter } from "@/hooks/useRouter";

type MenuItem = Required<MenuProps>["items"][number];

const Menus: React.FC = () => {
  const { push } = useRouter();

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
    ];
  }, []);

  return (
    <div>
      <Menu items={items} mode="vertical" />
    </div>
  );
};

export default Menus;
