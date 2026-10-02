import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, userEvent, within } from "storybook/test";

import { CompassToolbar, type CompassToolbarProps } from "./compass-toolbar";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%E2%9D%84%EF%B8%8F-GB_Design-System-%E2%80%94-Atom?node-id=5266-11096";

const selectOptions = [{ value: "all-self", label: "All 'Self'" }];

function ControlledCompassToolbar(props: CompassToolbarProps) {
  const [toggleValue, setToggleValue] = React.useState(props.toggleValue);
  const [selectValue, setSelectValue] = React.useState(props.selectValue);

  return (
    <CompassToolbar
      {...props}
      toggleValue={toggleValue}
      onToggleValueChange={setToggleValue}
      selectValue={selectValue}
      onSelectValueChange={setSelectValue}
    />
  );
}

const meta = {
  title: "Compass/UI/CompassToolbar",
  component: CompassToolbar,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  args: {
    toggleOptions: [
      { value: "home", label: "Home" },
      { value: "analysis", label: "Analysis" },
    ],
    toggleValue: "home",
    selectOptions,
    selectValue: "all-self",
  },
  render: (args) => <ControlledCompassToolbar {...args} />,
} satisfies Meta<typeof CompassToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HomeAnalysis: Story = {};

export const AnalysisContent: Story = {
  args: {
    toggleOptions: [
      { value: "analysis", label: "Analysis" },
      { value: "content", label: "Content" },
    ],
    toggleValue: "analysis",
  },
};

/** Analysis 모드 — Figma 실측 결과 "All 'Self'" Select가 없다(selectOptions 미전달) */
export const AnalysisWithoutSelect: Story = {
  args: {
    toggleOptions: [
      { value: "home", label: "Home" },
      { value: "analysis", label: "Analysis" },
    ],
    toggleValue: "analysis",
    selectOptions: undefined,
    selectValue: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole("combobox")).toBeNull();
  },
};

export const ToggleInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const analysisOption = canvas.getByRole("radio", { name: "Analysis" });

    await expect(analysisOption).toHaveAttribute("aria-checked", "false");
    await userEvent.click(analysisOption);
    await expect(analysisOption).toHaveAttribute("aria-checked", "true");
  },
};
