import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import { Tooltip } from "./tooltip";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%E2%9D%84%EF%B8%8F-GB_Design-System-%E2%80%94-Atom?node-id=79-11350";

const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
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
      options: ["default", "inversed"],
    },
    side: {
      control: "select",
      options: ["top", "right", "bottom", "left"],
    },
    align: {
      control: "select",
      options: ["start", "center", "end"],
    },
    title: { control: "text" },
    description: { control: "text" },
  },
  args: {
    variant: "default",
    side: "top",
    align: "center",
    title: "Title",
    description: "Tool tip text",
    // Controls로 바로 보이도록 항상 open. 실 서비스 hover 지연은 0으로 고정.
    open: true,
    delayDuration: 0,
    onClose: fn(),
    children: <button type="button">Hover me</button>,
  },
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
