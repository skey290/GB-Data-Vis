import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";

import { CompassToolbar, type CompassToolbarProps } from "./compass-toolbar";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%F0%9F%93%8C-GB_Design-System--Atom-?node-id=5266-11096";

function ControlledCompassToolbar(props: CompassToolbarProps) {
  const [toggleValue, setToggleValue] = React.useState(props.toggleValue);
  const [selectValue, setSelectValue] = React.useState(props.selectValue);

  React.useEffect(() => setToggleValue(props.toggleValue), [props.toggleValue]);
  React.useEffect(() => setSelectValue(props.selectValue), [props.selectValue]);

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
  argTypes: {
    toggleValue: { control: "text" },
    selectValue: { control: "text" },
  },
  args: {
    toggleOptions: [
      { value: "home", label: "Home" },
      { value: "analysis", label: "Analysis" },
    ],
    toggleValue: "home",
    selectOptions: [{ value: "all-self", label: "All 'Self'" }],
    selectValue: "all-self",
  },
  render: (args) => <ControlledCompassToolbar {...args} />,
} satisfies Meta<typeof CompassToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
