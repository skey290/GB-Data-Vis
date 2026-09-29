import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, userEvent, within } from "storybook/test";

import { CompassSelfAvatar } from "./compass-self-avatar";

const FIGMA_URL =
  "https://www.figma.com/design/C34HOpbSASmThFA1iYFm8D/%E2%9D%84%EF%B8%8F-GB_Compass?node-id=8003-10251";

/** 데모용 유저 이미지 8장(최대 셀프 수와 동일) — public/images/personas/*.jpg */
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

const meta = {
  title: "Compass/UI/CompassSelfAvatar",
  component: CompassSelfAvatar,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  decorators: [
    (Story) => (
      <div className="dark bg-[var(--background-default)] p-[var(--spacing-24)]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: "radio",
      options: ["self", "empty", "guide"],
    },
    guideSize: {
      control: { type: "range", min: 100, max: 300, step: 50 },
    },
    status: {
      control: "radio",
      options: ["default", "active"],
    },
    error: {
      control: "boolean",
    },
    image: {
      control: "text",
    },
    label: {
      control: "text",
    },
    description: {
      control: "text",
    },
  },
  args: {
    variant: "self",
    image: DEMO_IMAGES[0],
    imageAlt: "Entrepreneur",
  },
} satisfies Meta<typeof CompassSelfAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Controls 패널에서 모든 축을 자유롭게 조합해보는 기본 진입점 */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const img = canvasElement.querySelector("img");

    await expect(img).toBeInTheDocument();
  },
};

/** variant="self" — 유저 이미지만, 오버레이 없음 */
export const Self: Story = {
  args: {
    variant: "self",
    image: DEMO_IMAGES[0],
  },
};

/** variant="self" / status="active" — 블러 + 어두운 오버레이 + "Go to Content Studio" */
export const SelfActive: Story = {
  args: {
    variant: "self",
    status: "active",
    image: DEMO_IMAGES[1],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Go to")).toBeInTheDocument();
    await expect(canvas.getByText("Content Studio")).toBeInTheDocument();
  },
};

/** variant="self" / error — 블러 + 오버레이 + "Estimate" 설명(테두리 없음) */
export const SelfError: Story = {
  args: {
    variant: "self",
    error: true,
    image: DEMO_IMAGES[2],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Estimate")).toBeInTheDocument();
    await expect(canvas.getByText("(No experience data)")).toBeInTheDocument();
  },
};

/**
 * variant="self" — status prop 없이 마우스 hover만으로 active 모습(블러+오버레이
 * +"Go to Content Studio")이 나타나는지 확인(status="active" 강제 제어와 별개,
 * 2026-09-28).
 */
export const SelfHoverInteraction: Story = {
  args: {
    variant: "self",
    image: DEMO_IMAGES[0],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvasElement.querySelector(
      ".cursor-pointer",
    ) as HTMLElement;

    await expect(canvas.queryByText("Go to")).toBeNull();

    await userEvent.hover(avatar);
    await expect(canvas.getByText("Go to")).toBeInTheDocument();
    await expect(canvas.getByText("Content Studio")).toBeInTheDocument();

    await userEvent.unhover(avatar);
    await expect(canvas.queryByText("Go to")).toBeNull();
  },
};

/**
 * variant="empty" — 마우스 hover만으로 "No Self Yet" → "Go to Assets"로
 * 전환되는지 확인.
 */
export const EmptyHoverInteraction: Story = {
  args: {
    variant: "empty",
    image: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvasElement.querySelector(
      ".cursor-pointer",
    ) as HTMLElement;

    await expect(canvas.getByText("No")).toBeInTheDocument();

    await userEvent.hover(avatar);
    await expect(canvas.getByText("Go to")).toBeInTheDocument();
    await expect(canvas.getByText("Assets")).toBeInTheDocument();

    await userEvent.unhover(avatar);
    await expect(canvas.getByText("No")).toBeInTheDocument();
  },
};

/** variant="empty" — 셀프 미배정 슬롯 */
export const Empty: Story = {
  args: {
    variant: "empty",
    image: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("No")).toBeInTheDocument();
    await expect(canvas.getByText("Self Yet")).toBeInTheDocument();
  },
};

/** variant="empty" / status="active" — "Go to Assets" */
export const EmptyActive: Story = {
  args: {
    variant: "empty",
    status: "active",
    image: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Go to")).toBeInTheDocument();
    await expect(canvas.getByText("Assets")).toBeInTheDocument();
  },
};

/** variant="guide" — 콘텐츠 없는 점선 가이드 링(사이즈 5단계) */
export const Guide: Story = {
  args: {
    variant: "guide",
    guideSize: 100,
    image: undefined,
  },
  play: async ({ canvasElement }) => {
    const guide = canvasElement.firstElementChild as HTMLElement;

    await expect(guide.className).toContain("border-dashed");
  },
};

/** variant="guide" 5단계 사이즈를 한 화면에 동심원으로 비교 */
export const GuideSizes: Story = {
  args: { image: undefined },
  render: () => (
    <div className="relative flex size-[300px] items-center justify-center">
      {[300, 250, 200, 150, 100].map((size) => (
        <CompassSelfAvatar
          key={size}
          variant="guide"
          guideSize={size as 100 | 150 | 200 | 250 | 300}
          className="absolute"
        />
      ))}
    </div>
  ),
};

/** 다이얼 1개에 배치 가능한 최대 셀프 수(8명) 데모 갤러리 */
export const EightSelves: Story = {
  args: { image: undefined },
  render: () => (
    <div className="flex flex-wrap gap-[var(--spacing-4)]">
      {DEMO_IMAGES.map((src) => (
        <CompassSelfAvatar key={src} variant="self" image={src} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const images = canvasElement.querySelectorAll("img");

    await expect(images.length).toBe(8);
  },
};
