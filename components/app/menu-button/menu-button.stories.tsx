import type { Meta, StoryObj } from "@storybook/nextjs";
import { Home } from "lucide-react";
import { fn } from "storybook/test";

import { MenuButton } from "./menu-button";

const FIGMA_URL =
  "https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8163-93014";

const meta = {
  title: "App/MenuButton",
  component: MenuButton,
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
          "A single GNB navigation row — icon only, icon with label, or label only — carrying the default, active, and disabled states. Implemented as MenuButton in components/app/menu-button.",
      },
    },
  },
  // The GNB (sidebar) always renders dark (confirmed by Figma measurement), so the story sits on a dark background too.
  decorators: [
    (Story) => (
      <div className="dark flex items-center gap-[var(--gb-spacing-2)] bg-[var(--gb-background-subtlest)] p-[var(--gb-spacing-4)]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    type: {
      control: "select",
      options: ["icon", "icon-with-text", "text"],
    },
    status: {
      control: "select",
      options: ["default", "active", "disabled"],
    },
    label: { control: "text" },
  },
  args: {
    type: "icon-with-text",
    status: "default",
    icon: Home,
    label: "Dashboard",
    onClick: fn(),
  },
} satisfies Meta<typeof MenuButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
