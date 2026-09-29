import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, userEvent, within } from "storybook/test";

import { Tabs, type TabItem } from "./tabs";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%E2%9D%84%EF%B8%8F-GB_Design-System---Atom?node-id=76-10755";

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

const ITEMS = [
  { label: "전체", count: 12 },
  { label: "진행중", count: 4 },
  { label: "완료" },
];

function TabsDemo() {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  return (
    <Tabs
      items={ITEMS}
      selectedIndex={selectedIndex}
      onSelectedIndexChange={setSelectedIndex}
    />
  );
}

export const Default: Story = {
  args: {
    items: ITEMS,
    selectedIndex: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectedTab = canvas.getByRole("tab", { name: /전체/ });

    await expect(canvas.getByRole("tablist")).toBeInTheDocument();
    await expect(selectedTab).toHaveAttribute("aria-selected", "true");
  },
};

export const Interactive: Story = {
  args: {
    items: ITEMS,
    selectedIndex: 0,
  },
  render: () => <TabsDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inProgressTab = canvas.getByRole("tab", { name: /진행중/ });

    await expect(inProgressTab).toHaveAttribute("aria-selected", "false");

    await userEvent.click(inProgressTab);

    await expect(inProgressTab).toHaveAttribute("aria-selected", "true");
  },
};

// Figma "PartTab"의 state=disabled에 대응 — 클릭 불가, 카운트가 있어도
// 배지를 렌더링하지 않습니다.
export const Disabled: Story = {
  args: {
    items: [
      { label: "전체", count: 12 },
      { label: "진행중", count: 4, disabled: true },
      { label: "완료" },
    ],
    selectedIndex: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disabledTab = canvas.getByRole("tab", { name: /진행중/ });

    await expect(disabledTab).toBeDisabled();
    await expect(canvas.queryByText("4")).not.toBeInTheDocument();
  },
};

// Figma의 "Nuber" variant(2~8개 탭)에 대응 — 탭 개수와 탭별 배지 표시 여부를
// Storybook Controls 패널에서 직접 조절할 수 있게 합니다.
// Figma 기본 상태는 모든 탭에 배지가 표시되어 있으므로 기본값도 전부 true로 맞춥니다.
const TAB_COUNT_OPTIONS = [2, 3, 4, 5, 6, 7, 8] as const;
const MAX_TAB_COUNT = 8;
const BADGE_ARG_KEYS = Array.from(
  { length: MAX_TAB_COUNT },
  (_, index) => `badge${index + 1}` as const,
);

function buildItems(tabCount: number, badgeVisible: boolean[]): TabItem[] {
  return Array.from({ length: tabCount }, (_, index) => ({
    label: `탭 ${index + 1}`,
    count: badgeVisible[index] ? (index + 1) * 2 : undefined,
  }));
}

type TabCountStoryArgs = {
  tabCount: (typeof TAB_COUNT_OPTIONS)[number];
} & Record<(typeof BADGE_ARG_KEYS)[number], boolean>;

export const TabCountAndBadge: StoryObj<TabCountStoryArgs> = {
  args: {
    tabCount: 4,
    ...Object.fromEntries(BADGE_ARG_KEYS.map((key) => [key, true])),
  } as TabCountStoryArgs,
  argTypes: {
    tabCount: {
      control: { type: "select" },
      options: TAB_COUNT_OPTIONS,
      description: "표시할 탭 개수 (Figma 'Nuber' variant: 2~8)",
    },
    ...Object.fromEntries(
      BADGE_ARG_KEYS.map((key, index) => [
        key,
        {
          control: "boolean",
          description: `탭 ${index + 1}의 카운트 배지 표시 여부 (탭 개수보다 큰 번호는 무시됨)`,
        },
      ]),
    ),
  },
  render: function Render(args) {
    const { tabCount } = args;
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const badgeVisible = BADGE_ARG_KEYS.map((key) => args[key]);
    const items = React.useMemo(
      () => buildItems(tabCount, badgeVisible),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [tabCount, ...badgeVisible],
    );

    React.useEffect(() => {
      setSelectedIndex(0);
    }, [tabCount]);

    return (
      <Tabs
        items={items}
        selectedIndex={selectedIndex}
        onSelectedIndexChange={setSelectedIndex}
      />
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole("tab");

    await expect(tabs).toHaveLength(args.tabCount);
  },
};
