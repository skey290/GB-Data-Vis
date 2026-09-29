import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, fn, userEvent, within } from "storybook/test";

import { FloatingProfile } from "./floating-profile";

const FIGMA_FILE =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%E2%9D%84%EF%B8%8F-GB_Design-System-%E2%80%94-Atom";
const FIGMA_URL = `${FIGMA_FILE}?node-id=7244-22163`;

const AVATAR_SRC = "/images/personas/self-default.jpg";
const PORTRAIT_SRC = "/images/personas/self-default.jpg";

const meta = {
  title: "UI/FloatingProfile",
  component: FloatingProfile,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  // 카드는 Figma 디자인상 아바타 기준 "왼쪽"으로 620px 펼쳐집니다(컴포넌트 자체
  // 동작이며 디자인 토큰과 무관). Storybook 기본 캔버스는 아바타를 좌측 여백
  // 16px 지점에 배치해 카드가 뷰포트 음수 좌표로 밀려나 보이지 않으므로, 카드가
  // 펼쳐질 공간을 확보하기 위한 순수 프레젠테이션용 여백입니다.
  decorators: [
    (Story) => (
      <div className="pl-[700px]">
        <Story />
      </div>
    ),
  ],
  args: {
    open: true,
    avatarSrc: AVATAR_SRC,
    title: "Data Scientist",
    portraitSrc: PORTRAIT_SRC,
    timestamp: "2026.03.24 19:24:06",
    tagline:
      "4 years in finance, 3 in data science — forecasting Finance teams trust.",
    bio: "Four years in finance. Three in data science. She builds forecasting models with the accounting logic most data scientists skip — the reason Finance teams trust the output. Two freelance projects outside the office proved it holds up beyond a single team's walls. Not a title she chose, but one the work has already earned.",
    onOpenChange: fn(),
    onShare: fn(),
    onEditAssets: fn(),
    onEditGoal: fn(),
    onCtaClick: fn(),
  },
} satisfies Meta<typeof FloatingProfile>;

export default meta;

type Story = StoryObj<typeof meta>;

// --- Type=default, Open=true (7244:22186) ---

export const DefaultOpen: Story = {
  args: {
    open: true,
  },
  parameters: {
    design: { type: "figma", url: `${FIGMA_FILE}?node-id=7244-22186` },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("button", { name: "Data Scientist 프로필 닫기" }),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Data Scientist")).toBeInTheDocument();

    const editAssets = canvas.getByRole("button", { name: "Edit Assets" });
    await expect(editAssets).not.toBeDisabled();
    await expect(editAssets.className).toContain(
      "bg-[var(--background-default)]",
    );

    const cta = canvas.getByRole("button", { name: "Create a post" });
    await expect(cta).toBeInTheDocument();
  },
};

// --- Type=default, Open=false (7244:22206) ---

export const DefaultClosed: Story = {
  args: {
    open: false,
  },
  parameters: {
    design: { type: "figma", url: `${FIGMA_FILE}?node-id=7244-22206` },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("button", { name: "Data Scientist 프로필 열기" }),
    ).toBeInTheDocument();
    await expect(canvas.queryByText("Edit Assets")).not.toBeInTheDocument();
  },
};

// --- Type=no profile, Open=false (7425:4495) ---
// avatarSrc를 지정하지 않으면 Avatar의 아이콘 폴백(어두운 배경 + 흰색 실루엣
// 유저 아이콘)이 그대로 "no profile" 상태가 되고, Open=true 대응 디자인이 없어
// 아바타 클릭도 비활성화됩니다.

export const NoProfile: Story = {
  args: {
    open: false,
    avatarSrc: undefined,
  },
  parameters: {
    design: { type: "figma", url: `${FIGMA_FILE}?node-id=7425-4495` },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole("button", { name: "Data Scientist" });
    await expect(trigger).toBeDisabled();
    await expect(canvas.getByRole("img")).toBeInTheDocument();

    await userEvent.click(trigger);
    await expect(canvas.queryByText("Edit Assets")).not.toBeInTheDocument();
  },
};

// --- 인터랙션: 아바타 클릭 → onOpenChange(true) 호출 ---

export const OpenInteraction: Story = {
  args: {
    open: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: "Data Scientist 프로필 열기",
    });

    await userEvent.click(trigger);

    await expect(args.onOpenChange).toHaveBeenCalledWith(true);
  },
};

// --- 인터랙션: CTA 클릭 → onCtaClick 호출 ---

export const CtaClickInteraction: Story = {
  args: {
    open: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const cta = canvas.getByRole("button", { name: "Create a post" });

    await userEvent.click(cta);

    await expect(args.onCtaClick).toHaveBeenCalledTimes(1);
  },
};

// --- Storybook에서 직접 클릭해볼 수 있는 실사용 패턴. `open`을 이 스토리가
// `useState`로 직접 들고 있어서(다른 스토리들처럼 고정 args가 아님) 아바타를
// 클릭하면 실제로 카드가 열리고 닫힙니다. ---

function InteractiveFloatingProfile(
  args: React.ComponentProps<typeof FloatingProfile>,
) {
  const [open, setOpen] = React.useState(args.open ?? false);
  return <FloatingProfile {...args} open={open} onOpenChange={setOpen} />;
}

export const Interactive: Story = {
  args: {
    open: false,
  },
  render: (args) => <InteractiveFloatingProfile {...args} />,
};
