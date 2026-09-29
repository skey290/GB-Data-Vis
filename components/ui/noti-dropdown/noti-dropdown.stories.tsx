import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, fn, userEvent, within } from "storybook/test";

import { NotiDropdown, type NotiDropdownItem } from "./noti-dropdown";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%E2%9D%84%EF%B8%8F-GB_Design-System-%E2%80%94-Atom?node-id=4979-11016";

const items: NotiDropdownItem[] = [
  { id: "1", label: "notification placeholder", unread: true },
  { id: "2", label: "notification placeholder", unread: true },
  { id: "3", label: "notification placeholder", unread: true },
  { id: "4", label: "notification placeholder" },
  { id: "5", label: "notification placeholder" },
];

function ControlledNotiDropdown() {
  const [selectedTab, setSelectedTab] = React.useState<"all" | "unread">("all");

  return (
    <NotiDropdown
      items={items}
      selectedTab={selectedTab}
      onSelectedTabChange={setSelectedTab}
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
  args: {
    items,
    onSettingsClick: fn(),
  },
} satisfies Meta<typeof NotiDropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllTab: Story = {};

export const UnreadTab: Story = {
  args: {
    selectedTab: "unread",
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
};

export const TabSwitchInteraction: Story = {
  render: () => <ControlledNotiDropdown />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const unreadTab = canvas.getByRole("tab", { name: /Unread/ });
    await userEvent.click(unreadTab);

    await expect(unreadTab).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getAllByText("notification placeholder")).toHaveLength(
      3,
    );
  },
};

export const SettingsClickInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Notification settings" }),
    );

    await expect(args.onSettingsClick).toHaveBeenCalledTimes(1);
  },
};
