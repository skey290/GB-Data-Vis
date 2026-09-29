import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, within } from "storybook/test";

import { CompassAnalysis, type CompassAnalysisSelf } from "./compass-analysis";

const FIGMA_URL =
  "https://www.figma.com/design/C34HOpbSASmThFA1iYFm8D/%E2%9D%84%EF%B8%8F-GB_Compass?node-id=8175-10959";

/** Figma mock 데이터(CompassDial/PersonaRadialChart의 DEFAULT_PERSONAS와 동일 값 + 데모 이미지) */
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

/** Controls 패널에서 모든 축을 자유롭게 조합해보는 기본 진입점 */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("1st")).toBeInTheDocument();
  },
};

/**
 * 진입 시 기본 화면 — growth-potential(다이얼 숨김). GNB 근처 토글로
 * reach/engagement/ranking으로 전환되는 흐름의 첫 화면(사용자 확인, 2026-09-28).
 */
export const GrowthPotentialEntry: Story = {
  args: {
    dial: false,
    clusterVariant: "growth-potential",
    selves: DEMO_SELVES,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("65%")).toBeInTheDocument();
    await expect(canvas.getByText("Growth Potential")).toBeInTheDocument();
  },
};

/** GNB 토글 전환 후 — 다이얼(Reach+Engagement+Ranking) + 셀프 클러스터가 겹쳐서 표시 */
export const RankingToggled: Story = {
  args: {
    dial: true,
    type: "reach-and-engagement",
    clusterVariant: "reach-or-engagement",
    label: "Reach",
    selves: DEMO_SELVES,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("1st")).toBeInTheDocument();
    await expect(canvas.getByText("Reach")).toBeInTheDocument();
  },
};

/** Type=reach 다이얼만 + 셀프 3명 */
export const ReachWithSelves: Story = {
  args: {
    type: "reach",
    selves: DEMO_SELVES.slice(0, 3),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("8,340")).toBeInTheDocument();
  },
};

/** dial=false — 다이얼 없이 셀프 클러스터만(Figma 노출 prop 그대로) */
export const DialHidden: Story = {
  args: {
    dial: false,
    selves: DEMO_SELVES.slice(0, 2),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Reach")).toBeInTheDocument();
    await expect(canvas.queryByText("1st")).toBeNull();
  },
};

/**
 * `coachmark` — Growth Potential 진입 시 뜨는 온보딩 코치마크(포커스 셀프의
 * 퍼센트 배지에 붙음). Figma "셀프1개에서 포스팅 분석 조건 충족시"(node
 * 8052:33418) 실측 문구를 그대로 사용.
 */
export const GrowthPotentialWithCoachmark: Story = {
  args: {
    dial: false,
    clusterVariant: "growth-potential",
    selves: DEMO_SELVES,
    coachmark: {
      title: "Growth Potential: 80%",
      description: "Start posting to turn this potential into real reach.",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("65%")).toBeInTheDocument();

    const body = within(document.body);
    await expect(
      await body.findByText("Growth Potential: 80%"),
    ).toBeInTheDocument();
  },
};

/** `coachmark` — Reach 서브메뉴의 온보딩 코치마크(북쪽 칩에 붙음) */
export const ReachWithCoachmark: Story = {
  args: {
    dial: true,
    type: "reach",
    clusterVariant: "reach-or-engagement",
    label: "Most Reached Post",
    selves: DEMO_SELVES,
    coachmark: { title: "Most Reached: 8,340" },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("8,340")).toBeInTheDocument();

    const body = within(document.body);
    await expect(
      await body.findByText("Most Reached: 8,340"),
    ).toBeInTheDocument();
  },
};

/** growth-potential-error — 다이얼 숨김 + 셀프 전부 장식 없이 + Retry */
export const GrowthPotentialErrorState: Story = {
  args: {
    dial: false,
    clusterVariant: "growth-potential-error",
    selves: DEMO_SELVES.slice(0, 1),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText("We couldn't fetch your data"),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Retry")).toBeInTheDocument();
  },
};
