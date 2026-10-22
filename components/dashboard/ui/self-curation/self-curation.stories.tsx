import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { within, expect } from "storybook/test";

import {
  SelfCuration,
  SELF_CURATION_SLOT_COUNT,
  type SelfCurationPersona,
  type SelfCurationProps,
} from "./self-curation";

const FIGMA_URL =
  "https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8133-122553";

const EIGHT_PERSONAS: SelfCurationPersona[] = [
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

/** PersonaRadialChart의 selfCount 로직과 동일 — 앞에서부터 `selfCount`명만 채우고 나머지는 빈 슬롯 */
function buildSlots(selfCount: number): (SelfCurationPersona | null)[] {
  return Array.from({ length: SELF_CURATION_SLOT_COUNT }, (_, index) =>
    index < selfCount ? EIGHT_PERSONAS[index] : null,
  );
}

type SelfCurationPreviewProps = Omit<
  SelfCurationProps,
  "slots" | "activeSlotId" | "onSlotHover"
> & {
  /** 몇 명까지 채워진 슬롯으로 보여줄지 (나머지는 "No Self" 빈 슬롯) */
  selfCount: number;
};

/**
 * `SelfCuration` is purely controlled and does not hold `activeSlotId` itself.
 * To see the highlight change on a real mouse hover, this wraps it and holds
 * that state (in the real app `PersonaRadialChart` plays that role).
 * `selfCount` is a story-only control — `SelfCuration` itself has no such
 * prop, `slots` is built from it here, the same way `PersonaRadialChart` does.
 */
function SelfCurationPreview({ selfCount, ...args }: SelfCurationPreviewProps) {
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  return (
    <SelfCuration
      {...args}
      slots={buildSlots(selfCount)}
      activeSlotId={activeSlotId}
      onSlotHover={setActiveSlotId}
    />
  );
}

const meta = {
  title: "Dashboard/UI/SelfCuration",
  component: SelfCurationPreview,
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
  argTypes: {
    centerMessage: { control: "text" },
    selfCount: {
      control: { type: "number", min: 1, max: SELF_CURATION_SLOT_COUNT, step: 1 },
    },
  },
  args: {
    selfCount: SELF_CURATION_SLOT_COUNT,
    centerMessage: "Hover to explore",
  },
} satisfies Meta<typeof SelfCurationPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("img", { name: "Vegan Chef" }),
    ).toBeInTheDocument();
  },
};
