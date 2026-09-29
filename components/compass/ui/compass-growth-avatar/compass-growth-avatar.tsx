import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import {
  CompassSelfAvatar,
  type CompassSelfAvatarStatus,
} from "@/components/compass/ui/compass-self-avatar";

/**
 * Figma "Part/impact" (❄️ GB_Compass, C34HOpbSASmThFA1iYFm8D) node-id 8003:10382.
 *
 * Growth Potential 다이얼에 배치될 "셀프 1명" 조립 컴포넌트. 아바타 자체는
 * `CompassSelfAvatar`(node 8003:10251)를 그대로 재사용하고, 그 위에 성장 가이드
 * 링 + 커넥터(화살표 선) + 퍼센트 배지를 얹는다.
 *
 * 배치는 8방향 실측(2026-09-28)으로 확정된 규칙을 따른다:
 * - 배치 각도(bearing) = `-position`도(북쪽=0, 시계방향+) — 8방향 전부 좌표 검증
 * - 가이드 링 반지름 = `50 + growth × 1.25`px (growth=0이면 링/커넥터/배지 전부 숨김)
 * - 커넥터 바깥쪽 끝은 정확히 링 반지름 원 위(오차 1px 이내, 4개 growth 단계 검증)
 * - 배지 중심은 링 반지름 + 약 31px 지점에 업라이트로 배치(근사치 — Figma가 배지를
 *   회전 없이 코너 기준으로 앵커링해 정확한 상수는 아님, 4개 단계 실측 평균
 *   31px·오차 ±1.5px, 2026-09-28)
 *
 * 가이드 링은 `CompassSelfAvatar`의 `guide` variant(100~300px 5단계 고정 enum)를
 * 재사용하지 않고 자체 구현한다 — growth가 연속값(사용자 승인, 2026-09-28)이라
 * 5단계 enum으로는 표현할 수 없기 때문.
 *
 * `decorated`(기본 true): 링/커넥터/배지를 지금 보여줄지 여부를 `growth>0`(데이터
 * 존재 여부)과 분리했다 — 상위 `CompassSelfCluster`가 여러 셀프 중 하나만 장식을
 * 보여줄 때, 매번 `CompassSelfAvatar`↔`CompassGrowthAvatar`로 컴포넌트 자체를
 * 바꿔 리마운트시키면(React가 서브트리를 통째로 갈아엎어) 전환이 뚝뚝 끊긴다.
 * 대신 링/커넥터/배지 DOM은 항상 유지한 채 `decorated`로 opacity만 트랜지션시켜
 * 부드럽게 전환한다(사용자 확인, 2026-09-28).
 *
 * 배지 색(alarm/reverse)은 `estimate`(이 셀프 자신의 데이터 충분 여부)에만
 * 좌우되고 `status`(active/hover)와는 무관하다 — hover로 다른 셀프를 미리보기
 * 해도 그 셀프 자신의 데이터 상태를 그대로 보여줘야 한다(사용자 확인,
 * 2026-09-28). 반면 아바타 안쪽 "Estimate" 안내 문구는 `status="active"`에서는
 * 계속 숨겨진다(hover 시 "Go to Content Studio"로 대체, 기존 Figma 검증 규칙).
 *
 * `coachmark`(신규, 2026-09-29): Growth Potential 온보딩 코치마크("Growth
 * Potential: 80%" + "Start posting...")의 앵커. Figma 실측(node
 * `I8052:33420;...;8003:11120;8003:10867`, "Badge")으로 이 배지 자체가 앵커임을
 * 확인 — 별도 칩을 새로 만들지 않고 기존 퍼센트 배지를 `Tooltip`으로 감싸기만
 * 한다. 호출부(`CompassSelfCluster`)가 "지금 장식 중인 포커스 셀프"에만 골라
 * 전달할 책임을 진다.
 */

export type CompassGrowthAvatarVariant = "self" | "empty";
export type CompassGrowthAvatarPosition =
  135 | 90 | 45 | 0 | -45 | -90 | -135 | -180;
export type CompassGrowthAvatarStatus = CompassSelfAvatarStatus;

export interface CompassGrowthAvatarProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Figma `Type=impact`(self)/`empty` */
  variant?: CompassGrowthAvatarVariant;
  /** 0~100 연속값. 0이면 링/커넥터/배지 전부 숨기고 아바타만 표시 */
  growth?: number;
  /** 다이얼 중심 기준 배치 방향(8방향). variant="self" && growth>0에서만 유효 */
  position?: CompassGrowthAvatarPosition;
  /** 아바타/empty 슬롯 상태 */
  status?: CompassGrowthAvatarStatus;
  /**
   * self에서만 유효. 이 셀프의 데이터 부족 여부 — 배지를 경고색(alarm)으로
   * 바꾼다(status와 무관하게 항상). `decorated`가 true && status="default"일
   * 때만 아바타 안쪽에 블러+"Estimate" 안내 문구도 함께 나타난다.
   */
  estimate?: boolean;
  /** 링/커넥터/배지를 지금 보여줄지(opacity 트랜지션). 기본 true */
  decorated?: boolean;
  /** variant="self"일 때 표시할 유저 이미지 URL */
  image?: string;
  imageAlt?: string;
  /** status="active" 오버레이 텍스트(CompassSelfAvatar로 그대로 전달) */
  label?: string;
  /** estimate 상태 설명(CompassSelfAvatar로 그대로 전달). 기본값 "(Lack of Data)" */
  description?: string;
  /**
   * 퍼센트 배지에 붙는 온보딩 코치마크. 전달되면 `Tooltip`(`variant="inversed"`)을
   * 항상 열린 상태로 씌운다. `growth>0`(배지 자체가 보일 때)에만 의미가 있다.
   */
  coachmark?: {
    title: string;
    description?: string;
    onDismiss?: () => void;
  };
}

/** 배지 중심 ≈ 링 반지름 + 이 값(px). 4개 growth 단계 실측 평균(오차 ±1.5px) */
const BADGE_RADIAL_GAP = 31;
/** 아바타 반지름(px). CompassSelfAvatar self/empty가 항상 100px 고정인 것과 동일 */
const AVATAR_RADIUS = 50;

function getRingRadius(growth: number): number {
  return AVATAR_RADIUS + growth * 1.25;
}

export function CompassGrowthAvatar({
  variant = "self",
  growth = 0,
  position = 0,
  status = "default",
  estimate = false,
  decorated = true,
  image,
  imageAlt = "",
  label,
  description,
  coachmark,
  className,
  ...props
}: CompassGrowthAvatarProps) {
  if (variant === "empty") {
    return (
      <CompassSelfAvatar
        variant="empty"
        status={status}
        label={label}
        className={className}
        {...props}
      />
    );
  }

  const showRing = growth > 0;
  const showEstimateStyling = estimate;
  const ringRadius = getRingRadius(growth);
  const bearing = -position;
  const decorationVisibilityClass = cn(
    "transition-opacity duration-150 ease-out",
    decorated ? "opacity-100" : "pointer-events-none opacity-0",
  );

  return (
    <div
      className={cn(
        "relative isolate size-[calc(var(--scale-100)*1px)]",
        className,
      )}
      {...props}
    >
      <CompassSelfAvatar
        variant="self"
        status={status}
        error={decorated && estimate}
        image={image}
        imageAlt={imageAlt}
        label={label}
        description={description ?? "(Lack of Data)"}
      />

      {showRing && (
        <div
          className={cn(
            "absolute top-1/2 left-1/2 z-[-1] rounded-[var(--radius-scale-full)] border-[length:var(--border-1)] border-dashed border-[var(--border-muted)]",
            decorationVisibilityClass,
          )}
          style={{
            width: ringRadius * 2,
            height: ringRadius * 2,
            transform: "translate(-50%, -50%)",
          }}
          aria-hidden="true"
        />
      )}

      {showRing && (
        <div
          className={cn(
            "absolute top-1/2 left-1/2 z-[-1] h-0 w-0",
            decorationVisibilityClass,
          )}
          style={{ transform: `rotate(${bearing}deg)` }}
          aria-hidden="true"
        >
          <div
            className="absolute left-1/2 w-px -translate-x-1/2 bg-[var(--border-muted)]"
            style={{ top: -ringRadius, height: ringRadius - AVATAR_RADIUS }}
          />
        </div>
      )}

      {showRing &&
        (() => {
          const badge = (
            <div style={{ transform: `rotate(${-bearing}deg)` }}>
              <Badge
                variant={showEstimateStyling ? "alarm" : "reverse"}
                size="20"
              >
                {Math.round(growth)}%
              </Badge>
            </div>
          );

          return (
            <div
              className={cn(
                "absolute top-1/2 left-1/2 h-0 w-0",
                decorationVisibilityClass,
              )}
              style={{ transform: `rotate(${bearing}deg)` }}
            >
              <div
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ top: -(ringRadius + BADGE_RADIAL_GAP) }}
              >
                {coachmark ? (
                  <Tooltip
                    variant="inversed"
                    open
                    side="right"
                    align="start"
                    title={coachmark.title}
                    description={coachmark.description}
                    onClose={coachmark.onDismiss}
                  >
                    {badge}
                  </Tooltip>
                ) : (
                  badge
                )}
              </div>
            </div>
          );
        })()}
    </div>
  );
}
