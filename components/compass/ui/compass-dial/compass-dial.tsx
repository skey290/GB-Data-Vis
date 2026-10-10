"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { CompassDialTick } from "@/components/compass/ui/compass-dial-tick";
import {
  buildCompassDialPlan,
  CANVAS_SIZE,
  getTickBoxTopOffset,
  type CompassDialSelf,
  type CompassDialTickCoachmark,
  type CompassDialTickPlan,
  type CompassDialType,
} from "./compass-dial-utils";

export type { CompassDialSelf, CompassDialTickCoachmark, CompassDialType };

/**
 * Figma "Dial"(❄️ GB_Compass, C34HOpbSASmThFA1iYFm8D) node-id 8003:8878.
 *
 * `CompassDialTick`(Figma "Part/Dial", node 8003:8237) 80개를 outward(Reach)
 * 링과 inward(Engagement) 링에 각각 4.5° 간격으로 배치하는 조립 컴포넌트.
 * 버킷팅·그라데이션·랭킹 등 값 계산은 전부 `compass-dial-utils.ts`에 있고, 이
 * 파일은 그 계획(`CompassDialTickPlan[]`)을 원형 좌표로 배치하기만 합니다.
 *
 * 배치 방식: 각 눈금을 캔버스 중심(400,400)에 위치한 0×0 pivot의 자식으로 두고
 * pivot을 `rotate(angle)`로 회전시킵니다. 눈금 박스(4×117px) 자체는 회전시키지
 * 않고 pivot 기준 `top` 오프셋(`getTickBoxTopOffset`)만으로 배치하므로, 회전은
 * 항상 다이얼 중심을 기준으로 일어납니다.
 *
 * 12개 실제 Figma variant(`Type` × `Self number` × `Data Collected`)를 전부
 * `get_screenshot`/`get_design_context`로 대조해 검증했습니다:
 * - `Self number=1, Data Collected=true`는 "No Data Collected"가 아니라 그
 *   1명의 실제 값을 size5로 표시합니다(최초 조사 문서의 추정과 달리 확인됨).
 * - `Type="reach and engagement"`의 `Self number=1`만 `Data Collected` 값과
 *   무관하게 항상 "No Data Collected"입니다(순위는 최소 2명부터 의미가 있다는
 *   `GB_Compass.md` 3부 콜드스타트 조건과 일치).
 * - 위 두 "No Data Collected" 배지는 badge 크기만 다릅니다(전자 size1, 후자
 *   size5) — `get_design_context`로 각각의 `h-[Npx]` 값을 직접 읽어 확정.
 */

/** 눈금 하나를 중심 기준 각도(angle)에 배치하는 pivot + 오프셋 래퍼 */
function PositionedTick({
  plan,
  direction,
}: {
  plan: CompassDialTickPlan;
  direction: "outward" | "inward";
}) {
  return (
    <div
      className="absolute top-1/2 left-1/2 h-0 w-0"
      style={{ transform: `rotate(${plan.angle}deg)` }}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: getTickBoxTopOffset(direction) }}
      >
        <CompassDialTick
          direction={direction}
          type={plan.type}
          muted={plan.muted}
          size={plan.size}
          textArrangement={plan.textArrangement}
          label={plan.label}
          coachmark={plan.coachmark}
        />
      </div>
    </div>
  );
}

export interface CompassDialProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /**
   * Figma `Type` variant.
   * - `reach`: outward 링만(Reach 값 기준 버킷팅, 라벨은 천단위 콤마 정수)
   * - `engagement`: inward 링만(Engagement 값 기준 버킷팅, 라벨은 소수점 1자리 %)
   * - `reach-and-engagement`: 두 링 모두(outward는 Ranking 서수 라벨, inward는
   *   라벨 없이 Engagement 값 기준 그라데이션만)
   */
  type: CompassDialType;
  /**
   * Self 배열. 배열 순서 = 슬롯 배정 순서(0번째=북쪽, 시계방향 45°씩), 최대 8개까지만
   * 반영됩니다. 크기(버킷팅)는 슬롯 위치가 아니라 값의 순위로 결정됩니다.
   */
  selves: CompassDialSelf[];
  /**
   * 데이터 수집 여부(콜드스타트). 기본 `true`. `false`면 Self 배열과 무관하게
   * 북쪽에 "No Data Collected"만 작게 표시되고 나머지는 전부 장식용 눈금입니다.
   */
  dataCollected?: boolean;
  /**
   * 북쪽 칩(슬롯0)에 붙는 온보딩 코치마크. `type="reach"`/`"engagement"`에서만
   * 반영되고(`"reach-and-engagement"`는 무시), 해당 링이 실제 라벨을 그릴 때만
   * (Self가 채워져 있을 때만) 보인다.
   */
  coachmark?: CompassDialTickCoachmark;
}

export function CompassDial({
  type,
  selves,
  dataCollected = true,
  coachmark,
  className,
  ...props
}: CompassDialProps) {
  const plan = React.useMemo(
    () => buildCompassDialPlan({ type, selves, dataCollected, coachmark }),
    [type, selves, dataCollected, coachmark],
  );

  return (
    <div
      className={cn("relative", className)}
      style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
      {...props}
    >
      {plan.outward?.map((tick, index) => (
        <PositionedTick
          key={`outward-${index}`}
          plan={tick}
          direction="outward"
        />
      ))}
      {plan.inward?.map((tick, index) => (
        <PositionedTick
          key={`inward-${index}`}
          plan={tick}
          direction="inward"
        />
      ))}
    </div>
  );
}
