import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import { NotiDropdown, type NotiDropdownProps } from "./noti-dropdown";

const FIGMA_URL =
  "https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8163-93051";

const items = [
  { id: "1", label: "notification placeholder", unread: true },
  { id: "2", label: "notification placeholder", unread: true },
  { id: "3", label: "notification placeholder", unread: true },
  { id: "4", label: "notification placeholder" },
  { id: "5", label: "notification placeholder" },
];

// It is fully controlled, so the story holds internal state — changing selectedTab
// from Controls still lets a tab click demonstrate the real switch.
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
  title: "App/NotiDropdown",
  component: NotiDropdown,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
    // Verbatim text from the Figma component's description field
    docs: {
      description: {
        component:
          "The notification dropdown that opens when the GNB bell is clicked — All/Unread tabs above a scrollable list of rows. Implemented as NotiDropdown in components/app/noti-dropdown.",
      },
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
