"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, within } from "storybook/test";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%F0%9F%93%8C-GB_Design-System--Atom-?node-id=7372-457";

const SHADOW_STEPS = [
  "2xs",
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "inner",
  "none",
  "focus-ring",
  "destructive",
] as const;

/** `""`는 Figma 스타일 이름이 접미사 없는 기본 블러(`blur`/`backdrop-blur`). */
const BLUR_STEPS = ["none", "sm", "", "md", "lg", "xl", "2xl", "3xl"] as const;

const STRIPE_STYLE: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(45deg, var(--color-primary) 0, var(--color-primary) 8px, var(--color-accent) 8px, var(--color-accent) 16px)",
};

function useResolvedValue(
  ref: React.RefObject<HTMLDivElement | null>,
  property: "boxShadow" | "backdropFilter" | "filter",
) {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if (!ref.current) return;
    setValue(getComputedStyle(ref.current)[property].trim());
  }, [ref, property]);

  return value;
}

function ShadowSwatch({ step }: { step: string }) {
  const varName = `--shadow-${step}`;
  const ref = React.useRef<HTMLDivElement>(null);
  const value = useResolvedValue(ref, "boxShadow");

  return (
    <div className="flex flex-col gap-[var(--spacing-2)]">
      <div className="flex h-[80px] items-center justify-center rounded-[var(--radius-scale-md)] bg-muted">
        <div
          ref={ref}
          className="h-[48px] w-[48px] rounded-[var(--radius-scale-md)] bg-card"
          style={{ boxShadow: `var(${varName})` }}
        />
      </div>
      <span className="text-xs-medium break-all font-mono text-foreground">
        {varName}
      </span>
      <span className="text-xs-regular break-all font-mono text-muted-foreground">
        {value || "…"}
      </span>
    </div>
  );
}

function BackdropBlurSwatch({ step }: { step: string }) {
  const varName = step ? `--backdrop-blur-${step}` : "--backdrop-blur";
  const ref = React.useRef<HTMLDivElement>(null);
  const value = useResolvedValue(ref, "backdropFilter");

  return (
    <div className="flex flex-col gap-[var(--spacing-2)]">
      <div
        className="relative flex h-[80px] items-center justify-center overflow-hidden rounded-[var(--radius-scale-md)]"
        style={STRIPE_STYLE}
      >
        <div
          ref={ref}
          className="h-[56px] w-[56px] rounded-[var(--radius-scale-md)] border-[length:var(--border-1)] border-border bg-background/40"
          style={{
            backdropFilter: `var(${varName})`,
            WebkitBackdropFilter: `var(${varName})`,
          }}
        />
      </div>
      <span className="text-xs-medium break-all font-mono text-foreground">
        {varName}
      </span>
      <span className="text-xs-regular break-all font-mono text-muted-foreground">
        {value || "…"}
      </span>
    </div>
  );
}

function BlurSwatch({ step }: { step: string }) {
  const varName = step ? `--blur-${step}` : "--blur";
  const ref = React.useRef<HTMLDivElement>(null);
  const value = useResolvedValue(ref, "filter");

  return (
    <div className="flex flex-col gap-[var(--spacing-2)]">
      <div className="flex h-[80px] items-center justify-center overflow-hidden rounded-[var(--radius-scale-md)] bg-muted">
        <div
          ref={ref}
          className="h-[48px] w-[48px] rounded-full bg-primary"
          style={{ filter: `var(${varName})` }}
        />
      </div>
      <span className="text-xs-medium break-all font-mono text-foreground">
        {varName}
      </span>
      <span className="text-xs-regular break-all font-mono text-muted-foreground">
        {value || "…"}
      </span>
    </div>
  );
}

function EffectsFoundation() {
  return (
    <div className="flex flex-col gap-[var(--spacing-8)] p-[var(--spacing-6)]">
      <div className="flex flex-col gap-[var(--spacing-1)]">
        <h2 className="text-xl-semi-bold text-foreground">Effects</h2>
        <p className="text-sm-regular text-muted-foreground">
          src/tokens/effects.css 전체 27개 토큰 (Box Shadow 11 + Backdrop Blur 8
          + Blur 8). 각 값은 box-shadow / backdrop-filter / filter로 실제 적용해
          시각화했으며, 하단 텍스트는 getComputedStyle로 읽은 원본 값
          문자열입니다.
        </p>
      </div>

      <div className="flex flex-col gap-[var(--spacing-3)]">
        <h3 className="text-lg-semi-bold text-foreground">Box Shadow</h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[var(--spacing-4)]">
          {SHADOW_STEPS.map((step) => (
            <ShadowSwatch key={step} step={step} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-[var(--spacing-3)]">
        <h3 className="text-lg-semi-bold text-foreground">Backdrop Blur</h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[var(--spacing-4)]">
          {BLUR_STEPS.map((step) => (
            <BackdropBlurSwatch key={step} step={step} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-[var(--spacing-3)]">
        <h3 className="text-lg-semi-bold text-foreground">Blur</h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[var(--spacing-4)]">
          {BLUR_STEPS.map((step) => (
            <BlurSwatch key={step} step={step} />
          ))}
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "Foundation/Effects",
  component: EffectsFoundation,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
} satisfies Meta<typeof EffectsFoundation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllEffects: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("--shadow-md")).toBeInTheDocument();
    await expect(canvas.getByText("--backdrop-blur-lg")).toBeInTheDocument();
    await expect(canvas.getByText("--blur-xl")).toBeInTheDocument();
  },
};
