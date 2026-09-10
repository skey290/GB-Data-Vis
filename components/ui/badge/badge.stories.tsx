import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, within } from "storybook/test";

import { Badge } from "./badge";

const FIGMA_URL =
  "https://www.figma.com/design/PrsHuyyra9LzqqrDwmrB5P/%F0%9F%93%8C-GB_Design-System?node-id=665-2024&t=0Rmc4ocqopcU6G52-4";

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
  args: {
    children: "3",
    variant: "outline",
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Outline: Story = {
  args: {
    variant: "outline",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("3");

    await expect(badge).toBeInTheDocument();
    await expect(badge.className).toContain("border-border");
  },
};

export const Default: Story = {
  args: {
    variant: "default",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("3");

    await expect(badge.className).toContain("bg-primary");
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("3");

    await expect(badge.className).toContain("bg-secondary");
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("3");

    await expect(badge.className).toContain("bg-destructive");
  },
};
