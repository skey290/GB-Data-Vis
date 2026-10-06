import type { Meta, StoryObj } from "@storybook/nextjs";
import { Home } from "lucide-react";
import { fn } from "storybook/test";

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
