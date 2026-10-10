import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { within, expect } from "storybook/test";

import {
  CompassFloatingNav,
  type CompassFloatingNavItemId,
  type CompassFloatingNavProps,
} from "./compass-floating-nav";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%F0%9F%93%8C-GB_Design-System--Atom-?node-id=601-467";

function ControlledCompassFloatingNav(props: CompassFloatingNavProps) {
  const [activeId, setActiveId] = React.useState<CompassFloatingNavItemId>(
    props.activeId,
  );
  React.useEffect(() => setActiveId(props.activeId), [props.activeId]);

  return (
    <CompassFloatingNav
      {...props}
      activeId={activeId}
      onItemSelect={setActiveId}
    />
  );
}

const meta = {
  title: "Compass/UI/CompassFloatingNav",
  component: CompassFloatingNav,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  decorators: [
    (Story) => (
      <div className="dark bg-[var(--color-neutral-950)] p-[var(--spacing-8)]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    disabled: { control: "boolean" },
  },
  args: {
    activeId: "compass",
    disabled: false,
  },
  render: (args) => <ControlledCompassFloatingNav {...args} />,
} satisfies Meta<typeof CompassFloatingNav>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const active = canvas.getByRole("tab", { name: "Compass" });
    await expect(active).toHaveAttribute("aria-selected", "true");
  },
};
