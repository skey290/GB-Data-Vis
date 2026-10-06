import type { Meta, StoryObj } from "@storybook/nextjs";
import { within, expect, fn } from "storybook/test";

import { CompassDetailView } from "./compass-detail-view";

const FIGMA_URL =
  "https://www.figma.com/design/C34HOpbSASmThFA1iYFm8D/%E2%9D%84%EF%B8%8F-GB_Compass?node-id=8003-12444";

const meta = {
  title: "Compass/UI/CompassDetailView",
  component: CompassDetailView,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  argTypes: {
    type: {
      control: "radio",
      options: [
        "default",
        "bls",
        "niche-data",
        "no-experience",
        "trend-data",
        "error",
      ],
    },
  },
  args: {
    type: "default",
    onCreatePostsClick: fn(),
    onRetry: fn(),
    onGrowthFooterClick: fn(),
    onReachFooterClick: fn(),
    onEngagementFooterClick: fn(),
  },
  decorators: [
    // Compass 프로덕트는 항상 어두운 표면 위에서 쓰인다(Figma 원본 스크린샷 전부
    // 어두운 배경) — 다른 compass-* 스토리와 동일하게 `.dark` 스코프로 감싼다.
    (Story) => (
      <div className="dark bg-[var(--background-default)] p-[var(--spacing-8)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CompassDetailView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Data Scientist")).toBeInTheDocument();
  },
};
