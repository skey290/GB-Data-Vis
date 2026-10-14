import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { within, expect } from "storybook/test";

import {
  SelfCuration,
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

const meta = {
  title: "Dashboard/UI/SelfCuration",
  component: SelfCuration,
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
    slots: { control: "object" },
  },
  args: {
    slots: EIGHT_PERSONAS,
    centerMessage: "Hover to see analysis",
  },
} satisfies Meta<typeof SelfCuration>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * `SelfCuration`은 순수 controlled 컴포넌트라 `activeSlotId`를 스스로 들고
 * 있지 않습니다. 실제 마우스 hover로 강조가 바뀌는 걸 보려면 스토리가 직접
 * `onSlotHover` 콜백을 받아 상태를 들고 있어야 합니다(실제 앱에서는
 * `PersonaRadialChart`가 이 역할을 합니다).
 */
function PlaygroundRender(args: SelfCurationProps) {
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  return (
    <SelfCuration
      {...args}
      activeSlotId={activeSlotId}
      onSlotHover={setActiveSlotId}
    />
  );
}

export const Playground: Story = {
  render: PlaygroundRender,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("img", { name: "Vegan Chef" }),
    ).toBeInTheDocument();
  },
};
