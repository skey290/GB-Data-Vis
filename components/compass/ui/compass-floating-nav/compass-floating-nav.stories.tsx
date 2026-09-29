import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, userEvent, within } from "storybook/test";

import {
  CompassFloatingNav,
  type CompassFloatingNavItemId,
} from "./compass-floating-nav";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%E2%9D%84%EF%B8%8F-GB_Design-System--Atom-?node-id=601-467";

const meta = {
  title: "Compass/UI/CompassFloatingNav",
  component: CompassFloatingNav,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  decorators: [
    (Story) => (
      <div className="dark bg-[var(--color-neutral-950)] p-[var(--spacing-8)]">
        <Story />
      </div>
    ),
  ],
  args: {
    activeId: "compass",
  },
} satisfies Meta<typeof CompassFloatingNav>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const active = canvas.getByRole("tab", { name: "Compass" });
    await expect(active).toHaveAttribute("aria-selected", "true");
  },
};

/** Home은 아이콘 전용이라 접근성 라벨("Home")로 조회 */
export const HomeActive: Story = {
  args: { activeId: "home" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("tab", { name: "Home" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  },
};

export const Disabled: Story = {
  args: { activeId: "compass", disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("tab", { name: "Compass" })).toBeDisabled();
    await expect(canvas.getByRole("tab", { name: "Compass" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  },
};

/** 클릭으로 활성 탭이 바뀌는지 확인 (실제 내비게이션은 상위에서 처리) */
export const Interactive: Story = {
  render: function Render(args) {
    const [activeId, setActiveId] = useState<CompassFloatingNavItemId>(
      args.activeId,
    );
    return (
      <CompassFloatingNav
        {...args}
        activeId={activeId}
        onItemSelect={setActiveId}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("tab", { name: "Assets" }));
    await expect(canvas.getByRole("tab", { name: "Assets" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  },
};
