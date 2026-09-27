import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, within } from "storybook/test";

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
        "destructive",
      ],
    },
    size: {
      control: "radio",
      options: ["20", "28"],
    },
  },
  args: {
    children: "Badge",
    variant: "outline",
    size: "20",
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("Badge");

    await expect(badge).toBeInTheDocument();
    await expect(badge.className).toContain("bg-[var(--background-bold)]");
  },
};

export const Reverse: Story = {
  args: {
    variant: "reverse",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("Badge");

    await expect(badge.className).toContain("bg-[var(--background-default)]");
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("Badge");

    await expect(badge.className).toContain("text-[var(--text-subtle)]");
  },
};

export const Disabled: Story = {
  args: {
    variant: "disabled",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("Badge");

    await expect(badge.className).toContain("bg-[var(--background-disabled)]");
  },
};

export const Alarm: Story = {
  args: {
    variant: "alarm",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("Badge");

    await expect(badge.className).toContain("text-[var(--text-warning)]");
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("Badge");

    await expect(badge.className).toContain(
      "bg-[var(--background-error-default)]",
    );
    await expect(badge.className).toContain("text-xs-semi-bold");
  },
};

export const Large: Story = {
  args: {
    variant: "default",
    size: "28",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("Badge");

    await expect(badge.className).toContain("h-[calc(var(--scale-28)*1px)]");
    await expect(badge.className).toContain("text-sm-medium");
  },
};

export const WithIcon: Story = {
  args: {
    variant: "default",
    icon: (
      <svg viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <circle
          cx="5"
          cy="5"
          r="4"
          stroke="currentColor"
          strokeDasharray="2 2"
        />
      </svg>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("Badge");

    await expect(badge).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[aria-hidden="true"]'),
    ).toBeInTheDocument();
  },
};
