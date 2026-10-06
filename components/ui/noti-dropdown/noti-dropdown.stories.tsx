import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import { NotiDropdown, type NotiDropdownProps } from "./noti-dropdown";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%E2%9D%84%EF%B8%8F-GB_Design-System-%E2%80%94-Atom?node-id=4979-11016";

const items = [
  { id: "1", label: "notification placeholder", unread: true },
  { id: "2", label: "notification placeholder", unread: true },
  { id: "3", label: "notification placeholder", unread: true },
  { id: "4", label: "notification placeholder" },
  { id: "5", label: "notification placeholder" },
];

// 완전 제어 컴포넌트라, Controls에서 selectedTab을 바꿔도 탭 클릭으로 실제 전환을
// 확인할 수 있도록 내부 상태를 들고 있는다.
function ControlledNotiDropdown({
  selectedTab,
  onSelectedTabChange,
  ...rest
}: NotiDropdownProps) {
  const [tab, setTab] = React.useState(selectedTab);

  React.useEffect(() => setTab(selectedTab), [selectedTab]);

  return (
    <NotiDropdown
      {...rest}
      selectedTab={tab}
      onSelectedTabChange={(next) => {
        setTab(next);
        onSelectedTabChange?.(next);
      }}
    />
  );
}

const meta = {
  title: "UI/NotiDropdown",
  component: NotiDropdown,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  argTypes: {
    selectedTab: {
      control: "radio",
      options: ["all", "unread"],
    },
  },
  args: {
    items,
    selectedTab: "all",
    onSettingsClick: fn(),
  },
  render: (args) => <ControlledNotiDropdown {...args} />,
} satisfies Meta<typeof NotiDropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
