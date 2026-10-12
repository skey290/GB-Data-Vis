"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, within } from "storybook/test";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%F0%9F%93%8C-GB_Design-System--Atom-?node-id=7370-603";

const SPACING_STEPS = [
  "0",
  "0-5",
  "1",
  "1-5",
  "2",
  "2-5",
  "3",
  "3-5",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "16",
  "20",
  "24",
  "32",
  "64",
] as const;

function useResolvedValue(
  ref: React.RefObject<HTMLDivElement | null>,
  property: "padding" | "columnGap",
) {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if (!ref.current) return;
    setValue(getComputedStyle(ref.current)[property].trim());
  }, [ref, property]);

  return value;
}

function PaddingSwatch({ step }: { step: string }) {
  const varName = `--spacing-${step}`;
  const ref = React.useRef<HTMLDivElement>(null);
  const value = useResolvedValue(ref, "padding");

  return (
    <div className="flex flex-col gap-[var(--spacing-2)]">
      <div
        ref={ref}
        className="h-[56px] w-[56px] rounded-[var(--radius-scale-sm)] border-[length:var(--border-1)] border-border bg-background"
        style={{ padding: `var(${varName})` }}
      >
        <div className="h-full w-full rounded-[var(--radius-scale-xs)] bg-primary" />
      </div>
      <span className="text-xs-medium break-all font-mono text-foreground">
        {varName}
      </span>
      <span className="text-xs-regular font-mono text-muted-foreground">
        {value || "…"}
      </span>
    </div>
  );
}

function GapSwatch({ step }: { step: string }) {
  const varName = `--spacing-${step}`;
  const ref = React.useRef<HTMLDivElement>(null);
  const value = useResolvedValue(ref, "columnGap");

  return (
    <div className="flex flex-col gap-[var(--spacing-2)]">
      <div
        ref={ref}
        className="flex h-[32px] items-center rounded-[var(--radius-scale-sm)] border-[length:var(--border-1)] border-border bg-background p-[var(--spacing-2)]"
        style={{ gap: `var(${varName})` }}
      >
        <div className="h-full w-[16px] shrink-0 rounded-[var(--radius-scale-xs)] bg-primary" />
        <div className="h-full w-[16px] shrink-0 rounded-[var(--radius-scale-xs)] bg-primary" />
      </div>
      <span className="text-xs-medium break-all font-mono text-foreground">
        {varName}
      </span>
      <span className="text-xs-regular font-mono text-muted-foreground">
        {value || "…"}
      </span>
    </div>
  );
}

function SpacingFoundation() {
  return (
    <div className="flex flex-col gap-[var(--spacing-8)] p-[var(--spacing-6)]">
      <div className="flex flex-col gap-[var(--spacing-1)]">
        <h2 className="text-xl-semi-bold text-foreground">Spacing</h2>
        <p className="text-sm-regular text-muted-foreground">
          Figma `space` 변수 컬렉션 {SPACING_STEPS.length}개.
          padding·gap·margin이 하나의 숫자 스케일을 공유하고, 방향이 필요한
          곳(pt/pr/pb/pl 등)에는 이 스케일 값을 속성별로 개별 적용합니다. 값은
          getComputedStyle로 런타임에 읽은 결과입니다.
        </p>
      </div>

      <section className="flex flex-col gap-[var(--spacing-3)]">
        <h3 className="text-sm-semi-bold text-foreground">
          Padding 예시 (전체 방향 적용)
        </h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[var(--spacing-4)]">
          {SPACING_STEPS.map((step) => (
            <PaddingSwatch key={step} step={step} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-[var(--spacing-3)]">
        <h3 className="text-sm-semi-bold text-foreground">Gap 예시</h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[var(--spacing-4)]">
          {SPACING_STEPS.map((step) => (
            <GapSwatch key={step} step={step} />
          ))}
        </div>
      </section>
    </div>
  );
}

const meta = {
  title: "Foundation/Spacing",
  component: SpacingFoundation,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
} satisfies Meta<typeof SpacingFoundation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllSpacing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByText("--spacing-4")[0]).toBeInTheDocument();
    await expect(canvas.getAllByText("--spacing-64")[0]).toBeInTheDocument();
  },
};
