import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { Blocks, Compass, Home, UserRoundSearch } from "lucide-react";
import { fn } from "storybook/test";

import { Gnb, type GnbItem, type GnbProps } from "./gnb";
import { createSpriteIcon } from "@/lib/sprite-icon";
import type { NotiDropdownItem } from "@/components/app/noti-dropdown";
import type { GnbHistoryItem } from "./gnb";

const FIGMA_URL =
  "https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8163-93080";

// Assets is a custom vector in /public/icons.svg; the rest are standard lucide icons.
const AssetIcon = createSpriteIcon("asset-icon");

const items: GnbItem[] = [
  { id: "dashboard", icon: Home, label: "Dashboard" },
  { id: "assets", icon: AssetIcon, label: "Assets" },
  { id: "compass", icon: Compass, label: "Compass" },
  { id: "contents-studio", icon: Blocks, label: "Contents Studio" },
  { id: "know-thyself", icon: UserRoundSearch, label: "Know Thyself" },
];

const notificationItems: NotiDropdownItem[] = [
  { id: "1", label: "notification placeholder", unread: true },
  { id: "2", label: "notification placeholder", unread: true },
  { id: "3", label: "notification placeholder" },
];

const workHistoryItems: GnbHistoryItem[] = [
  {
    label: "Profile photo",
    badge: "Data Scientist",
    timestamp: "Just now",
    onRestore: () => {},
  },
  {
    label: "Bio",
    badge: "Data Scientist",
    timestamp: "20min ago",
    onRestore: () => {},
  },
];

const selfArchiveItems: GnbHistoryItem[] = [
  { label: "Morning Jogger", onRestore: () => {}, onDelete: () => {} },
  { label: "Weekend Chef", onRestore: () => {}, onDelete: () => {} },
];

function ControlledGnb(props: GnbProps) {
  const [expanded, setExpanded] = React.useState(props.expanded);
  const [activeId, setActiveId] = React.useState(props.activeId);

  // Keep in sync so changing expanded/activeId from the Controls panel is reflected
  // (internal state changed by clicking is preserved; it only follows args changes)
  React.useEffect(() => setExpanded(props.expanded), [props.expanded]);
  React.useEffect(() => setActiveId(props.activeId), [props.activeId]);

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
  title: "App/Gnb",
  component: Gnb,
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
          "The main sidebar. The collapsed icon rail (toggle, bell, settings, navigation icons) reuses the shared Button component, and the expanded label list reuses Part/GNB rows. Implemented as Gnb in components/app/gnb. With the Work History or Self Archive drawer open, the gap between rail and panel is 0px (completely flush), and the toggle is pinned at the full visible panel width (rail 48px/250px + drawer 407px) plus 20px. Clicking Settings opens the Setting panel (a search field plus six menu rows) beside the rail, and the main navigation's active indicator switches off while it is open.",
      },
    },
  },
  argTypes: {
    expanded: { control: "boolean" },
    unreadCount: { control: "number" },
  },
  args: {
    items,
    expanded: true,
    activeId: "dashboard",
    disabledIds: [],
    unreadCount: 2,
    notificationItems,
    workHistoryItems,
    selfArchiveItems,
    onItemSelect: fn(),
    onExpandedChange: fn(),
    onSettingsClick: fn(),
    onToggleNotification: fn(),
    onNotificationSettingsClick: fn(),
    onSettingSectionSelect: fn(),
    onSettingSearchChange: fn(),
  },
  render: (args) => <ControlledGnb {...args} />,
} satisfies Meta<typeof Gnb>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
