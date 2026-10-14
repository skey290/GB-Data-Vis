import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { within, expect } from "storybook/test";

import { SelfSlot, type SelfSlotProps } from "./self-slot";

const FIGMA_URL =
  "https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8133-122512";

const SAMPLE_PERSONA = {
  name: "Data Scientist",
  imageSrc: "/images/personas/self-default.jpg",
  initials: "DS",
};

const meta = {
  title: "Dashboard/UI/SelfSlot",
  component: SelfSlot,
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
    status: { control: "radio", options: ["default", "active"] },
    persona: { control: "object" },
  },
  args: {
    persona: SAMPLE_PERSONA,
    status: "default",
  },
} satisfies Meta<typeof SelfSlot>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 실제 마우스 hover로도 Figma `Status=active`를 재현할 수 있도록 로컬 hover 상태를 둡니다 */
function PlaygroundRender(args: SelfSlotProps) {
  const [isHovering, setIsHovering] = useState(false);
  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <SelfSlot
        {...args}
        status={isHovering ? "active" : args.status}
      />
    </div>
  );
}

export const Playground: Story = {
  render: PlaygroundRender,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("img", { name: "Data Scientist" }),
    ).toBeInTheDocument();
  },
};
