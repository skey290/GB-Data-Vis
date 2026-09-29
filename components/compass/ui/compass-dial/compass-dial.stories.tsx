import type { Meta, StoryObj } from "@storybook/nextjs";
import type * as React from "react";
import { expect, within } from "storybook/test";

import { CompassDial } from "./compass-dial";
import type { CompassDialSelf, CompassDialType } from "./compass-dial-utils";

const FIGMA_URL =
  "https://www.figma.com/design/C34HOpbSASmThFA1iYFm8D/%E2%9D%84%EF%B8%8F-GB_Compass?node-id=8003-8878";

/** Figma mock 데이터(PersonaRadialChart의 DEFAULT_PERSONAS와 동일 값) */
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

/**
 * `selves`는 객체 배열이라 Storybook Controls로 직접 조작하기 어렵습니다. 대신
 * Self 8명치 Reach/Engagement 값을 개별 숫자 컨트롤로 풀고, 렌더 직전에
 * `argsToSelves`로 배열을 조립합니다(코디네이터 지시, 2026-09-28). 이 때문에 이
 * 파일의 `Meta`는 `CompassDialProps`가 아니라 이 확장 args 타입을 기준으로 합니다.
 */
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
    // 항상 어두운 표면 위에서만 보입니다. Figma 원본 스크린샷도 전부 검정 배경.
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

/** Controls 패널에서 type/selfCount/dataCollected/self1~8 값을 자유롭게 조합해보는 기본 진입점 */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // type=reach 기본값 — 북쪽은 진한 Badge, 나머지는 muted 텍스트
    await expect(canvas.getByText("8,340")).toBeInTheDocument();
    await expect(canvas.getByText("6,782")).toBeInTheDocument();
  },
};

/** Type=reach, Self=8 — 바깥 링만, 라벨은 천단위 콤마 정수 */
export const ReachAllSelves: Story = {
  args: { type: "reach" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("8,340")).toBeInTheDocument();
    await expect(canvas.getByText("125")).toBeInTheDocument();
  },
};

/** Type=engagement, Self=8 — 안쪽 링만, 라벨은 소수점 1자리 % */
export const EngagementAllSelves: Story = {
  args: { type: "engagement" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("14.3%")).toBeInTheDocument();
    await expect(canvas.getByText("0.3%")).toBeInTheDocument();
  },
};

/**
 * Type=reach-and-engagement, Self=8 — 두 링 모두. 바깥 링에만 Ranking 서수
 * 배지("1st"~"8th")가 붙고, 안쪽 링은 라벨 없이 크기만 Engagement 값을 반영합니다.
 */
export const RankingAllSelves: Story = {
  args: { type: "reach-and-engagement" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("1st")).toBeInTheDocument();
    await expect(canvas.getByText("8th")).toBeInTheDocument();
    // Reach/Engagement 원값은 어느 링에도 라벨로 노출되지 않는다
    await expect(canvas.queryByText("8,340")).toBeNull();
    await expect(canvas.queryByText("14.3%")).toBeNull();
  },
};

/**
 * Self=1, Data Collected=true — Figma 실측 확인 사항: "No Data Collected"가
 * 아니라 그 1명의 실제 값이 size5(최대 크기)로 표시됩니다.
 */
export const SingleSelfWithData: Story = {
  args: { type: "reach", selfCount: 1 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("8,340")).toBeInTheDocument();
    await expect(canvas.queryByText("No Data Collected")).toBeNull();
  },
};

/** Data Collected=false — Self 수와 무관하게 북쪽에 작은 "No Data Collected" 배지만 */
export const NoDataCollected: Story = {
  args: { type: "reach", dataCollected: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("No Data Collected")).toBeInTheDocument();
    await expect(canvas.queryByText("8,340")).toBeNull();
  },
};

/**
 * Type=reach-and-engagement, Self=1 — Data Collected 값과 무관하게 항상
 * "No Data Collected"(순위는 최소 2명부터 의미가 있음, `GB_Compass.md` 3부 참고).
 */
export const RankingLockedSingleSelf: Story = {
  args: { type: "reach-and-engagement", selfCount: 1, dataCollected: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("No Data Collected")).toBeInTheDocument();
  },
};

/** Self=0 — 라벨 없이 전부 장식용 눈금만 */
export const NoSelves: Story = {
  args: { type: "reach", selfCount: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByText("No Data Collected")).toBeNull();
    await expect(canvas.queryByText("8,340")).toBeNull();
  },
};

/**
 * `coachmark` — Reach 온보딩 코치마크가 북쪽(슬롯0) 칩에 붙는다. Figma
 * "셀프1개에서 포스팅 분석 조건 충족시"(node 8052:33418) 실측 문구를 그대로 사용.
 * `coachmark`는 이 스토리 파일의 확장 args 타입(`CompassDialStoryArgs`)에
 * 없는 실제 `CompassDialProps` 전용 필드라, meta의 `render`를 거치지 않고 이
 * 스토리에서만 직접 `CompassDial`을 렌더링한다.
 */
export const ReachWithCoachmark: Story = {
  render: () => (
    <CompassDial
      type="reach"
      selves={DEFAULT_SELVES}
      coachmark={{ title: "Most Reached: 8,340" }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("8,340")).toBeInTheDocument();

    const body = within(document.body);
    await expect(
      await body.findByText("Most Reached: 8,340"),
    ).toBeInTheDocument();
  },
};
