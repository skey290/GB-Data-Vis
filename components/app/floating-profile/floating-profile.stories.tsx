import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import { FloatingProfile } from "./floating-profile";

const FIGMA_FILE =
  "https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-";
const FIGMA_URL = `${FIGMA_FILE}?node-id=8163-92774`;

const AVATAR_SRC = "/images/personas/self-default.jpg";
const PORTRAIT_SRC = "/images/personas/self-default.jpg";

const meta = {
  title: "App/FloatingProfile",
  component: FloatingProfile,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
    // Verbatim text from the Figma component's description field
    docs: {
      description: {
        component:
          "The floating profile panel. Clicking the avatar bubble expands a card holding the role name, a ProfilePrint photo, and a Known-for-Now/Known-for-Next pair with a single pencil button that opens the combined goal-edit flow. Without an avatar image (Type=no profile) only the icon fallback shows and the card does not open. Implemented as FloatingProfile in components/app/floating-profile.",
      },
    },
  },
  // The card expands 620px to the left of the avatar — purely presentational padding
  // so it does not get pushed into negative viewport coordinates and disappear
  // (unrelated to design tokens).
  decorators: [
    (Story) => (
      <div className="pl-[700px]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    open: { control: "boolean" },
    avatarSrc: {
      control: "text",
      description:
        "Leave empty for the 'no profile' state (icon fallback) — clicking the avatar is disabled too.",
    },
    title: { control: "text" },
    now: { control: "text" },
    goal: { control: "text" },
    timestamp: { control: "text" },
    imageHover: { control: "boolean" },
    postingCount: { control: { type: "number", min: 1 } },
    postingFrequency: {
      control: "radio",
      options: ["Day", "Week", "Month"],
    },
    targetedFollowersIndex: {
      control: { type: "range", min: 0, max: 5, step: 1 },
    },
    timeframe: {
      control: "radio",
      options: ["1 month", "3 months", "6 months", "1 year"],
    },
    ctaLabel: { control: "text" },
  },
  args: {
    open: true,
    avatarSrc: AVATAR_SRC,
    title: "Data Scientist",
    portraitSrc: PORTRAIT_SRC,
    timestamp: "2026.03.24 19:24:06",
    imageHover: false,
    now: "I'm known for financial modeling and data analysis in early-stage startups.",
    goal: "I'm known for Finance-Fluent Modeling Partner for early-stage SaaS founders.",
    postingCount: 3,
    postingFrequency: "Day",
    targetedFollowersIndex: 1,
    timeframe: "1 year",
    onOpenChange: fn(),
    onEditImage: fn(),
    onEditGoal: fn(),
    onCtaClick: fn(),
  },
} satisfies Meta<typeof FloatingProfile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
