import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, userEvent, within } from "storybook/test";

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
}));

/**
 * 장식 없는 셀프도 opacity로만 숨겨질 뿐 항상 DOM에 있다(뚝뚝 끊기지 않는
 * 트랜지션을 위해, 2026-09-28) — 배지 텍스트 존재 여부가 아니라 opacity
 * 클래스로 "보이는지"를 확인한다.
 */
function isBadgeVisible(
  canvas: ReturnType<typeof within>,
  percentText: string,
): boolean {
  const badge = canvas.getByText(percentText);
  const wrapper = badge.closest('[class*="opacity-"]') as HTMLElement | null;
  return wrapper?.className.includes("opacity-100") ?? false;
}

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
  decorators: [
    // growth-potential 성장 장식(링/커넥터/배지)은 Figma 원본에서도 413×415
    // 프레임 밖으로 최대 ~130px까지 의도적으로 삐져나오도록 클리핑 없이
    // 디자인되어 있다(실측 확인, 2026-09-28). Storybook 캔버스에서 잘려
    //보이지 않도록 넉넉한 여백을 둔다 — 실제 프로덕션 배치 시에도 이 여백을
    // 확보해야 한다.
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
    label: {
      control: "text",
    },
  },
  args: {
    variant: "reach-or-engagement",
    label: "Reach",
    selves: EIGHT_SELVES.slice(0, 3),
  },
} satisfies Meta<typeof CompassSelfCluster>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Controls 패널에서 모든 축을 자유롭게 조합해보는 기본 진입점 */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Reach")).toBeInTheDocument();
  },
};

/** 셀프 0명 — 8슬롯 전부 빈 슬롯 */
export const NoSelves: Story = {
  args: { selves: [] },
};

/** 셀프 1명 — 북쪽 1개만 채움 */
export const OneSelf: Story = {
  args: { selves: EIGHT_SELVES.slice(0, 1) },
};

/** 셀프 8명 — 북쪽부터 시계방향으로 전부 채움 */
export const EightSelves: Story = {
  args: { selves: EIGHT_SELVES },
};

/** 채워진 셀프 하나가 active(hover/press) — "Go to Content Studio" */
export const SelfActive: Story = {
  args: { selves: EIGHT_SELVES.slice(0, 3), activeSelfIndex: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Go to")).toBeInTheDocument();
    await expect(canvas.getByText("Content Studio")).toBeInTheDocument();
  },
};

/** 빈 슬롯 하나가 active — "Go to Assets" */
export const EmptySlotActive: Story = {
  args: { selves: EIGHT_SELVES.slice(0, 1), activeEmptyPosition: -45 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Go to")).toBeInTheDocument();
    await expect(canvas.getByText("Assets")).toBeInTheDocument();
  },
};

/** growth-potential — 셀프 1명이면 그 1명이 기본으로 성장 장식됨 */
export const GrowthPotentialSingle: Story = {
  args: {
    variant: "growth-potential",
    selves: [{ ...EIGHT_SELVES[0], growth: 55 }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("55%")).toBeInTheDocument();
  },
};

/** growth-potential — 2명 이상이면 growth 최댓값 셀프만 성장 장식됨 */
export const GrowthPotentialMultiple: Story = {
  args: {
    variant: "growth-potential",
    selves: [
      { ...EIGHT_SELVES[0], growth: 20 },
      { ...EIGHT_SELVES[1], growth: 80 },
      { ...EIGHT_SELVES[2], growth: 45 },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(isBadgeVisible(canvas, "80%")).toBe(true);
    expect(isBadgeVisible(canvas, "20%")).toBe(false);
    expect(isBadgeVisible(canvas, "45%")).toBe(false);
  },
};

/**
 * growth-potential — 비포커스 셀프를 hover하면 장식(링/커넥터/배지)이 그 셀프로
 * 옮겨가 자신의 growth 값을 보여주고, 기본 포커스 셀프의 장식은 사라진다(사용자
 * 지정 인터랙션, 2026-09-28).
 */
export const GrowthPotentialHoverSwitchesDecoration: Story = {
  args: {
    variant: "growth-potential",
    selves: [
      { ...EIGHT_SELVES[0], growth: 20 },
      { ...EIGHT_SELVES[1], growth: 80 },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(isBadgeVisible(canvas, "80%")).toBe(true);
    expect(isBadgeVisible(canvas, "20%")).toBe(false);

    const nonFocusImage = canvas.getByAltText(EIGHT_SELVES[0].imageAlt);
    const wrapper = nonFocusImage.parentElement?.parentElement
      ?.parentElement as HTMLElement;
    await userEvent.hover(wrapper);

    // 포텐셜 배지와 "Go to Content Studio"가 지연 없이 같은 순간에 함께 뜬다
    // (한 박자 늦게 붙는 버그 없음, 사용자 확인 2026-09-28)
    expect(isBadgeVisible(canvas, "20%")).toBe(true);
    expect(isBadgeVisible(canvas, "80%")).toBe(false);
    await expect(canvas.getByText("Go to")).toBeInTheDocument();
    await expect(canvas.getByText("Content Studio")).toBeInTheDocument();

    await userEvent.unhover(wrapper);
    expect(isBadgeVisible(canvas, "80%")).toBe(true);
    await expect(canvas.queryByText("Go to")).toBeNull();
  },
};

/** growth-potential — 빈 슬롯을 hover하면 포커스 셀프의 장식이 전부 사라진다 */
export const GrowthPotentialHoverEmptyHidesDecoration: Story = {
  args: {
    variant: "growth-potential",
    selves: [{ ...EIGHT_SELVES[0], growth: 55 }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(isBadgeVisible(canvas, "55%")).toBe(true);

    const emptySlot = canvas
      .getAllByText("No")[0]
      .closest("div[class*='border-dashed']")?.parentElement
      ?.parentElement as HTMLElement;
    await userEvent.hover(emptySlot);

    expect(isBadgeVisible(canvas, "55%")).toBe(false);

    await userEvent.unhover(emptySlot);
    expect(isBadgeVisible(canvas, "55%")).toBe(true);
  },
};

/**
 * growth-potential-estimate — 배지 색(빨강/흰색)은 항상 그 셀프 자신의 estimate
 * 값을 따르며 hover와 무관하다. "Estimate" 안내 문구만 hover 중인 셀프에서는
 * 절대 뜨지 않고(즉시 "Go to Content Studio"로 대체), 아무것도 hover하지 않은
 * 디폴트 포커스 셀프의 평상시 모습에만 나타난다(사용자 확인, 2026-09-28).
 */
export const GrowthPotentialEstimatePerSelf: Story = {
  args: {
    variant: "growth-potential-estimate",
    selves: [
      { ...EIGHT_SELVES[0], growth: 70, estimate: true },
      { ...EIGHT_SELVES[1], growth: 30, estimate: true },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 디폴트 포커스(A)는 hover 없이도 Estimate(빨강 배지 + 안내 문구)
    await expect(canvas.getByText("70%").className).toContain(
      "text-[var(--text-warning)]",
    );
    await expect(canvas.getByText("Estimate")).toBeInTheDocument();

    const secondImage = canvas.getByAltText(EIGHT_SELVES[1].imageAlt);
    const wrapper = secondImage.parentElement?.parentElement
      ?.parentElement as HTMLElement;
    await userEvent.hover(wrapper);

    // B를 hover하면 자신도 estimate=true라 배지는 그대로 빨강이지만, 안내
    // 문구는 Estimate 대신 곧바로 Content Studio로 전환된다
    await expect(canvas.getByText("30%").className).toContain(
      "text-[var(--text-warning)]",
    );
    await expect(canvas.queryByText("Estimate")).toBeNull();
    await expect(canvas.getByText("Go to")).toBeInTheDocument();
    await expect(canvas.getByText("Content Studio")).toBeInTheDocument();
  },
};

/**
 * growth-potential — 포커스 셀프(장식 있는 셀프)가 동시에 active일 때. 장식
 * (링/커넥터/배지)은 그대로 유지되고 그 위에 blur+오버레이+"Go to Content
 * Studio"가 겹쳐진다(Figma 실측 확인, 2026-09-28 — 장식이 사라지지 않음).
 */
export const GrowthPotentialActive: Story = {
  args: {
    variant: "growth-potential",
    selves: [
      { ...EIGHT_SELVES[0], growth: 20 },
      { ...EIGHT_SELVES[1], growth: 60 },
    ],
    activeSelfIndex: 1,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("60%")).toBeInTheDocument();
    await expect(canvas.getByText("Go to")).toBeInTheDocument();
    await expect(canvas.getByText("Content Studio")).toBeInTheDocument();
  },
};

/**
 * growth-potential — 빈 슬롯이 active일 때("Go to Assets"). 포커스 셀프의
 * 성장 장식은 active 여부와 무관하게 그대로 유지된다(Figma 실측 확인).
 */
export const GrowthPotentialEmptyActive: Story = {
  args: {
    variant: "growth-potential",
    selves: [{ ...EIGHT_SELVES[0], growth: 60 }],
    activeEmptyPosition: -45,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("60%")).toBeInTheDocument();
    await expect(canvas.getByText("Go to")).toBeInTheDocument();
    await expect(canvas.getByText("Assets")).toBeInTheDocument();
  },
};

/** growth-potential-estimate — 포커스 셀프의 배지가 경고색으로 전환 */
export const GrowthPotentialEstimate: Story = {
  args: {
    variant: "growth-potential-estimate",
    selves: [{ ...EIGHT_SELVES[0], growth: 30 }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Estimate")).toBeInTheDocument();
  },
};

/** growth-potential-error — 전역 API 실패, 전부 장식 없이 + Retry CTA */
export const GrowthPotentialError: Story = {
  args: {
    variant: "growth-potential-error",
    selves: [{ ...EIGHT_SELVES[0], growth: 90 }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText("We couldn't fetch your data"),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Retry")).toBeInTheDocument();
    await expect(canvas.queryByText("90%")).toBeNull();
  },
};

/**
 * `coachmark` — Growth Potential 온보딩 코치마크가 붙는 기본 포커스 셀프의 배지.
 * Figma "셀프1개에서 포스팅 분석 조건 충족시"(node 8052:33418) 실측 문구를 그대로 사용.
 */
export const WithCoachmark: Story = {
  args: {
    variant: "growth-potential",
    selves: [{ ...EIGHT_SELVES[0], growth: 80 }],
    coachmark: {
      title: "Growth Potential: 80%",
      description: "Start posting to turn this potential into real reach.",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("80%")).toBeInTheDocument();

    const body = within(document.body);
    await expect(
      await body.findByText("Growth Potential: 80%"),
    ).toBeInTheDocument();
  },
};
