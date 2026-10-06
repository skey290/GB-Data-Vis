import type { Meta, StoryObj } from "@storybook/nextjs";
import { within, expect } from "storybook/test";

import { PersonaOrbit, type PersonaOrbitPersona } from "./persona-orbit";

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
  argTypes: {
    centerMessage: { control: "text" },
    slots: { control: "object" },
  },
  args: {
    slots: EIGHT_PERSONAS,
    centerMessage: "Hover to see analysis",
  },
} satisfies Meta<typeof PersonaOrbit>;

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
