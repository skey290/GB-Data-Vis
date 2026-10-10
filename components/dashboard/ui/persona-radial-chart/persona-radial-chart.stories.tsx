import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import { PersonaRadialChart } from "./persona-radial-chart";

const FIGMA_URL =
  "https://www.figma.com/design/V5xLVr9FyArMjzaNpTn1Zo/GB_Dashboard?node-id=8004-6542";

const meta = {
  title: "Dashboard/UI/PersonaRadialChart",
  component: PersonaRadialChart,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  decorators: [
    // `.dark`를 강제하지 않는다 — 컴포넌트가 앱 테마를 그대로 따르므로 Storybook
    // 툴바의 라이트/다크 토글에 맞춰 값 밴드도 반전된다. 배지가 500×500 프레임
    // 바깥으로 넘쳐 배치되므로 여백만 둔다.
    (Story) => (
      <div className="bg-background p-[var(--spacing-24)]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    selfCount: {
      control: { type: "range", min: 1, max: 8, step: 1 },
      description: "노출할 셀프 수. 나머지 칸은 'No Self' 빈 슬롯이 됩니다.",
    },
    valueFractionDigits: {
      control: { type: "range", min: 0, max: 3, step: 1 },
      description:
        "배지 값의 최대 소수 자릿수. 정수에는 소수점이 붙지 않습니다",
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
    onPersonaSelect: fn(),
    onCenterClick: fn(),
  },
} satisfies Meta<typeof PersonaRadialChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
