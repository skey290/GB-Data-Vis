import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, within } from "storybook/test";

import { PersonaSlot } from "./persona-slot";

const FIGMA_URL =
  "https://www.figma.com/design/V5xLVr9FyArMjzaNpTn1Zo/%E2%9D%84%EF%B8%8F-GB_Dashboard?node-id=8004-5477";

const SAMPLE_PERSONA = {
  name: "Data Scientist",
  imageSrc: "/images/personas/self-default.jpg",
  initials: "DS",
};

/**
 * Figma 원본은 `style`(9개 페르소나 + empty) × `status`(default/active) = 20개
 * variant이지만, `style`은 어떤 페르소나가 들어있느냐일 뿐이라 아래 story는
 * "페르소나 있음/없음" × "default/active" 2×2 축으로 대표합니다.
 */
const meta = {
  title: "Dashboard/UI/PersonaSlot",
  component: PersonaSlot,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-background p-[var(--spacing-24)]">
        <Story />
      </div>
    ),
  ],
  args: {
    persona: SAMPLE_PERSONA,
    active: false,
  },
} satisfies Meta<typeof PersonaSlot>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Figma `style=<persona> / status=default` */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("img", { name: "Data Scientist" }),
    ).toBeInTheDocument();
  },
};

/** Figma `style=<persona> / status=active` — 흰 링 + 블러 + 딤 오버레이 */
export const Active: Story = {
  args: {
    active: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole("img", { name: "Data Scientist" });
    expect(avatar.parentElement).toHaveClass(
      "outline-[color:var(--color-semantic-non-changeable)]",
    );
  },
};

/** Figma `style=empty / status=default` — 점선 원 + "No Self" */
export const Empty: Story = {
  args: {
    persona: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("No Self")).toBeInTheDocument();
  },
};

/** Figma `style=empty / status=active` — 흰 링 + background-sheer 채움 */
export const EmptyActive: Story = {
  args: {
    persona: null,
    active: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slot = canvas.getByRole("img", { name: "No Self" });
    expect(slot).toHaveClass("bg-[var(--background-sheer)]");
  },
};
