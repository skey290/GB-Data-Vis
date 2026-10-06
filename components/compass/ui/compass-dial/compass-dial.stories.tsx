import type { Meta, StoryObj } from "@storybook/nextjs";
import type * as React from "react";
import { within, expect } from "storybook/test";

import { CompassDial } from "./compass-dial";
import type { CompassDialSelf, CompassDialType } from "./compass-dial-utils";

const FIGMA_URL =
  "https://www.figma.com/design/C34HOpbSASmThFA1iYFm8D/%E2%9D%84%EF%B8%8F-GB_Compass?node-id=8003-8878";

const DEFAULT_SELVES: CompassDialSelf[] = [
  { id: "data-scientist", qualifiedReach: 8340, engagementIntensity: 14.3 },
  { id: "yoga-meditator", qualifiedReach: 6453, engagementIntensity: 1.8 },
  { id: "novelist", qualifiedReach: 4784, engagementIntensity: 0.4 },
  { id: "entrepreneur", qualifiedReach: 978, engagementIntensity: 2.0 },
  { id: "fashionista", qualifiedReach: 6782, engagementIntensity: 0.3 },
  { id: "fashion-editor", qualifiedReach: 125, engagementIntensity: 3.7 },
  { id: "team-leader", qualifiedReach: 8006, engagementIntensity: 0.5 },
  { id: "vegan-chef", qualifiedReach: 5431, engagementIntensity: 1.9 },
];

// `selves`는 객체 배열이라 Storybook Controls로 직접 조작하기 어려워, Self 8명치
// Reach/Engagement 값을 개별 숫자 컨트롤로 풀고 렌더 직전에 argsToSelves로 조립한다.
interface CompassDialStoryArgs {
  type: CompassDialType;
  dataCollected: boolean;
  selfCount: number;
  self1Reach: number;
  self1Engagement: number;
  self2Reach: number;
  self2Engagement: number;
  self3Reach: number;
  self3Engagement: number;
  self4Reach: number;
  self4Engagement: number;
  self5Reach: number;
  self5Engagement: number;
  self6Reach: number;
  self6Engagement: number;
  self7Reach: number;
  self7Engagement: number;
  self8Reach: number;
  self8Engagement: number;
}

function argsToSelves(args: CompassDialStoryArgs): CompassDialSelf[] {
  const reach = [
    args.self1Reach,
    args.self2Reach,
    args.self3Reach,
    args.self4Reach,
    args.self5Reach,
    args.self6Reach,
    args.self7Reach,
    args.self8Reach,
  ];
  const engagement = [
    args.self1Engagement,
    args.self2Engagement,
    args.self3Engagement,
    args.self4Engagement,
    args.self5Engagement,
    args.self6Engagement,
    args.self7Engagement,
    args.self8Engagement,
  ];

  return Array.from({ length: args.selfCount }, (_, i) => ({
    id: DEFAULT_SELVES[i]?.id ?? `self-${i + 1}`,
    qualifiedReach: reach[i],
    engagementIntensity: engagement[i],
  }));
}

function numberControl(description: string) {
  return { control: "number", description } as const;
}

const meta = {
  title: "Compass/UI/CompassDial",
  // CompassDialProps는 `selves` 배열 하나뿐이라 Controls로 직접 조작하기
  // 어려워, 실제 컴포넌트 대신 아래 확장 args 타입을 기준으로 문서화합니다.
  component:
    CompassDial as unknown as React.ComponentType<CompassDialStoryArgs>,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  decorators: [
    // 눈금선이 `--border-static-white` 고정이라(CompassDialTick 참고) 다이얼은
    // 항상 어두운 표면 위에서만 보입니다.
    (Story) => (
      <div className="dark bg-[var(--background-default)] p-[var(--spacing-24)]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    type: {
      control: "radio",
      options: ["reach", "engagement", "reach-and-engagement"],
    },
    dataCollected: { control: "boolean" },
    selfCount: {
      control: { type: "range", min: 0, max: 8, step: 1 },
      description:
        "실제로 렌더링할 Self 수 (0~8). 나머지 앵커는 장식용 눈금이 됩니다.",
    },
    self1Reach: numberControl("Self 1 Qualified Reach"),
    self1Engagement: numberControl("Self 1 Engagement Intensity (%)"),
    self2Reach: numberControl("Self 2 Qualified Reach"),
    self2Engagement: numberControl("Self 2 Engagement Intensity (%)"),
    self3Reach: numberControl("Self 3 Qualified Reach"),
    self3Engagement: numberControl("Self 3 Engagement Intensity (%)"),
    self4Reach: numberControl("Self 4 Qualified Reach"),
    self4Engagement: numberControl("Self 4 Engagement Intensity (%)"),
    self5Reach: numberControl("Self 5 Qualified Reach"),
    self5Engagement: numberControl("Self 5 Engagement Intensity (%)"),
    self6Reach: numberControl("Self 6 Qualified Reach"),
    self6Engagement: numberControl("Self 6 Engagement Intensity (%)"),
    self7Reach: numberControl("Self 7 Qualified Reach"),
    self7Engagement: numberControl("Self 7 Engagement Intensity (%)"),
    self8Reach: numberControl("Self 8 Qualified Reach"),
    self8Engagement: numberControl("Self 8 Engagement Intensity (%)"),
  },
  args: {
    type: "reach",
    dataCollected: true,
    selfCount: 8,
    self1Reach: 8340,
    self1Engagement: 14.3,
    self2Reach: 6453,
    self2Engagement: 1.8,
    self3Reach: 4784,
    self3Engagement: 0.4,
    self4Reach: 978,
    self4Engagement: 2.0,
    self5Reach: 6782,
    self5Engagement: 0.3,
    self6Reach: 125,
    self6Engagement: 3.7,
    self7Reach: 8006,
    self7Engagement: 0.5,
    self8Reach: 5431,
    self8Engagement: 1.9,
  },
  render: (args) => (
    <CompassDial
      type={args.type}
      dataCollected={args.dataCollected}
      selves={argsToSelves(args)}
    />
  ),
} satisfies Meta<CompassDialStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("8,340")).toBeInTheDocument();
    await expect(canvas.getByText("6,782")).toBeInTheDocument();
  },
};
