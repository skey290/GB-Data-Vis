"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, within } from "storybook/test";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%F0%9F%93%8C-GB_Design-System--Atom-?node-id=7370-672";

const RADIUS_STEPS = [
  "none",
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "full",
] as const;

function useResolvedValue(
  ref: React.RefObject<HTMLDivElement | null>,
  property: keyof CSSStyleDeclaration,
) {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if (!ref.current) return;
    setValue(String(getComputedStyle(ref.current)[property]));
  }, [ref, property]);

  return value;
}

function RadiusSwatch({ step }: { step: string }) {
  const varName = `--radius-scale-${step}`;
  const ref = React.useRef<HTMLDivElement>(null);
  const value = useResolvedValue(ref, "borderRadius");

  return (
    <div className="flex flex-col gap-[var(--spacing-2)]">
      <div
        ref={ref}
        className="h-[96px] w-[96px] border-[length:var(--border-1)] border-border bg-muted"
        style={{ borderRadius: `var(${varName})` }}
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

function RadiusFoundation() {
  return (
    <div className="flex flex-col gap-[var(--spacing-6)] p-[var(--spacing-6)]">
      <div className="flex flex-col gap-[var(--spacing-1)]">
        <h2 className="text-xl-semi-bold text-foreground">Radius</h2>
        <p className="text-sm-regular text-muted-foreground">
          src/tokens/radius.css 전체 10개 border-radius 토큰. 값은
          getComputedStyle로 런타임에 읽은 결과입니다.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-[var(--spacing-4)]">
        {RADIUS_STEPS.map((step) => (
          <RadiusSwatch key={step} step={step} />
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: "Foundation/Radius",
  component: RadiusFoundation,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
} satisfies Meta<typeof RadiusFoundation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllRadii: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("--radius-scale-md")).toBeInTheDocument();
    await expect(canvas.getByText("--radius-scale-full")).toBeInTheDocument();
  },
};
