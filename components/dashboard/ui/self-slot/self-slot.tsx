"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

/**
 * Figma `Part/self`(40×40 원형 슬롯) — `SelfCuration`이 8개를 원형 배치해 사용.
 * 스펙 상세는 `docs/persona-radial-chart-spec.md` 참고.
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

// 강조 링은 outline이 아니라 별도 span(DOM상 가장 뒤)으로 그린다 — 음수
// outline-offset은 40px를 꽉 채우는 아바타 자식에 가려 Chrome에서 안 보인다
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
            // Figma 쪽 Effect 파라미터는 radius 8이지만, Figma가 직접 생성한 코드
            // (get_design_context)의 이 레이어 className이 그대로 `backdrop-blur-[4px]`
            // — 토큰 이름이 아니라 codegen 결과값을 기준으로 삼는다. 아바타 뒤에 다른
            // 레이어가 없어 filter로 적용해도 backdrop-filter와 결과가 같다.
            isActive
              ? "[filter:var(--backdrop-blur-sm)]"
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
