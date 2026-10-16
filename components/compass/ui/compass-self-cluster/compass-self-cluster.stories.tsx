import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import {
  CompassSelfCluster,
  type CompassSelfClusterProps,
} from "./compass-self-cluster";

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

interface CompassSelfClusterPlaygroundProps extends Omit<
  CompassSelfClusterProps,
  "selves"
> {
  /** 노출할 셀프 수. selves를 이 개수만큼 채워서 렌더링합니다. */
  selfCount: number;
}

function CompassSelfClusterPlayground({
  selfCount,
  ...args
}: CompassSelfClusterPlaygroundProps) {
  return (
    <CompassSelfCluster {...args} selves={EIGHT_SELVES.slice(0, selfCount)} />
  );
}

const meta = {
  title: "Compass/UI/CompassSelfCluster",
  component: CompassSelfClusterPlayground,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  // potential 성장 장식(링/커넥터/배지)은 Figma 원본에서도 413×415 프레임
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
        "potential",
        "potential-estimate",
        "potential-error",
      ],
    },
    label: { control: "text" },
    selfCount: {
      control: { type: "range", min: 1, max: 8, step: 1 },
    },
  },
  args: {
    variant: "potential-estimate",
    label: "Reach",
    selfCount: 3,
    onSelfClick: fn(),
    onEmptySlotClick: fn(),
    onRetry: fn(),
  },
} satisfies Meta<typeof CompassSelfClusterPlayground>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
