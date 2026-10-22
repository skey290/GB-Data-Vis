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

type SelfSlotPreviewProps = Omit<SelfSlotProps, "persona"> & {
  persona: NonNullable<SelfSlotProps["persona"]>;
  /** Story 전용 토글 — SelfSlot 자체엔 이런 prop이 없고, persona 유무로만 빈 슬롯을 표현한다 */
  showEmpty: boolean;
};

/** Local hover state so a real mouse hover can reproduce Figma `Status=active` */
function SelfSlotPreview({
  showEmpty,
  persona,
  status,
  ...args
}: SelfSlotPreviewProps) {
  const [isHovering, setIsHovering] = useState(false);
  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <SelfSlot
        {...args}
        persona={showEmpty ? null : persona}
        status={isHovering ? "active" : status}
      />
    </div>
  );
}

const meta = {
  title: "Dashboard/UI/SelfSlot",
  component: SelfSlotPreview,
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
    showEmpty: { control: "boolean" },
  },
  args: {
    persona: SAMPLE_PERSONA,
    status: "default",
    showEmpty: false,
  },
} satisfies Meta<typeof SelfSlotPreview>;

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
