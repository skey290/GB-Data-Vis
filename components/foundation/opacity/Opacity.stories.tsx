"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, within } from "storybook/test";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%F0%9F%93%8C-GB_Design-System--Atom-?node-id=7370-731";

const OPACITY_STEPS = ["50", "70", "80", "85", "90", "100"] as const;

const CHECKERBOARD_STYLE: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(45deg, var(--color-border) 25%, transparent 25%),
    linear-gradient(-45deg, var(--color-border) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--color-border) 75%),
    linear-gradient(-45deg, transparent 75%, var(--color-border) 75%)
  `,
  backgroundSize: "16px 16px",
  backgroundPosition:
    "0 0, 0 8px, 8px calc(8px * -1px), calc(8px * -1px) 0",
};

function useResolvedOpacity(ref: React.RefObject<HTMLDivElement | null>) {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if (!ref.current) return;
    setValue(getComputedStyle(ref.current).opacity.trim());
  }, [ref]);

  return value;
}

function OpacitySwatch({ step }: { step: string }) {
  const varName = `--opacity-${step}`;
  const ref = React.useRef<HTMLDivElement>(null);
  const value = useResolvedOpacity(ref);

  return (
    <div className="flex flex-col gap-[var(--spacing-2)]">
      <div
        className="relative h-[56px] w-[56px] overflow-hidden rounded-[var(--radius-scale-sm)] border-[length:var(--border-1)] border-border"
        style={CHECKERBOARD_STYLE}
      >
        <div
          ref={ref}
          className="absolute inset-0 bg-primary"
          style={{ opacity: `var(${varName})` }}
        />
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

function OpacityFoundation() {
  return (
    <div className="flex flex-col gap-[var(--spacing-6)] p-[var(--spacing-6)]">
      <div className="flex flex-col gap-[var(--spacing-1)]">
        <h2 className="text-xl-semi-bold text-foreground">Opacity</h2>
        <p className="text-sm-regular text-muted-foreground">
          Figma `opacity` 변수 컬렉션 6개. 체커보드 배경 위에 opacity를
          적용한 색상 박스로 투명도를 시각화했으며, 값은 getComputedStyle로
          런타임에 읽은 결과입니다.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-[var(--spacing-4)]">
        {OPACITY_STEPS.map((step) => (
          <OpacitySwatch key={step} step={step} />
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: "Foundation/Opacity",
  component: OpacityFoundation,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
} satisfies Meta<typeof OpacityFoundation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllOpacities: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("--opacity-50")).toBeInTheDocument();
    await expect(canvas.getByText("--opacity-100")).toBeInTheDocument();
  },
};
