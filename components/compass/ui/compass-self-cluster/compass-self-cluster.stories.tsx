import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import { CompassSelfCluster } from "./compass-self-cluster";

const FIGMA_URL =
  "https://www.figma.com/design/C34HOpbSASmThFA1iYFm8D/%E2%9D%84%EF%B8%8F-GB_Compass?node-id=8003-11059";

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

const EIGHT_SELVES = DEMO_IMAGES.map((image, i) => ({
  image,
  imageAlt: `Self ${i + 1}`,
  growth: (i + 1) * 10,
  estimate: i % 2 === 0,
}));

const meta = {
  title: "Compass/UI/CompassSelfCluster",
  component: CompassSelfCluster,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  // growth-potential 성장 장식(링/커넥터/배지)은 Figma 원본에서도 413×415 프레임
  // 밖으로 최대 ~130px까지 의도적으로 삐져나오도록 클리핑 없이 디자인되어 있다
  // — Storybook 캔버스에서 잘려 보이지 않도록 넉넉한 여백을 둔다.
  decorators: [
    (Story) => (
      <div className="dark bg-[var(--background-default)] p-[160px]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: "radio",
      options: [
        "reach-or-engagement",
        "growth-potential",
        "growth-potential-estimate",
        "growth-potential-error",
      ],
    },
    label: { control: "text" },
    selves: { control: "object" },
  },
  args: {
    variant: "growth-potential-estimate",
    label: "Reach",
    selves: EIGHT_SELVES.slice(0, 3),
    onSelfClick: fn(),
    onEmptySlotClick: fn(),
    onRetry: fn(),
  },
} satisfies Meta<typeof CompassSelfCluster>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
