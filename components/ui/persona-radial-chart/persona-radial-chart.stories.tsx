import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, userEvent, within } from "storybook/test";

import { PersonaRadialChart } from "./persona-radial-chart";

const FIGMA_URL =
  "https://www.figma.com/design/PrsHuyyra9LzqqrDwmrB5P/%F0%9F%93%8C-GB_Design-System-v2.2?node-id=5526-7658";

/**
 * Figma 원본은 `Self(1|8) × Posting(true|false) × Hover(5종)` = 15개 variant이고,
 * 아래 story들은 그 조합을 그대로 재현합니다. `hover` prop을 넘기면 제어 컴포넌트가
 * 되어 마우스와 무관하게 해당 variant가 고정됩니다 (`Interactive` story만 예외).
 */
const meta = {
  title: "UI/PersonaRadialChart",
  component: PersonaRadialChart,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  decorators: [
    (Story) => (
      /*
       * `.dark`를 직접 걸어 다크 팔레트로 고정합니다. Figma 원본이 다크 배경에만
       * 그려져 있고 값 밴드가 흰색 20%라, 라이트 배경에서는 거의 보이지 않습니다.
       * (이 프로젝트는 backgrounds addon이 아니라 `.dark` 클래스로 테마를 바꿉니다.)
       * 배지가 500×500 프레임 바깥으로 넘쳐 배치되므로 여백도 함께 둡니다.
       */
      <div className="dark bg-background p-[var(--spacing-padding-24)]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    selfCount: {
      control: "radio",
      options: [1, 8],
    },
    posting: {
      control: "boolean",
    },
    hover: {
      control: "radio",
      options: ["default", "growth", "reach", "engagement", "self"],
    },
  },
  args: {
    selfCount: 8,
    posting: true,
    hover: "default",
  },
} satisfies Meta<typeof PersonaRadialChart>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Self=8 / Posting=true / Hover=default — 8명 전원의 3개 링이 모두 채워진 기본 상태 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // hover=default 이므로 배지에는 페르소나 이름이 표시된다
    await expect(canvas.getByText("Data Scientist")).toBeInTheDocument();
    await expect(canvas.getByText("Vegan Chef")).toBeInTheDocument();
    await expect(canvas.getByText("Hover to see analysis")).toBeInTheDocument();
  },
};

/** Hover=growth potential — Growth 링만 흰 밴드, 배지가 Growth 값으로 전환 */
export const HoverGrowthPotential: Story = {
  args: {
    hover: "growth",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 배지가 이름 대신 값으로 바뀐다 (Figma의 핵심 인터랙션)
    await expect(canvas.getByText("80%")).toBeInTheDocument();
    await expect(canvas.queryByText("Data Scientist")).toBeNull();
    await expect(canvas.getByText("Growth Potential")).toBeInTheDocument();
  },
};

/** Hover=reach — Qualified Reach 링 강조, 배지가 리치 값(천 단위 구분)으로 전환 */
export const HoverQualifiedReach: Story = {
  args: {
    hover: "reach",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("8,340")).toBeInTheDocument();
    await expect(canvas.getByText("Qualified Reach")).toBeInTheDocument();
  },
};

/** Hover=engagement — Engagement Intensity 링 강조 */
export const HoverEngagementIntensity: Story = {
  args: {
    hover: "engagement",
  },
};

/** Hover=self — 셀프 아바타에 blur + 밝은 링, 중앙 문구가 CTA로 전환 */
export const HoverSelf: Story = {
  args: {
    hover: "self",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Go to Content Studio")).toBeInTheDocument();
  },
};

/** Self=1 — 셀프 1명만 생성된 상태. 나머지 7개는 dashed "No Self" 슬롯 */
export const SingleSelf: Story = {
  args: {
    selfCount: 1,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByText("No Self")).toHaveLength(7);
  },
};

/**
 * Self=1 / Hover=self — 중앙 문구가 "Create a Self"로 바뀝니다.
 *
 * ⚠️ 강조 대상은 **한 번에 하나뿐**입니다. `hover` prop만 주는 제어 모드에서는 어떤
 * 아바타에 마우스를 올렸는지 알 수 없어 셀프를 강조합니다. Figma의 이 variant는
 * "빈 슬롯 하나에 마우스를 올린 순간"을 캡처한 스냅샷이라 빈 슬롯이 강조되어 있는데,
 * 실제 동작은 `Interactive` story에서 아바타에 직접 올려 확인하세요.
 */
export const SingleSelfHoverSelf: Story = {
  args: {
    selfCount: 1,
    hover: "self",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Create a Self")).toBeInTheDocument();
  },
};

/*
 * Figma에는 `Self=8 + Posting=false` 조합이 없습니다 — `Posting=false`는 `Self=1`에만
 * 존재합니다. 아래 3개 story는 그래서 전부 `selfCount: 1`로 둡니다.
 */

/** Self=1 / Posting=false — Growth 링만 산출됩니다. 하단 안내 배지는 아직 뜨지 않습니다 */
export const NoPosting: Story = {
  args: {
    selfCount: 1,
    posting: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 안내 배지는 Reach/Engagement를 hover할 때만 나타납니다 (비활성 상태 없음)
    await expect(canvas.queryByText("Not Enough Data Yet")).toBeNull();
    // 배지는 존재하는 셀프 수만큼만 — 빈 슬롯 7개에는 배지가 없습니다
    await expect(canvas.getByText("Data Scientist")).toBeInTheDocument();
    await expect(canvas.queryByText("Yoga Meditator")).toBeNull();
  },
};

/**
 * Self=1 / Posting=false / Hover=reach — 링 전체가 균일하게 채워지고 경계원이 흰색으로
 * 강조되며, 상단 배지는 전부 사라지고 하단 안내 배지가 활성화됩니다.
 */
export const NoPostingHoverReach: Story = {
  args: {
    selfCount: 1,
    posting: false,
    hover: "reach",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText("Create Posts to analyze"),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Not Enough Data Yet")).toBeInTheDocument();
    // 데이터가 없는 지표라 상단 배지가 이름으로 되돌아가지 않고 사라집니다
    await expect(canvas.queryByText("Data Scientist")).toBeNull();
  },
};

/** Self=1 / Posting=false / Hover=growth — Growth는 게시물 없이도 산출되어 안내 배지가 없습니다 */
export const NoPostingHoverGrowth: Story = {
  args: {
    selfCount: 1,
    posting: false,
    hover: "growth",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByText("Not Enough Data Yet")).toBeNull();
    // 배지는 남아 있고 텍스트만 Growth 값으로 바뀝니다
    await expect(canvas.getByText("80%")).toBeInTheDocument();
  },
};

/**
 * 실제 마우스 hover로 동작하는 비제어 모드 (`hover` prop 미지정).
 * - 링 위에 올리면 → 배지 8개가 그 지표의 값으로 전환
 * - 아바타 위에 올리면 → 그 아바타만 강조(흰 보더 + 블러 + 딤), 링은 그대로
 */
export const Interactive: Story = {
  args: {
    // hover만 비워 비제어 모드로 둡니다. selfId는 지정하지 않아야 첫 번째
    // 페르소나가 셀프로 잡히고, Controls에서 selfCount를 1로 바꿔도 셀프가
    // 정상적으로 남습니다.
    hover: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Data Scientist")).toBeInTheDocument();

    // 링 hover 판정 영역 중 가장 안쪽(Growth)에 마우스를 올린다
    const hitAreas = canvasElement.querySelectorAll<SVGPathElement>(
      'path[fill-rule="evenodd"]',
    );
    await userEvent.hover(hitAreas[hitAreas.length - 3]);

    await expect(canvas.getByText("Growth Potential")).toBeInTheDocument();

    // 셀프가 아닌 아바타에 올려도 그 아바타가 활성화된다
    await userEvent.hover(canvas.getByRole("img", { name: "Novelist" }));

    await expect(canvas.getByText("Go to Content Studio")).toBeInTheDocument();
  },
};

/** 배지를 클릭 가능하게 만든 확장 예시 */
export const SelectablePersonaBadges: Story = {
  args: {
    onPersonaSelect: (personaId: string) => {
      console.log("selected persona:", personaId);
    },
  },
};
