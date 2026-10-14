"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

/**
 * Figma `Part/self` (📌 GB_UXUI 261002, node 8133:122512) — 40×40 원형 페르소나 슬롯.
 * `SelfCuration`이 8개를 원형으로 배치해 사용하는 최소 단위입니다
 * (`components/dashboard/ui/persona-radial-chart`가 이 두 컴포넌트를 조합해서 씁니다).
 *
 * Figma variant는 `style`(empty/data scientist 샘플) × `status`(default/active) = 4종인데,
 * `style`은 어떤 페르소나인지에 대한 샘플 데이터일 뿐이라 별도 enum prop을 두지 않고
 * `persona`가 있는지 여부로 `style=empty` ↔ 실제 페르소나를 가릅니다.
 */

export interface SelfSlotPersona {
  /** 아바타 alt 텍스트 */
  name: string;
  /** 아바타 이미지 URL. 없으면 initials → 아이콘 순으로 폴백됩니다 */
  imageSrc?: string;
  /** 아바타 이미지가 없을 때 표시할 이니셜 */
  initials?: string;
}

export interface SelfSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 표시할 페르소나. 없으면 "No Self" 빈 슬롯(Figma `style=empty`)이 됩니다 */
  persona?: SelfSlotPersona | null;
  /** Figma `Status` variant. `active`는 흰 링 강조(아바타는 블러+딤 오버레이, 빈 슬롯은 배경 채움) */
  status?: "default" | "active";
}

/** 빈 슬롯에 표시되는 플레이스홀더 문구 (Figma 원본 그대로) */
const PLACEHOLDER_LABEL = "No Self";

const MOTION_DURATION = "duration-200 ease-out";
const COLOR_TRANSITION = `transition-colors ${MOTION_DURATION} motion-reduce:transition-none`;
const EFFECT_TRANSITION = `transition-[filter,opacity] ${MOTION_DURATION} motion-reduce:transition-none`;

/**
 * 강조 링은 outline이 아니라 **별도 span 레이어**로 그립니다.
 *
 * 처음엔 `-outline-offset-2`(음수 오프셋) outline을 썼는데, 브라우저에서
 * 직접 확인해보니 40px를 꽉 채우는 자식(아바타 이미지)이 그 outline을
 * 가려버렸습니다 — outline이 항상 자식 위에 그려진다는 스펙이 이 음수
 * 오프셋 + 꽉 찬 자식 조합에서는 지켜지지 않았습니다(Chrome 기준 실측).
 * 그래서 링을 아바타/딤 오버레이 뒤가 아니라 **DOM상 가장 마지막 형제
 * 요소**로 두어, 일반적인 페인트 순서만으로 항상 위에 그려지도록 합니다.
 */
const RING_BORDER = "border-[length:var(--border-2)] border-solid";
const RING_ON = "border-[color:var(--border-static-white)]";
const RING_OFF = "border-transparent";

export function SelfSlot({
  persona,
  status = "default",
  className,
  ...props
}: SelfSlotProps) {
  const isActive = status === "active";

  if (persona) {
    return (
      <div
        className={cn(
          "relative",
          "size-[40px]",
          "rounded-[var(--radius-scale-full)]",
          className,
        )}
        {...props}
      >
        <Avatar
          variant="image"
          shape="circle"
          src={persona.imageSrc}
          initials={persona.initials}
          alt={persona.name}
          className={cn(
            "size-full",
            EFFECT_TRANSITION,
            // Figma named style "Backdrop Blur/backdrop-blur"(접미사 없음) radius 8
            // = --backdrop-blur(8px, -sm이 아님). 아바타 뒤에 다른 레이어가 없어
            // filter로 적용해도 backdrop-filter와 결과가 같다.
            isActive
              ? "[filter:var(--backdrop-blur)]"
              : "[filter:var(--backdrop-blur-none)]",
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0",
            "rounded-[var(--radius-scale-full)]",
            "bg-[var(--background-backdrop)]",
            EFFECT_TRANSITION,
            isActive ? "opacity-100" : "opacity-0",
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0",
            "rounded-[var(--radius-scale-full)]",
            RING_BORDER,
            COLOR_TRANSITION,
            isActive ? RING_ON : RING_OFF,
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
        "relative flex items-center justify-center",
        "size-[40px]",
        "rounded-[var(--radius-scale-full)]",
        "text-xxs-medium text-muted-foreground",
        "border-[length:var(--border-1)] border-dashed",
        "border-[color:var(--border-muted)]",
        COLOR_TRANSITION,
        isActive ? "bg-[var(--background-sheer)]" : "bg-transparent",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true">{PLACEHOLDER_LABEL}</span>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0",
          "rounded-[var(--radius-scale-full)]",
          RING_BORDER,
          COLOR_TRANSITION,
          isActive ? RING_ON : RING_OFF,
        )}
      />
    </div>
  );
}
