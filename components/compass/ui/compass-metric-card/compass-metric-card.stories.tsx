import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, fn, userEvent, within } from "storybook/test";

import { CompassMetricCard } from "./compass-metric-card";

const FIGMA_URL =
  "https://www.figma.com/design/C34HOpbSASmThFA1iYFm8D/%E2%9D%84%EF%B8%8F-GB_Compass?node-id=8003-12444";

const meta = {
  title: "Compass/UI/CompassMetricCard",
  component: CompassMetricCard,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  argTypes: {
    state: {
      control: "radio",
      options: ["default", "warning", "error"],
    },
  },
  args: {
    title: "Growth Potential",
    badgeLabel: "Become Recommended",
    description:
      "It reflects how promising your career background is, based on 'official U.S. labor statistics' and your experience.",
    state: "default",
    onFooterLinkClick: fn(),
  },
  decorators: [
    // Compass 프로덕트는 실제로 항상 어두운 표면 위에서 쓰인다(Figma 원본 스크린샷
    // 전부 어두운 배경) — 다른 compass-* 컴포넌트 스토리(compass-self-cluster 등)와
    // 동일하게 `.dark` 스코프로 감싼다. 컴포넌트 자체는 시맨틱 토큰만 참조해
    // 라이트/다크 모두 자동 대응한다.
    (Story) => (
      <div className="dark w-[604px] bg-[var(--background-default)] p-[var(--spacing-8)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CompassMetricCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본 셸 — 설명 문단 + 하단 "Update in Know thyself" 링크까지 전부 노출 */
export const Default: Story = {
  args: {
    children: <p className="text-5xl-black text-[var(--text-default)]">80%</p>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Growth Potential")).toBeInTheDocument();
    await expect(canvas.getByText("Become Recommended")).toBeInTheDocument();
    await expect(canvas.getByText("80%")).toBeInTheDocument();
    await expect(
      canvas.getByText("Update in Know thyself"),
    ).toBeInTheDocument();
  },
};

/** state="warning" — niche data/no experience 타입에서 붙는 `--border-warning` 보더 */
export const Warning: Story = {
  args: {
    state: "warning",
    children: <p className="text-5xl-black text-[var(--text-default)]">20%</p>,
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.firstElementChild?.className).toContain(
      "border-[var(--border-warning)]",
    );
  },
};

/**
 * state="error" — 하단 링크는 항상 사라진다. 설명 문단은 `state`가 아니라
 * `description` prop 유무로만 결정되므로(Figma 실측: Qualified Reach/Engagement
 * Intensity 카드는 error에서도 설명 문단이 남아있음), 여기서는 Growth Potential
 * 카드의 실제 error 사용례처럼 `description`을 아예 넘기지 않는다.
 */
export const ErrorState: Story = {
  args: {
    state: "error",
    description: undefined,
    children: (
      <p className="text-sm-medium text-[var(--text-default)]">
        We couldn&apos;t fetch your data
      </p>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByText("Update in Know thyself"),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByText(
        "It reflects how promising your career background is, based on 'official U.S. labor statistics' and your experience.",
      ),
    ).not.toBeInTheDocument();
  },
};

/**
 * state="error" + description — Qualified Reach/Engagement Intensity 카드처럼
 * error에서도 설명 문단은 그대로 유지되고 하단 링크만 사라지는 실제 사용례
 */
export const ErrorStateWithDescription: Story = {
  args: {
    title: "Qualified Reach",
    badgeLabel: "Become Known",
    description:
      "An estimate of how many people your content actually reached, not just how many times it was shown.",
    state: "error",
    children: (
      <p className="text-sm-medium text-[var(--text-default)]">
        We couldn&apos;t fetch your data
      </p>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText(
        "An estimate of how many people your content actually reached, not just how many times it was shown.",
      ),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByText("Update in Know thyself"),
    ).not.toBeInTheDocument();
  },
};

/** 하단 링크 클릭 시 onFooterLinkClick이 호출되는지 확인 */
export const FooterLinkInteraction: Story = {
  args: {
    children: <p className="text-5xl-black text-[var(--text-default)]">80%</p>,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByText("Update in Know thyself");

    await userEvent.click(link);
    await expect(args.onFooterLinkClick).toHaveBeenCalledTimes(1);
  },
};

/**
 * 2026-09-28 버그 수정 검증 — 하단 링크는 (1) 카드 우측에 정렬되어야 하고
 * (2) 기본색(`--text-subtle`)과 hover색(`--text-emphasis`)이 달라야 한다.
 * Figma 좌표 실측(node 8003:12465, 부모 8003:12449)으로 우측 정렬을 확인했고,
 * hover색은 Figma에 명시된 값이 없어 이 프로젝트의 기존 컨벤션(Tabs 비선택
 * 탭과 동일한 subtle→emphasis 패턴)을 따른 것 — 위 compass-metric-card.tsx의
 * doc 주석 참고.
 */
export const FooterLinkAlignmentAndHover: Story = {
  args: {
    children: <p className="text-5xl-black text-[var(--text-default)]">80%</p>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByText("Update in Know thyself");
    const alignmentWrapper = link.closest('[class*="flex-col"]');

    await expect(alignmentWrapper?.className).toContain("items-end");
    await expect(alignmentWrapper?.className).not.toContain("items-center");

    await expect(link.className).toContain("text-[var(--text-subtle)]");
    await expect(link.className).toContain("hover:text-[var(--text-emphasis)]");
    // 기본색과 hover색이 실제로 달라야 함(버그 재발 방지 — 둘 다 같은 값이면
    // hover해도 시각적으로 아무 변화가 없다).
    await expect(link.className).not.toContain(
      "text-[var(--text-subtle)] hover:text-[var(--text-subtle)]",
    );
  },
};
