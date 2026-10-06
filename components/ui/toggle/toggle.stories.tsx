import type { Meta, StoryObj } from "@storybook/nextjs";

import { Toggle, type ToggleItem } from "./toggle";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%E2%9D%84%EF%B8%8F-GB_Design-System---Atom?node-id=7214-444";

/** Figma `Part/Toggle` 내부 아이콘 자리를 대체하는 북마크 모양 placeholder SVG */
function BookmarkIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M4 2a1 1 0 0 0-1 1v11l5-3 5 3V3a1 1 0 0 0-1-1H4Z" />
    </svg>
  );
}

const items: ToggleItem[] = [
  {
    icon: <BookmarkIcon />,
    "aria-label": "북마크 1",
    label: "Growth Potential",
  },
  { icon: <BookmarkIcon />, "aria-label": "북마크 2", label: "Reach" },
  { icon: <BookmarkIcon />, "aria-label": "북마크 3", label: "Engagement" },
  { icon: <BookmarkIcon />, "aria-label": "북마크 4", label: "Ranking" },
];

const meta = {
  title: "UI/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical", "grid"],
    },
    disabled: {
      control: "boolean",
    },
  },
  args: {
    items,
    orientation: "horizontal",
    disabled: false,
  },
} satisfies Meta<typeof Toggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
