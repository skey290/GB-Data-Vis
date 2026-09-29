import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, fn, userEvent, within } from "storybook/test";

import { MenuNotification } from "./menu-notification";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%E2%9D%84%EF%B8%8F-GB_Design-System-%E2%80%94-Atom?node-id=3555-8113";

const meta = {
  title: "UI/MenuNotification",
  component: MenuNotification,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  decorators: [
    (Story) => (
      <div className="dark flex items-center gap-[var(--spacing-2)] bg-[var(--background-subtlest)] p-[var(--spacing-4)]">
        <Story />
      </div>
    ),
  ],
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof MenuNotification>;

export default meta;

type Story = StoryObj<typeof meta>;

export const IconDefault: Story = {
  args: { type: "icon", status: "default" },
};

export const IconActive: Story = {
  args: { type: "icon", status: "active" },
};

export const IconDisabled: Story = {
  args: { type: "icon", status: "disabled" },
};

export const TextDefault: Story = {
  args: { type: "text", status: "default" },
};

export const TextActive: Story = {
  args: { type: "text", status: "active" },
};

export const TextDisabled: Story = {
  args: { type: "text", status: "disabled" },
};

export const ClickInteraction: Story = {
  args: { type: "text", status: "default" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Notification" });

    await userEvent.click(button);

    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
