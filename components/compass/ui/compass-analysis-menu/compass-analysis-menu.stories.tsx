import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, userEvent, within } from "storybook/test";

import {
  CompassAnalysisMenu,
  type CompassAnalysisMenuProps,
  type CompassAnalysisMenuValue,
} from "./compass-analysis-menu";

const FIGMA_URL =
  "https://www.figma.com/design/C34HOpbSASmThFA1iYFm8D/%E2%9D%84%EF%B8%8F-GB_Compass?node-id=8052-33420";

function ControlledCompassAnalysisMenu(props: CompassAnalysisMenuProps) {
  const [value, setValue] = React.useState(props.value);

  return (
    <CompassAnalysisMenu {...props} value={value} onValueChange={setValue} />
  );
}

const meta = {
  title: "Compass/UI/CompassAnalysisMenu",
  component: CompassAnalysisMenu,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  argTypes: {
    value: {
      control: "radio",
      options: ["growth-potential", "reach", "engagement", "ranking"],
    },
    disabled: { control: "boolean" },
  },
  args: {
    value: "growth-potential" satisfies CompassAnalysisMenuValue,
  },
  render: (args) => <ControlledCompassAnalysisMenu {...args} />,
} satisfies Meta<typeof CompassAnalysisMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 진입 시 기본값 — Growth Potential이 눌린 상태 */
export const GrowthPotential: Story = {};

export const Reach: Story = {
  args: { value: "reach" },
};

export const Engagement: Story = {
  args: { value: "engagement" },
};

export const Ranking: Story = {
  args: { value: "ranking" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

/** 클릭하면 눌린 항목이 바뀌는지(라디오처럼 단일 선택) 확인 */
export const SelectInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const growthPotential = canvas.getByRole("button", {
      name: "Growth Potential",
    });
    const reach = canvas.getByRole("button", { name: "Reach" });

    await expect(growthPotential).toHaveAttribute("aria-pressed", "true");
    await expect(reach).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(reach);

    await expect(reach).toHaveAttribute("aria-pressed", "true");
    await expect(growthPotential).toHaveAttribute("aria-pressed", "false");
  },
};
