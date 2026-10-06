import type { Meta, StoryObj } from "@storybook/nextjs";

import { GoogleButton } from "./google-button";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%E2%9D%84%EF%B8%8F-GB_Design-System---Atom?node-id=3490-8023";

const meta = {
  title: "UI/GoogleButton",
  component: GoogleButton,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  argTypes: {
    label: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Continue with Google",
    disabled: false,
  },
} satisfies Meta<typeof GoogleButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
