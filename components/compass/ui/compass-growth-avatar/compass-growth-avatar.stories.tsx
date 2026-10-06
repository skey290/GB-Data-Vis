import type { Meta, StoryObj } from "@storybook/nextjs";
import { within, expect } from "storybook/test";

import { CompassGrowthAvatar } from "./compass-growth-avatar";

const FIGMA_URL =
  "https://www.figma.com/design/C34HOpbSASmThFA1iYFm8D/%E2%9D%84%EF%B8%8F-GB_Compass?node-id=8003-10382";

const DEMO_IMAGE = "/images/personas/entrepreneur.jpg";

const meta = {
  title: "Compass/UI/CompassGrowthAvatar",
  component: CompassGrowthAvatar,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  decorators: [
    (Story) => (
      <div className="dark flex size-[400px] items-center justify-center bg-[var(--background-default)]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: "radio",
      options: ["self", "empty"],
    },
    growth: {
      control: { type: "range", min: 0, max: 100, step: 1 },
    },
    position: {
      control: "select",
      options: [135, 90, 45, 0, -45, -90, -135, -180],
    },
    status: {
      control: "radio",
      options: ["default", "active"],
    },
    estimate: {
      control: "boolean",
    },
    image: {
      control: "text",
    },
  },
  args: {
    variant: "self",
    growth: 40,
    position: 0,
    status: "default",
    estimate: false,
    image: DEMO_IMAGE,
    imageAlt: "Entrepreneur",
  },
} satisfies Meta<typeof CompassGrowthAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("40%")).toBeInTheDocument();
  },
};
