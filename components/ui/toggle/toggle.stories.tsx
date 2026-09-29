import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, userEvent, within } from "storybook/test";

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
} satisfies Meta<typeof Toggle>;

export default meta;

type Story = StoryObj<typeof meta>;

const oneItem: ToggleItem[] = [
  { icon: <BookmarkIcon />, "aria-label": "북마크 1" },
];

const twoItems: ToggleItem[] = [
  { icon: <BookmarkIcon />, "aria-label": "북마크 1" },
  { icon: <BookmarkIcon />, "aria-label": "북마크 2" },
];

const threeItems: ToggleItem[] = [
  { icon: <BookmarkIcon />, "aria-label": "북마크 1" },
  { icon: <BookmarkIcon />, "aria-label": "북마크 2" },
  { icon: <BookmarkIcon />, "aria-label": "북마크 3" },
];

const fourItems: ToggleItem[] = [
  { icon: <BookmarkIcon />, "aria-label": "북마크 1" },
  { icon: <BookmarkIcon />, "aria-label": "북마크 2" },
  { icon: <BookmarkIcon />, "aria-label": "북마크 3" },
  { icon: <BookmarkIcon />, "aria-label": "북마크 4" },
];

const fourItemsWithLabels: ToggleItem[] = [
  {
    icon: <BookmarkIcon />,
    "aria-label": "북마크 1",
    label: "Growth Potential",
  },
  { icon: <BookmarkIcon />, "aria-label": "북마크 2", label: "Reach" },
  { icon: <BookmarkIcon />, "aria-label": "북마크 3", label: "Engagement" },
  { icon: <BookmarkIcon />, "aria-label": "북마크 4", label: "Ranking" },
];

/** Figma `Type=Horizontal, Number=1` */
export const HorizontalOneItem: Story = {
  args: {
    items: oneItem,
    orientation: "horizontal",
  },
};

/** Figma `Type=Horizontal, Number=2` */
export const HorizontalTwoItems: Story = {
  args: {
    items: twoItems,
    orientation: "horizontal",
  },
};

/** Figma `Type=Horizontal, Number=3` */
export const HorizontalThreeItems: Story = {
  args: {
    items: threeItems,
    orientation: "horizontal",
  },
};

/** Figma `Type=Horizontal, Number=4` */
export const HorizontalFourItems: Story = {
  args: {
    items: fourItems,
    orientation: "horizontal",
  },
};

/** Figma `Type=Vertical, Number=4` — 1열 세로 스택 (폭 34px 고정) */
export const Vertical: Story = {
  args: {
    items: fourItems,
    orientation: "vertical",
  },
};

/** vertical 전용 보조 라벨 — 버튼 우측에 1:1로 대응하는 텍스트 */
export const VerticalWithLabels: Story = {
  args: {
    items: fourItemsWithLabels,
    orientation: "vertical",
  },
};

/** Figma `Type=Rectangular, Number=4` — 2x2 그리드 배치 */
export const Grid: Story = {
  args: {
    items: fourItems,
    orientation: "grid",
  },
};

/** 그룹 단위 비활성화 — 개별 아이템 비활성화는 지원하지 않습니다 */
export const Disabled: Story = {
  args: {
    items: threeItems,
    orientation: "horizontal",
    disabled: true,
  },
};

/** disabled + vertical 라벨 — 버튼만 disabled 톤이 되고 라벨 색은 유지됩니다 */
export const DisabledVerticalWithLabels: Story = {
  args: {
    items: fourItemsWithLabels,
    orientation: "vertical",
    disabled: true,
  },
};

type InteractionVariant =
  "Horizontal 1" | "Horizontal 2" | "Horizontal 3" | "Vertical" | "Grid";

const interactionConfigs: Record<
  InteractionVariant,
  { items: ToggleItem[]; orientation: "horizontal" | "vertical" | "grid" }
> = {
  "Horizontal 1": { items: oneItem, orientation: "horizontal" },
  "Horizontal 2": { items: twoItems, orientation: "horizontal" },
  "Horizontal 3": { items: threeItems, orientation: "horizontal" },
  Vertical: { items: fourItems, orientation: "vertical" },
  Grid: { items: fourItems, orientation: "grid" },
};

/**
 * `Toggle`은 완전 제어 컴포넌트(controlled component)라 클릭 시 상태 변화를
 * 직접 검증하려면 상위에서 `pressed` state를 들고 있어야 합니다.
 * 라디오처럼 항상 하나만 선택되도록, 선택된 아이템의 aria-label 하나만 state로 관리합니다.
 */
function ControlledToggleDemo({ variant }: { variant: InteractionVariant }) {
  const { items, orientation } = interactionConfigs[variant];
  const [selected, setSelected] = React.useState<string | null>(null);

  return (
    <Toggle
      orientation={orientation}
      items={items.map((item) => {
        const label = item["aria-label"];
        return {
          ...item,
          pressed: label === selected,
          onPressedChange: (pressed) => setSelected(pressed ? label : null),
        };
      })}
    />
  );
}

export const Interaction: StoryObj<{ variant: InteractionVariant }> = {
  argTypes: {
    variant: {
      control: "radio",
      options: [
        "Horizontal 1",
        "Horizontal 2",
        "Horizontal 3",
        "Vertical",
        "Grid",
      ],
    },
  },
  args: {
    variant: "Horizontal 2",
  },
  render: (args) => <ControlledToggleDemo variant={args.variant} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstItem = canvas.getByRole("button", { name: "북마크 1" });
    const secondItem = canvas.getByRole("button", { name: "북마크 2" });

    await expect(firstItem).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(firstItem);
    await expect(firstItem).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(secondItem);
    await expect(secondItem).toHaveAttribute("aria-pressed", "true");
    await expect(firstItem).toHaveAttribute("aria-pressed", "false");
  },
};

/** disabled 그룹은 클릭해도 상태가 바뀌지 않는지 검증합니다 */
export const DisabledInteraction: Story = {
  args: {
    items: threeItems,
    orientation: "horizontal",
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstItem = canvas.getByRole("button", { name: "북마크 1" });

    await expect(firstItem).toBeDisabled();
    await expect(firstItem).toHaveAttribute("aria-pressed", "false");
  },
};
