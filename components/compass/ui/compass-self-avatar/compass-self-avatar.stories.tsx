import type { Meta, StoryObj } from "@storybook/nextjs";
import { within, expect } from "storybook/test";

import { CompassSelfAvatar } from "./compass-self-avatar";

const FIGMA_URL =
  "https://www.figma.com/design/C34HOpbSASmThFA1iYFm8D/%E2%9D%84%EF%B8%8F-GB_Compass?node-id=8003-10251";

const DEMO_IMAGES = [
  "/images/personas/entrepreneur.jpg",
  "/images/personas/fashion-editor.jpg",
  "/images/personas/fashionista.jpg",
  "/images/personas/novelist.jpg",
  "/images/personas/self-default.jpg",
  "/images/personas/team-leader.jpg",
  "/images/personas/vegan-chef.jpg",
  "/images/personas/yoga-meditator.jpg",
];

const meta = {
  title: "Compass/UI/CompassSelfAvatar",
  component: CompassSelfAvatar,
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
      options: ["self", "empty", "potential"],
    },
    status: {
      control: "radio",
      options: ["default", "active"],
    },
    error: {
      control: "boolean",
    },
    image: {
      control: "text",
    },
    label: {
      control: "text",
    },
    description: {
      control: "text",
    },
    growth: {
      control: { type: "range", min: 0, max: 100, step: 1 },
    },
    position: {
      control: "select",
      options: [0, 45, 90, 135, 180, 225, 270, 315],
    },
    isDataCollected: {
      control: "boolean",
    },
    decorated: {
      control: "boolean",
    },
  },
  args: {
    variant: "self",
    image: DEMO_IMAGES[0],
    imageAlt: "Entrepreneur",
    growth: 40,
    position: 0,
    isDataCollected: true,
    decorated: true,
  },
} satisfies Meta<typeof CompassSelfAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Potential: Story = {
  args: {
    variant: "potential",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("40%")).toBeInTheDocument();
  },
};
