import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, within } from "storybook/test";

import { CompassSphere } from "./compass-sphere";

const FIGMA_URL =
  "https://www.figma.com/make/HdX0Ax0ci2ll4V2YMDsBTJ/%F0%9F%93%A6-GB_Interaction_Compass-Data-Visualization";

const meta = {
  title: "Compass/UI/CompassSphere",
  component: CompassSphere,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  decorators: [
    // 컴포넌트 자체가 size-full이라 데모용으로 고정 높이 컨테이너가 필요하다.
    (Story) => (
      <div className="h-[480px] w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CompassSphere>;

export default meta;

type Story = StoryObj<typeof meta>;

/** three.js 캔버스가 마운트되고, 기본 배지 라벨이 DOM에 존재하는지 확인 */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const mount = canvasElement.querySelector("canvas");
    await expect(mount).toBeInTheDocument();
    await expect(canvas.getByText("Gabrielle.ai")).toBeInTheDocument();
  },
};
