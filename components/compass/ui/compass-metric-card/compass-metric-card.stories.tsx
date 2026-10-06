import type { Meta, StoryObj } from "@storybook/nextjs";
import { within, expect, fn } from "storybook/test";

import { CompassMetricCard } from "./compass-metric-card";

const FIGMA_URL =
  "https://www.figma.com/design/C34HOpbSASmThFA1iYFm8D/%E2%9D%84%EF%B8%8F-GB_Compass?node-id=8003-12444";

const meta = {
  title: "Compass/UI/CompassMetricCard",
  component: CompassMetricCard,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  argTypes: {
    state: {
      control: "radio",
      options: ["default", "warning", "error"],
    },
    title: { control: "text" },
    badgeLabel: { control: "text" },
    description: { control: "text" },
  },
  args: {
    title: "Growth Potential",
    badgeLabel: "Become Recommended",
    description:
      "It reflects how promising your career background is, based on 'official U.S. labor statistics' and your experience.",
    state: "default",
    children: <p className="text-5xl-black text-[var(--text-default)]">80%</p>,
    onFooterLinkClick: fn(),
  },
  decorators: [
    // Compass 프로덕트는 실제로 항상 어두운 표면 위에서 쓰인다(Figma 원본 스크린샷
    // 전부 어두운 배경) — 다른 compass-* 컴포넌트 스토리와 동일하게 `.dark` 스코프로 감싼다.
    (Story) => (
      <div className="dark w-[604px] bg-[var(--background-default)] p-[var(--spacing-8)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CompassMetricCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Growth Potential")).toBeInTheDocument();
    await expect(canvas.getByText("80%")).toBeInTheDocument();
  },
};
