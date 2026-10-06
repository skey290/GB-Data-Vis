import type { Meta, StoryObj } from "@storybook/nextjs";

import { Badge } from "./badge";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%E2%9D%84%EF%B8%8F-GB_Design-System---Atom?node-id=73-3479";

const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  argTypes: {
    variant: {
      control: "radio",
      options: [
        "default",
        "reverse",
        "outline",
        "disabled",
        "alarm",
        "success",
        "destructive",
      ],
    },
    size: {
      control: "radio",
      options: ["20", "28"],
    },
    children: { control: "text" },
  },
  args: {
    children: "Badge",
    variant: "outline",
    size: "20",
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
