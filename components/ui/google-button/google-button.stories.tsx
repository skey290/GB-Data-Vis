import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, within } from "storybook/test";

import { GoogleButton } from "./google-button";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%E2%9D%84%EF%B8%8F-GB_Design-System---Atom?node-id=3490-8023";

const meta = {
  title: "UI/GoogleButton",
  component: GoogleButton,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  args: {
    label: "Continue with Google",
  },
} satisfies Meta<typeof GoogleButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", {
      name: "Continue with Google",
    });

    await expect(button).toBeInTheDocument();
    await expect(button).not.toBeDisabled();

    const use = button.querySelector("use");
    await expect(use).toHaveAttribute("href", "/icons.svg#google-icon");
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", {
      name: "Continue with Google",
    });

    await expect(button).toBeDisabled();
    await expect(button.className).toContain("var(--border-overlay)");
    await expect(button.className).toContain("var(--background-disabled)");
  },
};
