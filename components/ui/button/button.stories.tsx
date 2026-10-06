import type { Meta, StoryObj } from "@storybook/nextjs";

import { Button } from "./button";
import { ICON_IDS } from "@/lib/sprite-icon";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%E2%9D%84%EF%B8%8F-GB_Design-System---Atom?node-id=73-3681";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "mute",
        "outline",
        "link",
        "icon",
        "ghost",
        "icon-rounded",
      ],
    },
    icon: {
      control: "select",
      options: ICON_IDS,
      description: "icon/icon-rounded/ghost variant에서만 렌더링됩니다.",
    },
    disabled: {
      control: "boolean",
    },
    children: {
      control: "text",
      description: "primary/mute/outline/link variant에서만 렌더링됩니다.",
    },
  },
  args: {
    variant: "primary",
    children: "Button",
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
