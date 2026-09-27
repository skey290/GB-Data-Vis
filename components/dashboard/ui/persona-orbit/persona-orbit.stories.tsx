import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, userEvent, within } from "storybook/test";

import {
  PersonaOrbit,
  personaOrbitEmptySlotKey,
  type PersonaOrbitPersona,
} from "./persona-orbit";

const FIGMA_URL =
  "https://www.figma.com/design/V5xLVr9FyArMjzaNpTn1Zo/%E2%9D%84%EF%B8%8F-GB_Dashboard?node-id=8004-6285";

const EIGHT_PERSONAS: PersonaOrbitPersona[] = [
  {
    id: "data-scientist",
    name: "Data Scientist",
    imageSrc: "/images/personas/self-default.jpg",
    initials: "DS",
  },
  {
    id: "yoga-meditator",
    name: "Yoga Meditator",
    imageSrc: "/images/personas/yoga-meditator.jpg",
    initials: "YM",
  },
  {
    id: "novelist",
    name: "Novelist",
    imageSrc: "/images/personas/novelist.jpg",
    initials: "NV",
  },
  {
    id: "entrepreneur",
    name: "Entrepreneur",
    imageSrc: "/images/personas/entrepreneur.jpg",
    initials: "EN",
  },
  {
    id: "fashionista",
    name: "Fashionista",
    imageSrc: "/images/personas/fashionista.jpg",
    initials: "FA",
  },
  {
    id: "fashion-editor",
    name: "Fashion Editor",
    imageSrc: "/images/personas/fashion-editor.jpg",
    initials: "FE",
  },
  {
    id: "team-leader",
    name: "Team Leader",
    imageSrc: "/images/personas/team-leader.jpg",
    initials: "TL",
  },
  {
    id: "vegan-chef",
    name: "Vegan Chef",
    imageSrc: "/images/personas/vegan-chef.jpg",
    initials: "VC",
  },
];

/** Figma `selfNumber=1` — 첫 슬롯만 채워지고 나머지 7칸은 빈 슬롯입니다 */
const ONE_PERSONA: (PersonaOrbitPersona | null)[] = [
  EIGHT_PERSONAS[0],
  null,
  null,
  null,
  null,
  null,
  null,
  null,
];

/**
 * Figma `Self curation`은 `selfNumber`(1/8) × `status`(default/active) 4개
 * variant입니다. 이 컴포넌트는 selfNumber를 직접 갖지 않고 `slots` 배열로
 * 표현하므로, 아래 story는 그 4개 조합을 그대로 재현합니다.
 */
const meta = {
  title: "Dashboard/UI/PersonaOrbit",
  component: PersonaOrbit,
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
    slots: EIGHT_PERSONAS,
    centerMessage: "Hover to see analysis",
  },
} satisfies Meta<typeof PersonaOrbit>;

export default meta;

type Story = StoryObj<typeof meta>;

/** selfNumber=8 / status=default */
export const EightSelves: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("img", { name: "Vegan Chef" }),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Hover to see analysis")).toBeInTheDocument();
  },
};

/** selfNumber=1 / status=default — 나머지 7칸은 "No Self" */
export const SingleSelf: Story = {
  args: {
    slots: ONE_PERSONA,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText("No Self")).toHaveLength(7);
  },
};

/** selfNumber=8 / status=active — 강조 대상은 페르소나 하나 */
export const ActivePersona: Story = {
  args: {
    activeSlotId: "vegan-chef",
    centerMessage: "Go to Content Studio",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole("img", { name: "Vegan Chef" });
    expect(avatar.parentElement).toHaveClass(
      "outline-[color:var(--color-semantic-non-changeable)]",
    );
  },
};

/** selfNumber=1 / status=active — 강조 대상이 빈 슬롯일 때(Figma 원본 스냅샷) */
export const ActiveEmptySlot: Story = {
  args: {
    slots: ONE_PERSONA,
    activeSlotId: personaOrbitEmptySlotKey(1),
    centerMessage: "Create a Self",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Create a Self")).toBeInTheDocument();
  },
};

/** 실제 마우스 hover로 슬롯이 전환되는 비제어 사용 예시 */
export const Interactive: Story = {
  render: (args) => {
    return <PersonaOrbit {...args} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole("img", { name: "Novelist" }));
  },
};
