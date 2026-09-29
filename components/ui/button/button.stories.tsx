import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, within } from "storybook/test";

import { Button } from "./button";

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
      control: "radio",
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
  },
  args: {
    variant: "primary",
    children: "Button",
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Button" });

    await expect(button).toBeInTheDocument();
    await expect(button).not.toBeDisabled();
    await expect(button.className).toContain("bg-primary");
  },
};

export const Mute: Story = {
  args: {
    variant: "mute",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Button" });

    await expect(button.className).toContain("background-subtler");
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Button" });

    await expect(button.className).toContain("border-border");
  },
};

export const Link: Story = {
  args: {
    variant: "link",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Button" });

    await expect(button.className).toContain("underline");
  },
};

export const Icon: Story = {
  args: {
    variant: "icon",
    icon: "search-icon",
    children: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "search-icon" });
    const use = button.querySelector("use");

    await expect(use).toHaveAttribute("href", "/icons.svg#search-icon");
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    icon: "bell-icon",
    children: undefined,
  },
};

export const IconRounded: Story = {
  args: {
    variant: "icon-rounded",
    icon: "plus-icon",
    children: undefined,
  },
};

export const Disabled: Story = {
  args: {
    variant: "primary",
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Button" });

    await expect(button).toBeDisabled();
  },
};

export const MuteDisabled: Story = {
  args: {
    variant: "mute",
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Button" });

    await expect(button).toBeDisabled();
  },
};
