import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";

/**
 * Figma "Part/Dial" (❄️ GB_Compass, C34HOpbSASmThFA1iYFm8D) node-id 8003:8237.
 *
 * 컴퍼스 다이얼 원형에 80개 반복 배치될 "눈금 1개" 단위 원자 컴포넌트. 반복 배치
 * (각도 회전 + 위치 계산)는 이 컴포넌트의 책임이 아니라 상위 "Dial" 조립 컴포넌트의
 * 몫이며, 이 파일은 로컬 4×117px 박스 안에서 눈금선 + (있다면) 라벨 하나만 그린다.
 *
 * Figma variant → props 매핑:
 * - `type`: default(눈금선만) / text(숫자 라벨) / circle(Badge 마커)
 * - `direction`: outward(눈금 아래쪽 정렬, 라벨은 눈금 위) /
 *   inward(눈금 위쪽 정렬, 라벨은 박스 밖 위로 절대 배치)
 * - `muted`: 라벨/Badge 스타일만 다운그레이드(눈금선 색상엔 영향 없음 — 항상
 *   `--border-static-white` 고정, 기존 조사로 확정된 사실)
 * - `textArrangement`: 라벨 회전 방향. 아래 ROTATION 테이블 참고
 * - `size`: 눈금선 길이(1~5). 라벨에는 영향 없음
 *
 * ⚠️ textArrangement × direction 회전각은 "cross-reverse가 inward일 때 0°로
 * 뒤집힌다"처럼 단순 공식으로 일반화되지 않아, 8개(text) + 8개(circle) 조합을
 * get_design_context로 전부 개별 조회해 실측했다(2026-09-28). text와 circle은
 * 서로 다른 회전 규칙을 가지며, 특히 `circle`의 `inward`+`cross-reverse` 조합만
 * 유일하게 실제 좌우 반전(스케일 상쇄가 안 되는 잔여 `scaleY(-1)`)이 남는다 —
 * Figma 원본을 그대로 재현한 것이며 별도 보정 없이 반영함.
 *
 * `coachmark`(신규, 2026-09-29): Figma "캔버스 이동"/"셀프N개에서 포스팅 분석
 * 조건 충족시" 시나리오 스크린샷(node 8052:33418 등)을 실측한 결과, Reach/
 * Engagement 온보딩 코치마크("Most Reached: 8,340"/"Most Engaged: 14.3%")는
 * 항상 북쪽 눈금(슬롯0)의 라벨 칩에 바로 붙어 있었다. `buildRingPlan`의
 * `isNorth` 규칙(순위가 아니라 슬롯 위치로 결정)이 이미 이 칩을 `type="circle"`로
 * 고정해 렌더링하므로, 이 prop이 있으면 그 라벨(text/circle 공통)을
 * `Tooltip`(`variant="inversed"`, 항상 열림)으로 감싸기만 하면 된다.
 */

export type CompassDialTickType = "default" | "text" | "circle";
export type CompassDialTickDirection = "outward" | "inward";
export type CompassDialTickTextArrangement =
  "cross" | "parallel" | "parallel-reverse" | "cross-reverse";
export type CompassDialTickSize = 1 | 2 | 3 | 4 | 5;

export interface CompassDialTickProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** 눈금 종류 — default: 눈금선만 / text: 숫자 라벨 / circle: Badge 마커 */
  type?: CompassDialTickType;
  /** 눈금이 다이얼 중심 기준 바깥/안쪽 중 어디를 향하는지 */
  direction?: CompassDialTickDirection;
  /** 라벨/Badge 스타일을 한 단계 낮춤(눈금선 색상엔 영향 없음) */
  muted?: boolean;
  /** 라벨 회전 방향(원형 다이얼에서 항상 똑바로 보이도록). type="default"일 땐 무시됨 */
  textArrangement?: CompassDialTickTextArrangement;
  /** 눈금선 길이 단계(1~5). 라벨에는 영향 없음 */
  size?: CompassDialTickSize;
  /**
   * type="text"|"circle"일 때 표시할 값. Figma 샘플("6/1", "Badge")은
   * 플레이스홀더이므로 기본값으로 두지 않음 — 필요 시 호출부에서 명시할 것.
   */
  label?: string;
  /**
   * 라벨(있는 경우)에 붙는 온보딩 코치마크. 전달되면 `Tooltip`(`variant="inversed"`)을
   * 항상 열린 상태로 씌운다. `onDismiss`가 있으면 닫기(X) 버튼이 함께 렌더링됨.
   */
  coachmark?: {
    title: string;
    description?: string;
    onDismiss?: () => void;
  };
}

/**
 * 눈금선 실측값(px) — Figma "Part/Dial" 눈금 벡터를 size별로 직접 다운로드해
 * path 좌표를 역산했다. SVG 내부 기하 좌표라 spacing 토큰과 매칭되지 않아
 * 토큰화하지 않고 컴포넌트 내부 상수로 고정(사용자 승인, 2026-09-28).
 * upper: 바깥쪽(끝) segment, gap: 중간 공백, lower: 안쪽(중심) segment.
 */
const TICK_GEOMETRY: Record<
  CompassDialTickSize,
  { total: number; upper: number; gap: number; lower: number }
> = {
  5: { total: 80, upper: 52.14, gap: 10.95, lower: 16.91 },
  4: { total: 65, upper: 42.36, gap: 8.9, lower: 13.74 },
  3: { total: 50, upper: 23.25, gap: 10.51, lower: 16.24 },
  2: { total: 35, upper: 16.27, gap: 7.36, lower: 11.37 },
  1: { total: 20, upper: 9.3, gap: 4.21, lower: 6.5 },
};

/**
 * 루트 컨테이너 너비(px) — Figma 프레임 자체의 물리적 치수라 --scale-*와 매칭되지
 * 않는 기하 상수. 높이(117px)는 className의 `h-[117px]`에 직접 사용.
 */
const ROOT_WIDTH = 4;

/**
 * type="text" 라벨 회전각(deg). get_design_context로 outward/inward ×
 * cross/cross-reverse/parallel/parallel-reverse 8개 조합 전부 실측 확인
 * (2026-09-28). direction이 cross 계열의 회전만 뒤집고(0↔180),
 * parallel 계열은 방향과 무관하게 동일하다 — 단순 공식이 아니라 실측 그대로 반영.
 */
const TEXT_ROTATION: Record<
  CompassDialTickDirection,
  Record<CompassDialTickTextArrangement, number>
> = {
  outward: {
    cross: 0,
    "cross-reverse": 180,
    parallel: -90,
    "parallel-reverse": 90,
  },
  inward: {
    cross: 180,
    "cross-reverse": 0,
    parallel: -90,
    "parallel-reverse": 90,
  },
};

/**
 * type="circle"(Badge) 회전/반전.
 *
 * inward + cross-reverse(북쪽 사분면)는 Figma 실측값을 그대로 옮기면
 * `rotate(180deg) scaleY(-1)`이 합성되어 배지 안 텍스트가 좌우로 뒤집혀
 * 보이는 문제가 있었다(2026-09-28 실사용 확인). 같은 위치의 `type="text"`
 * 라벨(`TEXT_ROTATION.inward["cross-reverse"]`)은 회전 0으로 정상 표시되므로,
 * circle도 동일하게 `{ rotate: 0, flipY: false }`로 맞춰 반전을 제거함.
 */
const CIRCLE_TRANSFORM: Record<
  CompassDialTickDirection,
  Record<CompassDialTickTextArrangement, { rotate: number; flipY: boolean }>
> = {
  outward: {
    cross: { rotate: 0, flipY: false },
    "cross-reverse": { rotate: 180, flipY: false },
    parallel: { rotate: -90, flipY: false },
    "parallel-reverse": { rotate: 90, flipY: false },
  },
  inward: {
    cross: { rotate: 0, flipY: false },
    "cross-reverse": { rotate: 0, flipY: false },
    parallel: { rotate: 90, flipY: false },
    "parallel-reverse": { rotate: -90, flipY: false },
  },
};

/**
 * inward 라벨의 절대 배치 top 오프셋(px). cross 계열(text/circle 공통)은
 * -48px, circle의 parallel 계열만 Badge의 회전된 히트박스가 더 커서 -62.5px
 * (실측, 2026-09-28). text의 parallel 계열은 -48.5px로 사실상 동일해 -48px로 통일.
 */
function getInwardLabelOffset(
  type: CompassDialTickType,
  textArrangement: CompassDialTickTextArrangement,
): number {
  const isParallelFamily =
    textArrangement === "parallel" || textArrangement === "parallel-reverse";
  if (type === "circle" && isParallelFamily) return -62.5;
  return -48;
}

function DialTickMark({ size }: { size: CompassDialTickSize }) {
  const { total, upper, gap } = TICK_GEOMETRY[size];
  const pointB = total - upper;
  const pointC = total - upper - gap;

  return (
    <svg
      width={ROOT_WIDTH}
      height={total}
      viewBox={`0 0 ${ROOT_WIDTH} ${total}`}
      fill="none"
      className="shrink-0"
      aria-hidden="true"
      data-slot="compass-dial-tick-mark"
    >
      <path
        d={`M2 ${total}L2 ${pointB}M2 ${pointC}L2 0`}
        stroke="var(--border-static-white)"
        strokeWidth={1}
      />
    </svg>
  );
}

export function CompassDialTick({
  type = "default",
  direction = "outward",
  muted = false,
  textArrangement = "cross",
  size = 5,
  label,
  coachmark,
  className,
  ...props
}: CompassDialTickProps) {
  const hasLabel = type === "text" || type === "circle";
  const isOutward = direction === "outward";

  const wrapWithCoachmark = (node: React.ReactNode) =>
    coachmark ? (
      <Tooltip
        variant="inversed"
        open
        side="right"
        align="start"
        title={coachmark.title}
        description={coachmark.description}
        onClose={coachmark.onDismiss}
      >
        {node}
      </Tooltip>
    ) : (
      node
    );

  const gapClass = !hasLabel
    ? undefined
    : isOutward
      ? "gap-[var(--spacing-4)]"
      : type === "circle"
        ? "gap-[var(--spacing-6)]"
        : "gap-[var(--spacing-8)]";

  return (
    <div
      className={cn(
        "relative isolate flex h-[117px] w-[4px] flex-col items-center",
        isOutward ? "justify-end" : "justify-start",
        hasLabel && "px-[var(--spacing-0-5)]",
        gapClass,
        className,
      )}
      {...props}
    >
      {type === "text" &&
        wrapWithCoachmark(
          <div
            className={cn(
              "z-[2] shrink-0 rounded-[var(--radius-scale-full)]",
              !isOutward && "absolute left-1/2 -translate-x-1/2",
            )}
            style={
              !isOutward
                ? { top: getInwardLabelOffset(type, textArrangement) }
                : undefined
            }
          >
            <p
              className={cn(
                "whitespace-nowrap text-center",
                muted
                  ? "text-sm-semi-bold text-[var(--text-subtle)]"
                  : "text-base-semi-bold text-[var(--text-default)]",
              )}
              style={{
                transform: `rotate(${TEXT_ROTATION[direction][textArrangement]}deg)`,
              }}
            >
              {label}
            </p>
          </div>,
        )}

      {type === "circle" &&
        (() => {
          const { rotate, flipY } =
            CIRCLE_TRANSFORM[direction][textArrangement];
          return wrapWithCoachmark(
            <div
              className={cn(
                "z-[2] shrink-0",
                !isOutward && "absolute left-1/2 -translate-x-1/2",
              )}
              style={
                !isOutward
                  ? { top: getInwardLabelOffset(type, textArrangement) }
                  : undefined
              }
            >
              <div
                style={{
                  transform: `rotate(${rotate}deg)${flipY ? " scaleY(-1)" : ""}`,
                }}
              >
                <Badge variant={muted ? "outline" : "default"} size="20">
                  {label}
                </Badge>
              </div>
            </div>,
          );
        })()}

      <div className="z-[1] shrink-0">
        <DialTickMark size={size} />
      </div>
    </div>
  );
}
