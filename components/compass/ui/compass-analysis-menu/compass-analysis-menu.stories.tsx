import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";

import {
  CompassAnalysisMenu,
  type CompassAnalysisMenuProps,
} from "./compass-analysis-menu";

const FIGMA_URL =
  "https://www.figma.com/design/C34HOpbSASmThFA1iYFm8D/%E2%9D%84%EF%B8%8F-GB_Compass?node-id=8052-33420";

function ControlledCompassAnalysisMenu(props: CompassAnalysisMenuProps) {
  const [value, setValue] = React.useState(props.value);
  React.useEffect(() => setValue(props.value), [props.value]);

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
    value: "growth-potential",
    disabled: false,
  },
  render: (args) => <ControlledCompassAnalysisMenu {...args} />,
} satisfies Meta<typeof CompassAnalysisMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
