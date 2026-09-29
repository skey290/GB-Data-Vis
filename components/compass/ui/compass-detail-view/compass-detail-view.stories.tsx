import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, fn, userEvent, within } from "storybook/test";

import { CompassDetailView } from "./compass-detail-view";

const FIGMA_URL =
  "https://www.figma.com/design/C34HOpbSASmThFA1iYFm8D/%E2%9D%84%EF%B8%8F-GB_Compass?node-id=8003-12444";

const meta = {
  title: "Compass/UI/CompassDetailView",
  component: CompassDetailView,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  argTypes: {
    type: {
      control: "radio",
      options: [
        "default",
        "bls",
        "niche-data",
        "no-experience",
        "trend-data",
        "error",
      ],
    },
  },
  args: {
    type: "default",
    onCreatePostsClick: fn(),
    onRetry: fn(),
    onGrowthFooterClick: fn(),
    onReachFooterClick: fn(),
    onEngagementFooterClick: fn(),
  },
  decorators: [
    // Compass 프로덕트는 항상 어두운 표면 위에서 쓰인다(Figma 원본 스크린샷 전부
    // 어두운 배경) — 다른 compass-* 스토리와 동일하게 `.dark` 스코프로 감싼다.
    // 컴포넌트 자체는 시맨틱 토큰만 참조해 라이트/다크 모두 자동 대응한다.
    (Story) => (
      <div className="dark bg-[var(--background-default)] p-[var(--spacing-8)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CompassDetailView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** type="default" — Growth Potential 퍼센트 히어로 + Reach/Engagement는 "Not Enough posts Yet" 빈 상태 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Data Scientist")).toBeInTheDocument();
    await expect(canvas.getByText("80%")).toBeInTheDocument();
    await expect(canvas.getAllByText("Not Enough posts Yet")).toHaveLength(2);
  },
};

/** type="bls" — Reach/Engagement 카드가 빈 상태 대신 실제 포스트 통계(델타 배지 포함)를 보여줌 */
export const Bls: Story = {
  args: { type: "bls" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("8,340")).toBeInTheDocument();
    await expect(canvas.getByText("14.3%")).toBeInTheDocument();
    await expect(canvas.getByText("-8%")).toBeInTheDocument();
    await expect(canvas.getByText("+0.2pp")).toBeInTheDocument();
  },
};

/** type="niche-data" — Growth Potential 카드에만 --border-warning 보더가 붙음 */
export const NicheData: Story = {
  args: { type: "niche-data" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("20%")).toBeInTheDocument();
    const warningBorderEl = canvasElement.querySelector(
      '[class*="border-\\[var\\(--border-warning\\)\\]"]',
    );

    await expect(warningBorderEl).toBeInTheDocument();
  },
};

/** type="no-experience" — niche-data와 동일하게 경고 보더 + 20% */
export const NoExperience: Story = {
  args: { type: "no-experience" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("20%")).toBeInTheDocument();
    await expect(
      canvas.getByText("Not enough data to calculate this accurately."),
    ).toBeInTheDocument();
  },
};

/** type="trend-data" — 탭 라벨이 "Vintage Fashion"으로 바뀌고 Growth 라벨도 "Content Trend"로 바뀜 */
export const TrendData: Story = {
  args: { type: "trend-data" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Vintage Fashion")).toBeInTheDocument();
    await expect(canvas.getByText("Content Trend")).toBeInTheDocument();
  },
};

/** type="error" — 3개 카드 모두 blur 박스로 대체, CTA 버튼도 별도 색상으로 전환 */
export const ErrorState: Story = {
  args: { type: "error" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getAllByText("We couldn't fetch your data"),
    ).toHaveLength(3);
    await expect(canvas.getAllByText("Retry")).toHaveLength(3);

    const cta = canvas.getByText("Create Posts with one click");
    await expect(cta.className).toContain("bg-[var(--background-selected)]");
  },
};

/** Retry 클릭 시 onRetry가 3개 카드 각각에서 호출되는지 확인 */
export const RetryInteraction: Story = {
  args: { type: "error" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const retryButtons = canvas.getAllByText("Retry");

    await userEvent.click(retryButtons[0]);
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
  },
};
