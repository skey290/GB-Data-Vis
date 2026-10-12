"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, within } from "storybook/test";

import { cn } from "@/lib/utils";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%F0%9F%93%8C-GB_Design-System--Atom-?node-id=7370-2";

const PRIMITIVE_STEPS = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const;

/** neutral만 11단계 밖에 450을 하나 더 갖는다 (Figma `neutral/450`). */
const NEUTRAL_STEPS = [
  50, 100, 200, 300, 400, 450, 500, 600, 700, 800, 900, 950,
] as const;

/** Figma `white/aNN`, `black/aNN` 알파 스텝. */
const ALPHA_STEPS = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90] as const;

const PRIMITIVE_PALETTES = [
  "neutral",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "violet",
];

/** 새 Figma 파일 기준 semantic 색상 — background/text/icon/border × 역할 */
const SEMANTIC_GROUPS: { title: string; prefix: string; tokens: string[] }[] =
  [
    {
      title: "Background",
      prefix: "background",
      tokens: [
        "default",
        "subtlest",
        "subtler",
        "subtle",
        "bold",
        "bolder",
        "surface",
        "surface-secondary",
        "overlay",
        "backdrop",
        "sheer",
        "sheer-invert",
        "mute",
        "mute-subtle",
        "mute-subtler",
        "static-white",
        "selected",
        "disabled",
        "disabled-bold",
        "error-default",
        "error-subtle",
        "warning-default",
        "info-default",
        "info-subtle",
        "success-default",
        "success-subtle",
      ],
    },
    {
      title: "Text",
      prefix: "text",
      tokens: [
        "default",
        "subtle",
        "subtler",
        "subtlest",
        "invert",
        "popover",
        "static-white",
        "static-gray",
        "error",
        "error-static",
        "warning",
        "info",
        "success",
        "bold",
        "selected",
        "emphasis",
      ],
    },
    {
      title: "Icon",
      prefix: "icon",
      tokens: [
        "default",
        "subtle",
        "subtlest",
        "invert",
        "static-white",
        "static-gray",
        "error",
        "error-static",
        "warning",
        "info",
        "success",
        "bold",
        "faint",
        "fainter",
        "selected",
        "emphasis",
        "pressed",
      ],
    },
    {
      title: "Border",
      prefix: "border",
      tokens: [
        "default",
        "default-strong",
        "subtle",
        "subtler",
        "bold",
        "bolder",
        "contrast",
        "invert",
        "invert-strong",
        "mute",
        "mute-subtle",
        "muted",
        "overlay",
        "error",
        "error-static",
        "warning",
        "info",
        "success",
        "static-white",
        "static-gray",
        "selected",
      ],
    },
  ];

/** Figma에 이름은 있지만 새 파일에 없는 primitive와 값이 같아 alias로만 존재하는 것들 */
const NON_CHANGEABLE_TOKENS = [
  "accent-non-changeable",
  "semantic-non-changeable",
];

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function stepVars(prefix: string, steps: readonly (string | number)[]) {
  return steps.map((step) => `--color-${prefix}-${step}`);
}

interface PaletteGroupData {
  title: string;
  varNames: string[];
}

const PRIMITIVE_GROUPS: PaletteGroupData[] = [
  { title: "Base", varNames: ["--color-white", "--color-black"] },
  {
    title: "White alpha",
    varNames: ALPHA_STEPS.map((a) => `--color-white-a${a}`),
  },
  {
    title: "Black alpha",
    varNames: ALPHA_STEPS.map((a) => `--color-black-a${a}`),
  },
  ...PRIMITIVE_PALETTES.map((palette) => ({
    title: capitalize(palette),
    varNames: stepVars(
      palette,
      palette === "neutral" ? NEUTRAL_STEPS : PRIMITIVE_STEPS,
    ),
  })),
];

function useResolvedColor(
  ref: React.RefObject<HTMLDivElement | null>,
  varName: string,
) {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if (!ref.current) return;
    setValue(getComputedStyle(ref.current).getPropertyValue(varName).trim());
  }, [ref, varName]);

  return value;
}

function ColorSwatch({
  varName,
  mode,
}: {
  varName: string;
  mode?: "light" | "dark";
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const value = useResolvedColor(ref, varName);

  return (
    <div className="flex flex-col gap-[var(--spacing-1)]">
      <div
        ref={ref}
        className={cn(
          "h-[56px] w-full rounded-[var(--radius-scale-sm)] border-[length:var(--border-1)] border-border",
          mode,
        )}
        style={{ backgroundColor: `var(${varName})` }}
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

function PaletteGroup({ title, varNames }: PaletteGroupData) {
  return (
    <section className="flex flex-col gap-[var(--spacing-3)]">
      <h3 className="text-sm-semi-bold text-foreground">{title}</h3>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-[var(--spacing-3)]">
        {varNames.map((varName) => (
          <ColorSwatch key={varName} varName={varName} />
        ))}
      </div>
    </section>
  );
}

function SemanticRow({ varName }: { varName: string }) {
  return (
    <div className="grid grid-cols-[minmax(192px,1fr)_repeat(2,minmax(128px,1fr))] items-start gap-[var(--spacing-4)] border-b-[length:var(--border-1)] border-border py-[var(--spacing-3)]">
      <span className="text-xs-medium self-center font-mono text-foreground">
        {varName}
      </span>
      <div className="flex flex-col gap-[var(--spacing-1)]">
        <span className="text-xs-regular text-muted-foreground">Light</span>
        <ColorSwatch varName={varName} mode="light" />
      </div>
      <div className="flex flex-col gap-[var(--spacing-1)]">
        <span className="text-xs-regular text-muted-foreground">Dark</span>
        <ColorSwatch varName={varName} mode="dark" />
      </div>
    </div>
  );
}

function ColorFoundation() {
  return (
    <div className="flex flex-col gap-[var(--spacing-8)] p-[var(--spacing-6)]">
      <div className="flex flex-col gap-[var(--spacing-1)]">
        <h2 className="text-xl-semi-bold text-foreground">Colors</h2>
        <p className="text-sm-regular text-muted-foreground">
          src/tokens/colors.css 전체 색상 토큰 (스와치는 CSS 변수 값을 그대로
          렌더링하며, 하단 값은 getComputedStyle로 런타임에 읽은 결과입니다)
        </p>
      </div>

      <div className="flex flex-col gap-[var(--spacing-6)]">
        <h2 className="text-lg-semi-bold text-foreground">Primitive</h2>
        {PRIMITIVE_GROUPS.map((group) => (
          <PaletteGroup key={group.title} {...group} />
        ))}
      </div>

      <div className="flex flex-col gap-[var(--spacing-6)]">
        <h2 className="text-lg-semi-bold text-foreground">
          Semantic (Light / Dark)
        </h2>
        <p className="text-sm-regular text-muted-foreground">
          Light/Dark 79개 시맨틱 토큰 전체가 Figma 기준으로 확정되어 있습니다.
          각 스와치는 조상 요소의 다크모드 상태와 무관하게 `.light`/`.dark`
          클래스로 자기 자신에 값을 강제 재선언해 항상 올바른 모드로
          표시됩니다.
        </p>
        {SEMANTIC_GROUPS.map((group) => (
          <section
            key={group.title}
            className="flex flex-col gap-[var(--spacing-3)]"
          >
            <h3 className="text-sm-semi-bold text-foreground">
              {group.title}
            </h3>
            <div className="flex flex-col">
              {group.tokens.map((token) => (
                <SemanticRow
                  key={token}
                  varName={`--${group.prefix}-${token}`}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="flex flex-col gap-[var(--spacing-3)]">
        <h2 className="text-lg-semi-bold text-foreground">Non-changeable</h2>
        <div className="flex flex-col">
          {NON_CHANGEABLE_TOKENS.map((token) => (
            <SemanticRow key={token} varName={`--color-${token}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "Foundation/Colors",
  component: ColorFoundation,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
} satisfies Meta<typeof ColorFoundation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllColors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("--color-neutral-500")).toBeInTheDocument();
    await expect(canvas.getByText("--color-violet-900")).toBeInTheDocument();
    await expect(
      canvas.getAllByText("--background-default").length,
    ).toBeGreaterThan(0);
    await expect(canvas.getByText("--text-emphasis")).toBeInTheDocument();
    await expect(canvas.getByText("--icon-fainter")).toBeInTheDocument();
    await expect(canvas.getByText("--border-overlay")).toBeInTheDocument();
  },
};
