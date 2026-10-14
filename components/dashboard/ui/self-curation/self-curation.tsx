"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  SelfSlot,
  type SelfSlotPersona,
} from "@/components/dashboard/ui/self-slot";

/**
 * Figma `Self curation` — 8개 `SelfSlot`을 원형 궤도에 배치하고 중앙에 안내
 * 문구를 띄우는 컴포넌트. `persona-radial-chart`가 이 위에 지표 링을 씌워 사용.
 * 스펙 상세는 `docs/persona-radial-chart-spec.md` 참고.
 */

export const SELF_CURATION_SLOT_COUNT = 8;

/** 아바타 중심이 놓이는 궤도 반지름 (Figma 실측 ≈97, persona-radial-chart와 동일 좌표계) */
const AVATAR_ORBIT_RADIUS = 97;
/** SVG 좌표계는 3시 방향이 0°, 시계방향이 +이므로 -90°(12시)에서 시작해야 첫 슬롯이 정확히 수직입니다 */
const FIRST_SECTOR_START_ANGLE = -90;
const SECTOR_ANGLE = 360 / SELF_CURATION_SLOT_COUNT;

const MOTION_DURATION = "duration-200 ease-out";
const FADE_IN = `animate-in fade-in ${MOTION_DURATION} motion-reduce:animate-none`;

function polarToCartesian(radius: number, angleInDegrees: number) {
  const radians = (angleInDegrees * Math.PI) / 180;
  return {
    x: radius * Math.cos(radians),
    y: radius * Math.sin(radians),
  };
}

function round(value: number) {
  return Number(value.toFixed(3));
}

/** 빈 슬롯(페르소나 없음)을 식별하는 합성 키. 인덱스별로 달라야 슬롯을 개별 강조할 수 있습니다 */
export function selfCurationEmptySlotKey(index: number) {
  return `slot:${index}`;
}

export interface SelfCurationPersona {
  /** React key 및 강조 대상 판정에 쓰이는 식별자 */
  id: string;
  /** 아바타 alt 텍스트 */
  name: string;
  imageSrc?: string;
  initials?: string;
}

export interface SelfCurationProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onClick"
> {
  /** `SELF_CURATION_SLOT_COUNT`(8)개 슬롯. `null`이면 빈 슬롯(Figma `style=empty`) */
  slots: (SelfCurationPersona | null)[];
  /** 지금 강조된 슬롯의 id (`selfCurationEmptySlotKey(index)` 또는 persona id) */
  activeSlotId?: string | null;
  /** 중앙에 표시할 안내 문구 (Figma에는 버튼 없이 텍스트 1줄뿐입니다) */
  centerMessage: string;
  /** 슬롯에 마우스가 올라가면 그 slotId로, 벗어나면 `null`로 호출됩니다 */
  onSlotHover?: (slotId: string | null) => void;
  /** 중앙 문구 클릭 핸들러 */
  onCenterClick?: () => void;
}

export function SelfCuration({
  slots,
  activeSlotId,
  centerMessage,
  onSlotHover,
  onCenterClick,
  className,
  ...props
}: SelfCurationProps) {
  return (
    <div
      // SVG 지표 링 위에 겹쳐지므로 배경은 pointer-events-none, 슬롯/문구만 auto로 되살림
      className={cn("relative size-[500px] pointer-events-none", className)}
      {...props}
    >
      {slots.map((persona, index) => {
        const startAngle = FIRST_SECTOR_START_ANGLE + SECTOR_ANGLE * index;
        const midAngle = startAngle + SECTOR_ANGLE / 2;
        const position = polarToCartesian(AVATAR_ORBIT_RADIUS, midAngle);
        const slotId = persona ? persona.id : selfCurationEmptySlotKey(index);
        const slotPersona: SelfSlotPersona | null = persona
          ? {
              name: persona.name,
              imageSrc: persona.imageSrc,
              initials: persona.initials,
            }
          : null;

        return (
          <div
            key={slotId}
            className="absolute pointer-events-auto"
            style={{
              left: `calc(50% + ${round(position.x)}px)`,
              top: `calc(50% + ${round(position.y)}px)`,
              transform: "translate(-50%, -50%)",
            }}
            onMouseEnter={() => onSlotHover?.(slotId)}
            onMouseLeave={() => onSlotHover?.(null)}
          >
            <SelfSlot
              persona={slotPersona}
              status={slotId === activeSlotId ? "active" : "default"}
            />
          </div>
        );
      })}

      {/* 중앙 안내 문구 — 내용이 바뀔 때마다 remount되어 페이드인합니다 */}
      <p
        key={centerMessage}
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "whitespace-nowrap text-center",
          "text-xs-bold text-foreground",
          "pointer-events-auto",
          FADE_IN,
          onCenterClick && "cursor-pointer",
        )}
        onClick={onCenterClick}
      >
        {centerMessage}
      </p>
    </div>
  );
}
