import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

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
  // 카드는 아바타 기준 왼쪽으로 620px 펼쳐짐 — 뷰포트 음수 좌표로 밀려나 보이지
  // 않는 걸 막기 위한 순수 프레젠테이션용 여백 (디자인 토큰과 무관).
  decorators: [
    (Story) => (
      <div className="pl-[700px]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    open: { control: "boolean" },
    avatarSrc: {
      control: "text",
      description:
        "비우면 'no profile' 상태(아이콘 폴백) — 아바타 클릭도 비활성화됩니다.",
    },
    title: { control: "text" },
    tagline: { control: "text" },
    bio: { control: "text" },
    timestamp: { control: "text" },
    ctaLabel: { control: "text" },
  },
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

export const Playground: Story = {};
