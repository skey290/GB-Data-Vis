import type { Meta, StoryObj } from "@storybook/nextjs";

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
      <div className="dark bg-[var(--background-default)] p-[var(--spacing-24)]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: "radio",
      options: ["self", "empty", "guide"],
    },
    guideSize: {
      control: { type: "range", min: 100, max: 300, step: 50 },
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
  },
  args: {
    variant: "self",
    image: DEMO_IMAGES[0],
    imageAlt: "Entrepreneur",
  },
} satisfies Meta<typeof CompassSelfAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
