import type { Meta, StoryObj } from "@storybook/nextjs";
import { Home } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";

import { MenuButton } from "./menu-button";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%E2%9D%84%EF%B8%8F-GB_Design-System-%E2%80%94-Atom?node-id=3436-812";

const meta = {
  title: "UI/MenuButton",
  component: MenuButton,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  // GNB(사이드바)는 항상 다크로 렌더링되므로(Figma 실측), 스토리도 다크 배경 위에서 확인합니다.
  decorators: [
    (Story) => (
      <div className="dark flex items-center gap-[var(--spacing-2)] bg-[var(--background-subtlest)] p-[var(--spacing-4)]">
        <Story />
      </div>
    ),
  ],
  args: {
    icon: Home,
    label: "Dashboard",
    onClick: fn(),
  },
} satisfies Meta<typeof MenuButton>;

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

export const IconWithTextDefault: Story = {
  args: { type: "icon-with-text", status: "default" },
};

export const IconWithTextActive: Story = {
  args: { type: "icon-with-text", status: "active" },
};

export const IconWithTextDisabled: Story = {
  args: { type: "icon-with-text", status: "disabled" },
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
  args: { type: "icon-with-text", status: "default" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Dashboard" });

    await userEvent.click(button);

    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const DisabledInteraction: Story = {
  args: { type: "icon-with-text", status: "disabled" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Dashboard" });

    await expect(button).toBeDisabled();

    await userEvent.click(button, { pointerEventsCheck: 0 });

    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
