import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, within } from "storybook/test";

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

/** Controls 패널에서 모든 축을 자유롭게 조합해보는 기본 진입점 */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("40%")).toBeInTheDocument();
  },
};

/** growth=0 — 링/커넥터/배지 전부 숨김, 아바타만 표시 */
export const NoGrowth: Story = {
  args: { growth: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByText("0%")).toBeNull();
  },
};

/** estimate=true — 배지는 경고색으로, 아바타는 블러+"Estimate (Lack of Data)" */
export const Estimate: Story = {
  args: { growth: 20, estimate: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("20%").className).toContain(
      "text-[var(--text-warning)]",
    );
    await expect(canvas.getByText("Estimate")).toBeInTheDocument();
  },
};

/** status="active" — 아바타에 "Go to Content Studio" 오버레이, estimate는 무시됨 */
export const Active: Story = {
  args: { growth: 60, status: "active", estimate: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Go to")).toBeInTheDocument();
    await expect(canvas.queryByText("Estimate")).toBeNull();
  },
};

/** variant="empty" — Growth Potential 다이얼의 셀프 미배정 슬롯 */
export const Empty: Story = {
  args: { variant: "empty", image: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("No")).toBeInTheDocument();
  },
};

/** 8방향(Position)을 한 화면에서 비교 — 배치 각도(-position) 검증용 */
export const AllPositions: Story = {
  args: { growth: 30 },
  render: (args) => (
    <div className="relative size-[300px]">
      {([135, 90, 45, 0, -45, -90, -135, -180] as const).map((position) => (
        <div
          key={position}
          className="absolute top-1/2 left-1/2"
          style={{ transform: "translate(-50%, -50%)" }}
        >
          <div
            className="absolute top-1/2 left-1/2 h-0 w-0"
            style={{ transform: `rotate(${-position}deg)` }}
          >
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: -110 }}
            >
              <CompassGrowthAvatar {...args} position={position} />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};

/**
 * `coachmark` — Growth Potential 온보딩 코치마크가 붙는 퍼센트 배지. Figma
 * "셀프1개에서 포스팅 분석 조건 충족시"(node 8052:33418) 실측 문구를 그대로 사용.
 */
export const WithCoachmark: Story = {
  args: {
    growth: 80,
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

/** growth 0→100 연속 보간에 따른 가이드 링 크기 변화 */
export const GrowthScale: Story = {
  args: {},
  render: () => (
    <div className="flex items-end gap-[var(--spacing-8)]">
      {[10, 30, 50, 70, 90].map((growth) => (
        <CompassGrowthAvatar
          key={growth}
          growth={growth}
          position={0}
          image={DEMO_IMAGE}
        />
      ))}
    </div>
  ),
};
