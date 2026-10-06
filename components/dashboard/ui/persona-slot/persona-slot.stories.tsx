import type { Meta, StoryObj } from "@storybook/nextjs";
import { within, expect } from "storybook/test";

import { PersonaSlot } from "./persona-slot";

const FIGMA_URL =
  "https://www.figma.com/design/V5xLVr9FyArMjzaNpTn1Zo/%E2%9D%84%EF%B8%8F-GB_Dashboard?node-id=8004-5477";

const SAMPLE_PERSONA = {
  name: "Data Scientist",
  imageSrc: "/images/personas/self-default.jpg",
  initials: "DS",
};

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
  argTypes: {
    active: { control: "boolean" },
    persona: { control: "object" },
  },
  args: {
    persona: SAMPLE_PERSONA,
    active: false,
  },
} satisfies Meta<typeof PersonaSlot>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("img", { name: "Data Scientist" }),
    ).toBeInTheDocument();
  },
};
