"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, within } from "storybook/test";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%F0%9F%93%8C-GB_Design-System--Atom-?node-id=7372-2";

const SAMPLE_TEXT = "타이포그래피 Typography 123";

const WEIGHTS = [
  "black",
  "extra-bold",
  "bold",
  "semi-bold",
  "medium",
  "regular",
  "light",
  "extra-light",
  "thin",
] as const;

interface SizeGroupData {
  title: string;
  description: string;
  sizes: readonly string[];
}

const GROUPS: SizeGroupData[] = [
  {
    title: "Display",
    description: "6xl ~ 9xl (60px ~ 128px)",
    sizes: ["9xl", "8xl", "7xl", "6xl"],
  },
  {
    title: "Heading",
    description: "lg ~ 5xl (18px ~ 48px)",
    sizes: ["5xl", "4xl", "3xl", "2xl", "xl", "lg"],
  },
  {
    title: "Body",
    description: "xxs ~ base (8px ~ 16px)",
    sizes: ["base", "sm", "xs", "xxs"],
  },
];

/** size × weight 격자에 속하지 않는 단독 스타일 (Figma `Time Stamp/Regular`). */
const STANDALONE_CLASSES = ["text-time-stamp"] as const;

interface ResolvedStyle {
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
}

function useResolvedTextStyle(ref: React.RefObject<HTMLSpanElement | null>) {
  const [style, setStyle] = React.useState<ResolvedStyle | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const computed = getComputedStyle(ref.current);
    setStyle({
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      lineHeight: computed.lineHeight,
    });
  }, [ref]);

  return style;
}

function TypeSpecimen({ size, weight }: { size: string; weight: string }) {
  const className = `text-${size}-${weight}`;
  const ref = React.useRef<HTMLSpanElement>(null);
  const style = useResolvedTextStyle(ref);

  return (
    <div className="flex items-baseline gap-[var(--spacing-4)] border-b-[length:var(--border-1)] border-border py-[var(--spacing-3)]">
      <span
        ref={ref}
        className={className}
        style={{ color: "var(--color-foreground)" }}
      >
        {SAMPLE_TEXT}
      </span>
      <span className="text-xs-regular ml-auto shrink-0 whitespace-nowrap font-mono text-muted-foreground">
        .{className} · {style?.fontSize ?? "…"} / {style?.fontWeight ?? "…"} /{" "}
        {style?.lineHeight ?? "…"}
      </span>
    </div>
  );
}

function StandaloneSpecimen({ className }: { className: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const style = useResolvedTextStyle(ref);

  return (
    <div className="flex items-baseline gap-[var(--spacing-4)] border-b-[length:var(--border-1)] border-border py-[var(--spacing-3)]">
      <span
        ref={ref}
        className={className}
        style={{ color: "var(--color-foreground)" }}
      >
        {SAMPLE_TEXT}
      </span>
      <span className="text-xs-regular ml-auto shrink-0 whitespace-nowrap font-mono text-muted-foreground">
        .{className} · {style?.fontSize ?? "…"} / {style?.fontWeight ?? "…"} /{" "}
        {style?.lineHeight ?? "…"}
      </span>
    </div>
  );
}

function SizeSection({ size }: { size: string }) {
  return (
    <div className="flex flex-col gap-[var(--spacing-2)]">
      <h4 className="text-sm-semi-bold text-muted-foreground">{size}</h4>
      <div className="flex flex-col">
        {WEIGHTS.map((weight) => (
          <TypeSpecimen key={weight} size={size} weight={weight} />
        ))}
      </div>
    </div>
  );
}

function TypeGroup({ title, description, sizes }: SizeGroupData) {
  return (
    <section className="flex flex-col gap-[var(--spacing-4)]">
      <div className="flex flex-col gap-[var(--spacing-1)]">
        <h3 className="text-lg-semi-bold text-foreground">{title}</h3>
        <p className="text-sm-regular text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col gap-[var(--spacing-6)]">
        {sizes.map((size) => (
          <SizeSection key={size} size={size} />
        ))}
      </div>
    </section>
  );
}

function TypographyFoundation() {
  return (
    <div className="flex flex-col gap-[var(--spacing-8)] p-[var(--spacing-6)]">
      <div className="flex flex-col gap-[var(--spacing-1)]">
        <h2 className="text-xl-semi-bold text-foreground">Typography</h2>
        <p className="text-sm-regular text-muted-foreground">
          src/tokens/text-styles.css 전체 127개 텍스트 스타일 — size × weight
          126개를 Display/Heading/Body로 그룹핑하고, 격자에 속하지 않는 단독
          스타일 1개를 아래에 따로 뒀습니다. font-size / font-weight /
          line-height는 getComputedStyle로 런타임에 읽은 실제 값입니다.
        </p>
      </div>

      <div className="flex flex-col gap-[var(--spacing-8)]">
        {GROUPS.map((group) => (
          <TypeGroup key={group.title} {...group} />
        ))}
        <section className="flex flex-col gap-[var(--spacing-4)]">
          <div className="flex flex-col gap-[var(--spacing-1)]">
            <h3 className="text-lg-semi-bold text-foreground">Standalone</h3>
            <p className="text-sm-regular text-muted-foreground">
              size × weight 격자에 속하지 않는 스타일
            </p>
          </div>
          <div className="flex flex-col">
            {STANDALONE_CLASSES.map((className) => (
              <StandaloneSpecimen key={className} className={className} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

const meta = {
  title: "Foundation/Typography",
  component: TypographyFoundation,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
} satisfies Meta<typeof TypographyFoundation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllStyles: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Display")).toBeInTheDocument();
    await expect(canvas.getByText("Heading")).toBeInTheDocument();
    await expect(canvas.getByText("Body")).toBeInTheDocument();
    await expect(
      canvas.getAllByText(/\.text-base-regular/).length,
    ).toBeGreaterThan(0);
  },
};
