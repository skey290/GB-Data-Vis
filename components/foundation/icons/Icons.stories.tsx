"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, within } from "storybook/test";

import { InputSearch } from "@/components/ui/input-search";
import {
  LUCIDE_SPRITE_MAP,
  SPRITE_ONLY_ICON_IDS,
  type IconId,
  type LucideIconId,
} from "@/lib/sprite-icon";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%F0%9F%93%8C-GB_Design-System--Atom-?node-id=1086-1066";

const LUCIDE_IDS = Object.keys(LUCIDE_SPRITE_MAP) as LucideIconId[];

function LucideGlyph({ id }: { id: LucideIconId }) {
  const Glyph = LUCIDE_SPRITE_MAP[id];
  return (
    <Glyph
      className="size-[24px] text-[var(--gb-icon-default)]"
      aria-hidden="true"
    />
  );
}

function SpriteGlyph({ id }: { id: IconId }) {
  return (
    <svg
      className="size-[24px] text-[var(--gb-icon-default)]"
      aria-hidden="true"
    >
      <use href={`/icons.svg#${id}`} />
    </svg>
  );
}

function IconCell({ id, children }: { id: IconId; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-[var(--gb-spacing-2)]">
      <div className="flex h-[56px] w-full items-center justify-center rounded-[var(--gb-radius-scale-sm)] border-[length:var(--gb-border-1)] border-solid border-[var(--gb-border-default)] bg-[var(--gb-background-surface)]">
        {children}
      </div>
      <span className="text-xs-regular w-full break-all text-center font-mono text-[var(--gb-text-subtle)]">
        {id}
      </span>
    </div>
  );
}

function IconSection({
  title,
  description,
  shown,
  total,
  children,
}: {
  title: string;
  description: string;
  shown: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-[var(--gb-spacing-4)]">
      <div className="flex flex-col gap-[var(--gb-spacing-1)]">
        <h3 className="text-sm-semi-bold text-[var(--gb-text-default)]">
          {title}
          <span className="text-sm-regular text-[var(--gb-text-subtle)]">
            {shown === total ? ` (${total})` : ` (${shown} / ${total})`}
          </span>
        </h3>
        <p className="text-xs-regular text-[var(--gb-text-subtle)]">
          {description}
        </p>
      </div>

      {shown === 0 ? (
        <p className="text-sm-regular text-[var(--gb-text-subtle)]">
          검색 결과가 없습니다.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-[var(--gb-spacing-4)]">
          {children}
        </div>
      )}
    </section>
  );
}

function IconsFoundation() {
  const [query, setQuery] = React.useState("");

  const keyword = query.trim().toLowerCase();
  const matches = (id: string) => id.includes(keyword);

  const lucide = LUCIDE_IDS.filter(matches);
  const sprite = SPRITE_ONLY_ICON_IDS.filter(matches);

  return (
    <div className="flex flex-col gap-[var(--gb-spacing-8)] p-[var(--gb-spacing-6)]">
      <div className="flex flex-col gap-[var(--gb-spacing-1)]">
        <h2 className="text-xl-semi-bold text-[var(--gb-text-default)]">
          Icons
        </h2>
        <p className="text-sm-regular text-[var(--gb-text-subtle)]">
          Figma `Lucide Icons` 페이지의 두 프레임과 같은 기준으로 나뉩니다 —
          라이브러리에 있는 아이콘은 `lucide-react`에서 참조하고, 커스터마이즈한
          아이콘만 `/public/icons.svg` 스프라이트로 보유합니다. 목록은
          `lib/sprite-icon.tsx`에서 그대로 읽어옵니다.
        </p>
      </div>

      <InputSearch
        value={query}
        onValueChange={setQuery}
        placeholder="아이콘 id 검색 (예: chevron, calendar)"
      />

      <IconSection
        title="Lucide 라이브러리 참조"
        description="lucide-react 패키지에서 컴포넌트로 가져옵니다. svg 파일에는 들어있지 않습니다."
        shown={lucide.length}
        total={LUCIDE_IDS.length}
      >
        {lucide.map((id) => (
          <IconCell key={id} id={id}>
            <LucideGlyph id={id} />
          </IconCell>
        ))}
      </IconSection>

      <IconSection
        title="커스텀 SVG"
        description="/public/icons.svg 심볼을 참조합니다. 선 색은 currentColor로 테마를 따라가고, 브랜드 로고는 고유 색을 유지합니다."
        shown={sprite.length}
        total={SPRITE_ONLY_ICON_IDS.length}
      >
        {sprite.map((id) => (
          <IconCell key={id} id={id}>
            <SpriteGlyph id={id} />
          </IconCell>
        ))}
      </IconSection>
    </div>
  );
}

const meta = {
  title: "Foundation/Icons",
  component: IconsFoundation,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
} satisfies Meta<typeof IconsFoundation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllIcons: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("chevron-down-icon")).toBeInTheDocument();
    await expect(canvas.getByText("google-icon")).toBeInTheDocument();
  },
};
