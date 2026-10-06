import type { Meta, StoryObj } from "@storybook/nextjs";
import { within, expect } from "storybook/test";

import { CompassAnalysis, type CompassAnalysisSelf } from "./compass-analysis";

const FIGMA_URL =
  "https://www.figma.com/design/C34HOpbSASmThFA1iYFm8D/%E2%9D%84%EF%B8%8F-GB_Compass?node-id=8175-10959";

const DEMO_SELVES: CompassAnalysisSelf[] = [
  {
    id: "data-scientist",
    image: "/images/personas/self-default.jpg",
    imageAlt: "Data Scientist",
    qualifiedReach: 8340,
    engagementIntensity: 14.3,
    growth: 55,
  },
  {
    id: "yoga-meditator",
    image: "/images/personas/yoga-meditator.jpg",
    imageAlt: "Yoga Meditator",
    qualifiedReach: 6453,
    engagementIntensity: 1.8,
    growth: 20,
  },
  {
    id: "novelist",
    image: "/images/personas/novelist.jpg",
    imageAlt: "Novelist",
    qualifiedReach: 4784,
    engagementIntensity: 0.4,
    growth: 30,
  },
  {
    id: "entrepreneur",
    image: "/images/personas/entrepreneur.jpg",
    imageAlt: "Entrepreneur",
    qualifiedReach: 978,
    engagementIntensity: 2.0,
    growth: 45,
  },
  {
    id: "fashionista",
    image: "/images/personas/fashionista.jpg",
    imageAlt: "Fashionista",
    qualifiedReach: 6782,
    engagementIntensity: 0.3,
    growth: 10,
  },
  {
    id: "fashion-editor",
    image: "/images/personas/fashion-editor.jpg",
    imageAlt: "Fashion Editor",
    qualifiedReach: 125,
    engagementIntensity: 3.7,
    growth: 65,
  },
  {
    id: "team-leader",
    image: "/images/personas/team-leader.jpg",
    imageAlt: "Team Leader",
    qualifiedReach: 8006,
    engagementIntensity: 0.5,
    growth: 15,
  },
  {
    id: "vegan-chef",
    image: "/images/personas/vegan-chef.jpg",
    imageAlt: "Vegan Chef",
    qualifiedReach: 5431,
    engagementIntensity: 1.9,
    growth: 25,
  },
];

const meta = {
  title: "Compass/UI/CompassAnalysis",
  component: CompassAnalysis,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  decorators: [
    // CompassDial 눈금선이 --border-static-white 고정이라 항상 어두운 표면
    // 위에서만 보인다(compass-dial.stories.tsx와 동일 규칙).
    (Story) => (
      <div className="dark bg-[var(--background-default)] p-[var(--spacing-24)]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    clusterVariant: {
      control: "radio",
      options: [
        "reach-or-engagement",
        "growth-potential",
        "growth-potential-estimate",
        "growth-potential-error",
      ],
    },
    type: {
      control: "radio",
      options: ["reach", "engagement", "reach-and-engagement"],
    },
    dial: { control: "boolean" },
    dataCollected: { control: "boolean" },
    label: { control: "text" },
  },
  args: {
    dial: true,
    type: "reach-and-engagement",
    dataCollected: true,
    clusterVariant: "reach-or-engagement",
    label: "Reach",
    selves: DEMO_SELVES,
  },
} satisfies Meta<typeof CompassAnalysis>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("1st")).toBeInTheDocument();
  },
};
