import type { Meta, StoryObj } from "@storybook/nextjs";
import { within, expect } from "storybook/test";

import { CompassDialTick } from "./compass-dial-tick";

const FIGMA_URL =
  "https://www.figma.com/design/C34HOpbSASmThFA1iYFm8D/%E2%9D%84%EF%B8%8F-GB_Compass?node-id=8003-8237";

const meta = {
  title: "Compass/UI/CompassDialTick",
  component: CompassDialTick,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  decorators: [
    // 다이얼은 항상 어두운 표면 위에 그려지므로(Figma 원본 스크린샷 전부 검정
    // 배경) `.dark` 스코프로 강제 — 컴포넌트 자체를 다크 전용으로 바꾸는 게
    // 아니라 Storybook 데코레이터에서만 배경을 어둡게 맞춘다.
    (Story) => (
      <div className="dark bg-[var(--background-default)] p-[var(--spacing-24)]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    type: {
      control: "radio",
      options: ["default", "text", "circle"],
    },
    direction: {
      control: "radio",
      options: ["outward", "inward"],
    },
    muted: {
      control: "boolean",
    },
    textArrangement: {
      control: "radio",
      options: ["cross", "parallel", "parallel-reverse", "cross-reverse"],
    },
    size: {
      control: { type: "range", min: 1, max: 5, step: 1 },
    },
    label: {
      control: "text",
    },
  },
  args: {
    type: "text",
    direction: "outward",
    muted: false,
    textArrangement: "cross",
    size: 5,
    label: "6/1",
  },
} satisfies Meta<typeof CompassDialTick>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("6/1")).toBeInTheDocument();
  },
};
