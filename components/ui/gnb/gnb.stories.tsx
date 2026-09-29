import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { Blocks, Home, UserSearch } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Gnb, type GnbItem, type GnbProps } from "./gnb";
import { createSpriteIcon } from "@/lib/sprite-icon";
import type { NotiDropdownItem } from "@/components/ui/noti-dropdown";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%E2%9D%84%EF%B8%8F-GB_Design-System-%E2%80%94-Atom?node-id=616-3399";

// Figma GNB 노드(616:3399)의 실제 아이콘 확인 결과, Assets/Compass는 lucide 표준
// 아이콘(Package/Compass)이 아니라 `/public/icons.svg`에 이미 등록된 커스텀 벡터
// (asset-icon/compass-icon)와 일치한다. Dashboard/Contents Studio/Know Thyself는
// lucide의 Home/Blocks/UserSearch와 그대로 일치해 변경하지 않는다.
const AssetIcon = createSpriteIcon("asset-icon");
const CompassIcon = createSpriteIcon("compass-icon");

const items: GnbItem[] = [
  { id: "dashboard", icon: Home, label: "Dashboard" },
  { id: "assets", icon: AssetIcon, label: "Assets" },
  { id: "compass", icon: CompassIcon, label: "Compass" },
  { id: "contents-studio", icon: Blocks, label: "Contents Studio" },
  { id: "know-thyself", icon: UserSearch, label: "Know Thyself" },
];

const notificationItems: NotiDropdownItem[] = [
  { id: "1", label: "notification placeholder", unread: true },
  { id: "2", label: "notification placeholder", unread: true },
  { id: "3", label: "notification placeholder" },
];

function ControlledGnb(props: GnbProps) {
  const [expanded, setExpanded] = React.useState(props.expanded);
  const [activeId, setActiveId] = React.useState(props.activeId);

  return (
    <div style={{ height: 700 }}>
      <Gnb
        {...props}
        expanded={expanded}
        onExpandedChange={(next) => {
          setExpanded(next);
          props.onExpandedChange?.(next);
        }}
        activeId={activeId}
        onItemSelect={(id) => {
          setActiveId(id);
          props.onItemSelect?.(id);
        }}
      />
    </div>
  );
}

const meta = {
  title: "UI/Gnb",
  component: Gnb,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  args: {
    items,
    activeId: "dashboard",
    unreadCount: 2,
    notificationItems,
    onItemSelect: fn(),
    onExpandedChange: fn(),
    onSettingsClick: fn(),
    onToggleNotification: fn(),
    onNotificationSettingsClick: fn(),
  },
  render: (args) => <ControlledGnb {...args} />,
} satisfies Meta<typeof Gnb>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {
  args: { expanded: false },
};

export const Expanded: Story = {
  args: { expanded: true },
};

export const WithDisabledItem: Story = {
  args: { expanded: true, disabledIds: ["contents-studio"] },
};

export const ExpandToggleInteraction: Story = {
  args: { expanded: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", { name: "Expand sidebar" });

    await userEvent.click(toggle);

    await expect(args.onExpandedChange).toHaveBeenCalledWith(true);
    await expect(
      canvas.getByRole("button", { name: "Collapse sidebar" }),
    ).toBeInTheDocument();
  },
};

export const ItemSelectInteraction: Story = {
  args: { expanded: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const assetsButton = canvas.getByRole("button", { name: "Assets" });

    await userEvent.click(assetsButton);

    await expect(args.onItemSelect).toHaveBeenCalledWith("assets");
    await expect(assetsButton).toHaveAttribute("aria-current", "true");
  },
};

export const DisabledItemInteraction: Story = {
  args: { expanded: true, disabledIds: ["contents-studio"] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const disabledButton = canvas.getByRole("button", {
      name: "Contents Studio",
    });

    await expect(disabledButton).toBeDisabled();

    await userEvent.click(disabledButton, { pointerEventsCheck: 0 });

    await expect(args.onItemSelect).not.toHaveBeenCalledWith("contents-studio");
  },
};

export const NotificationPopoverInteraction: Story = {
  args: { expanded: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const bell = canvas.getByRole("button", { name: "Notification" });

    await userEvent.click(bell);

    await expect(args.onToggleNotification).toHaveBeenCalledWith(true);
    const body = within(document.body);
    await expect(
      await body.findAllByText("notification placeholder"),
    ).toHaveLength(3);
  },
};
