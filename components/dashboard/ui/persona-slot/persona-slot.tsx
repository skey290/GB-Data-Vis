"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

/**
 * Figma `Part/persona` (GB_Dashboard, node 8004:5477) — 40×40 원형 페르소나 슬롯.
 * `PersonaOrbit`이 8개를 원형으로 배치해 사용하는 최소 단위입니다
 * (`components/ui/persona-radial-chart`가 이 두 컴포넌트를 조합해서 씁니다).
 *
 * Figma variant는 `style`(9개 페르소나 + empty) × `status`(default/active) = 20종인데,
 * `style`은 어떤 페르소나인지에 대한 데이터일 뿐이라 별도 enum prop을 두지 않고
 * `persona`가 있는지 여부로 `style=empty` ↔ 실제 페르소나를 가릅니다.
 */

export interface PersonaSlotPersona {
  /** 아바타 alt 텍스트 */
  name: string;
  /** 아바타 이미지 URL. 없으면 initials → 아이콘 순으로 폴백됩니다 */
  imageSrc?: string;
  /** 아바타 이미지가 없을 때 표시할 이니셜 */
  initials?: string;
}

export interface PersonaSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 표시할 페르소나. 없으면 "No Self" 빈 슬롯(Figma `style=empty`)이 됩니다 */
  persona?: PersonaSlotPersona | null;
  /** Figma `status=active` — 흰 링 강조 (아바타는 블러+딤 오버레이, 빈 슬롯은 배경 채움) */
  active?: boolean;
}

/** 빈 슬롯에 표시되는 플레이스홀더 문구 (Figma 원본 그대로) */
const PLACEHOLDER_LABEL = "No Self";

const MOTION_DURATION = "duration-200 ease-out";
const COLOR_TRANSITION = `transition-colors ${MOTION_DURATION} motion-reduce:transition-none`;
const EFFECT_TRANSITION = `transition-[filter,opacity] ${MOTION_DURATION} motion-reduce:transition-none`;

/**
 * border가 아니라 outline을 쓰는 이유는 `persona-radial-chart.tsx`의 동일 로직과
 * 같습니다 — outline은 레이아웃을 차지하지 않아 40px 크기가 유지되고, 색만
 * 애니메이션되어 빈 슬롯의 dashed 보더 위를 부드럽게 덮을 수 있습니다.
 */
const HIGHLIGHT_RING =
  "outline-solid outline-[length:var(--border-2)] -outline-offset-2";
const HIGHLIGHT_RING_ON =
  "outline-[color:var(--color-semantic-non-changeable)]";
const HIGHLIGHT_RING_OFF = "outline-transparent";

export function PersonaSlot({
  persona,
  active = false,
  className,
  ...props
}: PersonaSlotProps) {
  if (persona) {
    return (
      <div
        className={cn(
          "relative overflow-hidden",
          "size-[calc(var(--scale-40)*1px)]",
          "rounded-[var(--radius-scale-full)]",
          HIGHLIGHT_RING,
          COLOR_TRANSITION,
          active ? HIGHLIGHT_RING_ON : HIGHLIGHT_RING_OFF,
          className,
        )}
        {...props}
      >
        <Avatar
          variant="image"
          src={persona.imageSrc}
          initials={persona.initials}
          alt={persona.name}
          className={cn(
            "size-full",
            EFFECT_TRANSITION,
            // Figma Effect는 FOREGROUND_BLUR radius 8 → CSS blur(4px) = --blur-sm
            active ? "[filter:var(--blur-sm)]" : "[filter:var(--blur-none)]",
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0",
            "rounded-[var(--radius-scale-full)]",
            "bg-[var(--background-backdrop)]",
            EFFECT_TRANSITION,
            active ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={PLACEHOLDER_LABEL}
      className={cn(
        "flex items-center justify-center",
        "size-[calc(var(--scale-40)*1px)]",
        "rounded-[var(--radius-scale-full)]",
        "text-xxs-medium text-muted-foreground",
        "border-[length:var(--border-1)] border-dashed",
        "border-[color:var(--color-muted-foreground)]",
        HIGHLIGHT_RING,
        COLOR_TRANSITION,
        active
          ? cn(HIGHLIGHT_RING_ON, "bg-[var(--background-sheer)]")
          : cn(HIGHLIGHT_RING_OFF, "bg-transparent"),
        className,
      )}
      {...props}
    >
      <span aria-hidden="true">{PLACEHOLDER_LABEL}</span>
    </div>
  );
}
