import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";

import { Tabs, type TabItem } from "./tabs";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%E2%9D%84%EF%B8%8F-GB_Design-System---Atom?node-id=76-10755";

// Figma의 "Nuber" variant(2~8개 탭)에 대응 — 탭 개수를 Controls에서 바로 조절한다.
const TAB_COUNT_OPTIONS = [2, 3, 4, 5, 6, 7, 8] as const;

function buildItems(tabCount: number, disabledIndex: number): TabItem[] {
  return Array.from({ length: tabCount }, (_, index) => ({
    label: `탭 ${index + 1}`,
    count: index + 1,
    disabled: index === disabledIndex,
  }));
}

interface PlaygroundArgs {
  tabCount: (typeof TAB_COUNT_OPTIONS)[number];
  disabledIndex: number;
}

function ControlledTabs({ tabCount, disabledIndex }: PlaygroundArgs) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const items = React.useMemo(
    () => buildItems(tabCount, disabledIndex),
    [tabCount, disabledIndex],
  );

  React.useEffect(() => setSelectedIndex(0), [tabCount]);

  return (
    <Tabs
      items={items}
      selectedIndex={selectedIndex}
      onSelectedIndexChange={setSelectedIndex}
    />
  );
}

const meta = {
  title: "UI/Tabs",
  component: ControlledTabs,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  argTypes: {
    tabCount: {
      control: "select",
      options: TAB_COUNT_OPTIONS,
      description: "표시할 탭 개수 (Figma 'Nuber' variant: 2~8)",
    },
    disabledIndex: {
      control: "number",
      description: "비활성화할 탭 인덱스 (-1이면 전부 활성)",
    },
  },
  args: {
    tabCount: 3,
    disabledIndex: -1,
  },
} satisfies Meta<typeof ControlledTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
