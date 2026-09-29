"use client";

import * as React from "react";

import { createSpriteIcon } from "@/lib/sprite-icon";
import { Toggle, type ToggleItem } from "@/components/ui/toggle";

/**
 * Figma "Toggle"(❄️ GB_Compass, C34HOpbSASmThFA1iYFm8D) — GNB 근처에 항상 떠 있는
 * Analysis 서브메뉴(node `I8052:33420;8045:20717;5133:9483`, GNB 인스턴스 안에
 * 오버레이로 겹쳐진 `orientation="vertical"` 4버튼 `Toggle`, 2026-09-29 실측).
 *
 * 새 UI가 아니라 기존 `components/ui/toggle`(`orientation="vertical"`)을 감싸는
 * 얇은 어댑터입니다 — `toggle.stories.tsx`의 `VerticalWithLabels` 플레이스홀더가
 * 이미 이 4개 라벨(Growth Potential/Reach/Engagement/Ranking)로 구성돼 있었습니다.
 * 아이콘은 전부 기존 `public/icons.svg` 스프라이트에 있어 신규 추가가 필요 없었습니다
 * (circle-arrow-out-up-right-icon/reach-icon/engagement-icon/crown-icon).
 *
 * `Toggle`은 항목별 `pressed` 불리언 배열이라 단일 선택(라디오) 규칙이 없으므로,
 * 이 어댑터가 `value`/`onValueChange`로 감싸 라디오처럼 동작하게 한다.
 */
export type CompassAnalysisMenuValue =
  "growth-potential" | "reach" | "engagement" | "ranking";

export interface CompassAnalysisMenuProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  value: CompassAnalysisMenuValue;
  onValueChange?: (value: CompassAnalysisMenuValue) => void;
  disabled?: boolean;
}

const GrowthPotentialIcon = createSpriteIcon("circle-arrow-out-up-right-icon");
const ReachIcon = createSpriteIcon("reach-icon");
const EngagementIcon = createSpriteIcon("engagement-icon");
const RankingIcon = createSpriteIcon("crown-icon");

const MENU_ITEMS: {
  value: CompassAnalysisMenuValue;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "growth-potential",
    label: "Growth Potential",
    icon: <GrowthPotentialIcon aria-hidden="true" className="size-full" />,
  },
  {
    value: "reach",
    label: "Reach",
    icon: <ReachIcon aria-hidden="true" className="size-full" />,
  },
  {
    value: "engagement",
    label: "Engagement",
    icon: <EngagementIcon aria-hidden="true" className="size-full" />,
  },
  {
    value: "ranking",
    label: "Ranking",
    icon: <RankingIcon aria-hidden="true" className="size-full" />,
  },
];

export function CompassAnalysisMenu({
  value,
  onValueChange,
  disabled = false,
  className,
  ...props
}: CompassAnalysisMenuProps) {
  const items: ToggleItem[] = MENU_ITEMS.map((item) => ({
    icon: item.icon,
    label: item.label,
    "aria-label": item.label,
    pressed: item.value === value,
    onPressedChange: (pressed) => {
      if (pressed) onValueChange?.(item.value);
    },
  }));

  return (
    <Toggle
      orientation="vertical"
      items={items}
      disabled={disabled}
      className={className}
      {...props}
    />
  );
}
