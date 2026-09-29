import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, within } from "storybook/test";

import { CompassDialTick } from "./compass-dial-tick";

const FIGMA_URL =
  "https://www.figma.com/design/C34HOpbSASmThFA1iYFm8D/%E2%9D%84%EF%B8%8F-GB_Compass?node-id=8003-8237";

/**
 * 눈금선이 `--border-static-white`(항상 흰색 고정)라 밝은 배경에서는 보이지 않는다.
 * 다이얼은 실제로도 항상 어두운 표면 위에 그려지므로(Figma 원본 스크린샷 전부
 * 검정 배경), Storybook에서만 어두운 배경 데코레이터를 둔다 — 컴포넌트 자체를
 * `.dark`로 강제하는 것이 아니라 라벨/Badge 색은 여전히 앱 테마 토큰을 그대로 쓴다.
 */
const meta = {
  title: "Compass/UI/CompassDialTick",
  component: CompassDialTick,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  decorators: [
    (Story) => (
      // 다이얼은 항상 어두운 표면 위에 그려지므로(Figma 원본 스크린샷 전부 검정
      // 배경) `.dark` 스코프로 강제 — 컴포넌트 자체를 다크 전용으로 바꾸는 게
      // 아니라 Storybook 데코레이터에서만 배경을 어둡게 맞춘다.
      <div className="dark bg-[var(--background-default)] p-[var(--spacing-24)]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    type: {
      control: "radio",
      options: ["default", "text", "circle"],
    },
    direction: {
      control: "radio",
      options: ["outward", "inward"],
    },
    muted: {
      control: "boolean",
    },
    textArrangement: {
      control: "radio",
      options: ["cross", "parallel", "parallel-reverse", "cross-reverse"],
    },
    size: {
      control: { type: "range", min: 1, max: 5, step: 1 },
    },
    label: {
      control: "text",
    },
  },
  args: {
    type: "text",
    direction: "outward",
    muted: false,
    textArrangement: "cross",
    size: 5,
    label: "6/1",
  },
} satisfies Meta<typeof CompassDialTick>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Controls 패널에서 모든 축(type/direction/muted/textArrangement/size/label)을 자유롭게 조합해보는 기본 진입점 */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("6/1")).toBeInTheDocument();
  },
};

/** type="default" — 눈금선만, 라벨 없음 */
export const DefaultTick: Story = {
  args: {
    type: "default",
    label: undefined,
  },
  play: async ({ canvasElement }) => {
    const tick = canvasElement.querySelector(
      '[data-slot="compass-dial-tick-mark"]',
    );

    await expect(tick).toBeInTheDocument();
    await expect(canvasElement.querySelector("p")).toBeNull();
  },
};

/** type="text" / direction="inward" — 라벨이 박스 밖 위로 절대 배치되고 180° 회전(cross 기준) */
export const TextInward: Story = {
  args: {
    type: "text",
    direction: "inward",
    textArrangement: "cross",
    label: "1/6",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("1/6");

    await expect(label).toBeInTheDocument();
    await expect(label.style.transform).toBe("rotate(180deg)");
  },
};

/** type="text" / textArrangement="parallel" — 라벨이 -90° 회전해 눈금과 나란히 놓임 */
export const TextParallel: Story = {
  args: {
    type: "text",
    textArrangement: "parallel",
    label: "6/1",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("6/1").style.transform).toBe(
      "rotate(-90deg)",
    );
  },
};

/** type="circle" — 기존 Badge(variant="default") 재사용 */
export const CircleOutward: Story = {
  args: {
    type: "circle",
    label: "Badge",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("Badge");

    await expect(badge.className).toContain("bg-[var(--background-bold)]");
  },
};

/** type="circle" / muted=true — Badge(variant="outline")로 전환 */
export const CircleMuted: Story = {
  args: {
    type: "circle",
    muted: true,
    label: "Badge",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("Badge");

    await expect(badge.className).toContain("text-[var(--text-subtle)]");
  },
};

/** type="text" / muted=true — text-base-semi-bold → text-sm-semi-bold로 다운그레이드 */
export const MutedText: Story = {
  args: {
    type: "text",
    muted: true,
    label: "6/1",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("6/1").className).toContain(
      "text-sm-semi-bold",
    );
  },
};

/**
 * `coachmark` — Reach/Engagement 온보딩 코치마크가 붙는 북쪽(슬롯0) 칩. Figma
 * "셀프1개에서 포스팅 분석 조건 충족시"(node 8052:33418) 실측 문구를 그대로 사용.
 */
export const WithCoachmark: Story = {
  args: {
    type: "circle",
    label: "8,340",
    coachmark: {
      title: "Most Reached: 8,340",
    },
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
