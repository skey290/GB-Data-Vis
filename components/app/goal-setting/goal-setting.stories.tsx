import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import { GoalSetting, type GoalSettingAction } from "./goal-setting";

const FIGMA_URL =
  "https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8428-155255";

const NOW_ACTIONS: GoalSettingAction[] = [
  {
    id: "content-studio-draft",
    category: "Content Studio",
    label: "Draft 3 posts in Content Studio",
  },
  {
    id: "assets-series-a",
    category: "Assets",
    label: "Add your Series A case to Assets",
  },
  {
    id: "content-studio-schedule",
    category: "Content Studio",
    label: "Schedule this week's posts",
  },
  {
    id: "content-studio-extra",
    category: "Content Studio",
    label: "Reply to this week's comments",
  },
];

const GOAL_ACTIONS: GoalSettingAction[] = [
  {
    id: "assets-pitch-deck",
    category: "Assets",
    label: "Create a pitch deck in Assets",
  },
  {
    id: "assets-1-pager",
    category: "Assets",
    label: "Build your 1-pager site in Assets",
  },
  {
    id: "content-studio-podcasts",
    category: "Content Studio",
    label: "Reach out to 2 fintech podcasts",
  },
  {
    id: "assets-extra-1",
    category: "Assets",
    label: "Update your investor FAQ",
  },
  {
    id: "assets-extra-2",
    category: "Assets",
    label: "Refresh your case study metrics",
  },
];

const meta = {
  title: "App/GoalSetting",
  component: GoalSetting,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
    docs: {
      description: {
        component:
          'Implemented as GoalSetting in components/app/goal-setting/goal-setting.tsx. Figma\'s "My goal" redesign replaces the old Brand Position/Target form with a Known-for-Now / Known-for-Next pair, each independently editable (pencil button or clicking the statement box opens a Textarea + Cancel/Save), plus a collapsible "Gabrielle suggests N actions" accordion per section. Known for Next additionally carries a settings sentence whose Frequency/Followers/Timeframe chips expand an inline panel (stepper+toggle / slider / toggle list) while editing. See docs/components/goal-setting.md.',
      },
    },
  },
  argTypes: {
    defaultNow: { control: "text" },
    defaultGoal: { control: "text" },
    defaultPostingFrequency: {
      control: "radio",
      options: ["Day", "Week", "Month"],
    },
    defaultTimeframe: {
      control: "radio",
      options: ["1 month", "3 months", "6 months", "1 year"],
    },
    defaultTargetedFollowersIndex: {
      control: { type: "range", min: 0, max: 5, step: 1 },
    },
    defaultPostingCount: { control: { type: "number", min: 1 } },
  },
  args: {
    defaultNow:
      "I'm known for financial modeling and data analysis in early-stage startups.",
    defaultGoal:
      "I'm known for Finance-Fluent Modeling Partner for early-stage SaaS founders.",
    defaultPostingCount: 3,
    defaultPostingFrequency: "Day",
    defaultTargetedFollowersIndex: 1,
    defaultTimeframe: "1 year",
    nowActions: NOW_ACTIONS,
    goalActions: GOAL_ACTIONS,
    onClose: fn(),
    onNowChange: fn(),
    onGoalChange: fn(),
    onPostingCountChange: fn(),
    onPostingFrequencyChange: fn(),
    onTargetedFollowersIndexChange: fn(),
    onTimeframeChange: fn(),
  },
} satisfies Meta<typeof GoalSetting>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
