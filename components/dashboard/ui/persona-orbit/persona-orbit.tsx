"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  PersonaSlot,
  type PersonaSlotPersona,
} from "@/components/dashboard/ui/persona-slot";

/**
 * Figma `Self curation` (GB_Dashboard, node 8004:6285) — 8개 `PersonaSlot`을
 * 원형 궤도에 배치하고 중앙에 안내 문구를 띄우는 컴포넌트.
 * `components/ui/persona-radial-chart`가 이 위에 지표 링(SVG)을 씌워 사용합니다.
 *
 * Figma variant는 `selfNumber`(1/8) × `status`(default/active)인데, 이
 * 컴포넌트는 "몇 칸이 채워졌는가"를 직접 계산하지 않습니다. 호출부가 길이 8인
 * `slots` 배열(빈 칸은 `null`)을 그대로 넘기는 방식으로 selfNumber 1~8 전부를
 * 표현하고, 강조(hover) 상태도 controlled로 받아 상위(PersonaRadialChart)가
 * 지표 링과 같은 hover 축을 공유할 수 있게 합니다.
 */

export const ORBIT_SLOT_COUNT = 8;

/** 아바타 중심이 놓이는 궤도 반지름 (Figma 실측 ≈97, persona-radial-chart와 동일 좌표계) */
const AVATAR_ORBIT_RADIUS = 97;
/** SVG 좌표계는 3시 방향이 0°, 시계방향이 +이므로 -90°(12시)에서 시작해야 첫 슬롯이 정확히 수직입니다 */
const FIRST_SECTOR_START_ANGLE = -90;
const SECTOR_ANGLE = 360 / ORBIT_SLOT_COUNT;

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
export function personaOrbitEmptySlotKey(index: number) {
  return `slot:${index}`;
}

export interface PersonaOrbitPersona {
  /** React key 및 강조 대상 판정에 쓰이는 식별자 */
  id: string;
  /** 아바타 alt 텍스트 */
  name: string;
  imageSrc?: string;
  initials?: string;
}

export interface PersonaOrbitProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onClick"
> {
  /**
   * `ORBIT_SLOT_COUNT`(8)개 슬롯. `null`이면 그 칸은 Figma `style=empty`
   * 빈 슬롯이 됩니다.
   */
  slots: (PersonaOrbitPersona | null)[];
  /**
   * 지금 강조된 슬롯의 id. 페르소나가 있으면 그 `id`, 빈 슬롯이면
   * `personaOrbitEmptySlotKey(index)` 값과 비교됩니다. `null`/`undefined`면
   * 강조되는 슬롯이 없습니다.
   */
  activeSlotId?: string | null;
  /** 중앙에 표시할 안내 문구 (Figma에는 버튼 없이 텍스트 1줄뿐입니다) */
  centerMessage: string;
  /** 슬롯에 마우스가 올라가면 그 slotId로, 벗어나면 `null`로 호출됩니다 */
  onSlotHover?: (slotId: string | null) => void;
  /** 중앙 문구 클릭 핸들러 */
  onCenterClick?: () => void;
}

export function PersonaOrbit({
  slots,
  activeSlotId,
  centerMessage,
  onSlotHover,
  onCenterClick,
  className,
  ...props
}: PersonaOrbitProps) {
  return (
    <div
      // pointer-events-none — 이 500×500 wrapper 전체가 PersonaRadialChart의
      // SVG 지표 링 위에 겹쳐 놓이는데, 배경까지 히트박스를 그대로 두면 아바타가
      // 없는 링 영역의 마우스 이벤트를 이 div가 가로채 밑 SVG로 못 내려가고,
      // 결국 아바타(셀프) hover만 동작하는 것처럼 보이게 됩니다. 실제 클릭/hover가
      // 필요한 자식(슬롯, 중앙 문구)에만 pointer-events-auto로 되살립니다.
      className={cn(
        "relative size-[calc(var(--scale-500)*1px)] pointer-events-none",
        className,
      )}
      {...props}
    >
      {slots.map((persona, index) => {
        const startAngle = FIRST_SECTOR_START_ANGLE + SECTOR_ANGLE * index;
        const midAngle = startAngle + SECTOR_ANGLE / 2;
        const position = polarToCartesian(AVATAR_ORBIT_RADIUS, midAngle);
        const slotId = persona ? persona.id : personaOrbitEmptySlotKey(index);
        const slotPersona: PersonaSlotPersona | null = persona
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
            <PersonaSlot
              persona={slotPersona}
              active={slotId === activeSlotId}
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
