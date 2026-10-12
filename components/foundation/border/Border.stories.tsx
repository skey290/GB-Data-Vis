"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, within } from "storybook/test";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%F0%9F%93%8C-GB_Design-System--Atom-?node-id=7370-716";

const BORDER_STEPS = ["0", "1", "2", "3"] as const;

function useResolvedBorderWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if (!ref.current) return;
    setValue(getComputedStyle(ref.current).borderWidth.trim());
  }, [ref]);

  return value;
}

function BorderSwatch({ step }: { step: string }) {
  const varName = `--border-${step}`;
  const ref = React.useRef<HTMLDivElement>(null);
  const value = useResolvedBorderWidth(ref);

  return (
    <div className="flex flex-col gap-[var(--spacing-2)]">
      <div
        ref={ref}
        className="h-[56px] w-[56px] rounded-[var(--radius-scale-sm)] bg-background"
        style={{
          borderStyle: "solid",
          borderColor: "var(--color-border)",
          borderWidth: `var(${varName})`,
        }}
      />
      <span className="text-xs-medium break-all font-mono text-foreground">
        {varName}
      </span>
      <span className="text-xs-regular font-mono text-muted-foreground">
        {value || "…"}
      </span>
    </div>
  );
}

function BorderFoundation() {
  return (
    <div className="flex flex-col gap-[var(--spacing-8)] p-[var(--spacing-6)]">
      <div className="flex flex-col gap-[var(--spacing-1)]">
        <h2 className="text-xl-semi-bold text-foreground">Border</h2>
        <p className="text-sm-regular text-muted-foreground">
          Figma `stroke` 변수 컬렉션 {BORDER_STEPS.length}개. 보더와 아이콘·벡터
          스트로크가 같은 정수 스케일을 쓰고, 방향별 변수는 두지 않고 속성별로
          개별 적용합니다. 값은 getComputedStyle로 런타임에 읽은 결과입니다.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[var(--spacing-4)]">
        {BORDER_STEPS.map((step) => (
          <BorderSwatch key={step} step={step} />
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: "Foundation/Border",
  component: BorderFoundation,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
} satisfies Meta<typeof BorderFoundation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllBorders: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("--border-1")).toBeInTheDocument();
    await expect(canvas.getByText("--border-2")).toBeInTheDocument();
  },
};
