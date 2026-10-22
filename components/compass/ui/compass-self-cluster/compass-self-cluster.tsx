import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CompassSelfAvatar,
  type CompassSelfAvatarPosition,
} from "@/components/compass/ui/compass-self-avatar";

/**
 * 최대 8명의 "셀프"를 독립 8방향 위성으로 배치하는 조립 컴포넌트.
 *
 * `variant`(Figma `Style` 축, React `style` prop과의 이름 충돌을 피해 명명):
 * - `reach-or-engagement`: 셀프를 `CompassSelfAvatar`(self/empty)로 표시. 중앙에
 *   `label` 텍스트(기본 "Reach").
 * - `potential` / `potential-estimate`: 기본(hover 없음)은 `growth` 값이 가장 큰
 *   셀프 하나만 성장 장식(링/커넥터/배지)을 보여주고, 나머지는 장식 없는 아바타로
 *   표시한다. 다른 셀프를 hover하면 장식이 그 셀프로 옮겨가고, 빈 슬롯을 hover하면
 *   장식이 전부 사라진다. hover 중인 셀프는 항상 `status="active"`로 강제된다.
 *   `-estimate`의 Estimate 표시는 hover 없는 기본 포커스 셀프에만
 *   `CompassSelfClusterSelf.estimate`(기본 `true`)로 나타난다.
 * - `potential-error`: 전역 API 실패 상태. 셀프는 전부 장식 없이 표시하고 중앙
 *   라벨이 "We couldn't fetch your data" + Retry 버튼으로 바뀐다.
 *
 * 채움 순서: `selves` 배열 순서 = 북쪽부터 시계방향.
 *
 * `coachmark`: 지금 장식 중인 포커스 셀프의 퍼센트 배지에만 붙는다. 다른 셀프를
 * hover하거나 빈 슬롯을 hover하면 함께 숨긴다.
 */

export type CompassSelfClusterVariant =
  | "reach-or-engagement"
  | "potential"
  | "potential-estimate"
  | "potential-error";

export type CompassSelfClusterPosition = CompassSelfAvatarPosition;

export interface CompassSelfClusterSelf {
  image: string;
  imageAlt?: string;
  /** potential류 variant에서만 사용. 포커스 셀프 선정(최댓값)과 링 크기에 쓰임 */
  growth?: number;
  /**
   * variant="potential-estimate"에서, 이 셀프가 hover 없이 디폴트로 장식될 때만
   * 유효. 이 셀프의 데이터가 부족한지 여부 — `true`(기본값)면 배지가 경고색.
   */
  estimate?: boolean;
}

export interface CompassSelfClusterProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Figma `Style` 축 */
  variant?: CompassSelfClusterVariant;
  /** variant="reach-or-engagement"에서만 유효한 중앙 라벨. 기본 "Reach" */
  label?: string;
  /** 북쪽부터 시계방향으로 채워질 셀프 목록. 최대 8명(초과분은 무시) */
  selves?: CompassSelfClusterSelf[];
  /** selves 배열 인덱스 기준 활성(hover/press) 상태 — 채워진 셀프에 적용 */
  activeSelfIndex?: number;
  /** 빈 슬롯에 활성 상태를 줄 때의 위치 */
  activeEmptyPosition?: CompassSelfClusterPosition;
  /** 채워진 셀프 클릭 — Content Studio 이동 의도 */
  onSelfClick?: (index: number) => void;
  /** 빈 슬롯 클릭 — Assets 이동 의도 */
  onEmptySlotClick?: (position: CompassSelfClusterPosition) => void;
  /** variant="potential-error"에서만 유효한 Retry 클릭 핸들러 */
  onRetry?: () => void;
  /** potential류 variant에서만 유효. 지금 장식 중인 포커스 셀프의 퍼센트 배지에
   * 붙는 온보딩 코치마크. */
  coachmark?: {
    title: string;
    description?: string;
    onDismiss?: () => void;
  };
}

/** 북쪽(0)부터 시계방향 순서 */
const FILL_ORDER: CompassSelfClusterPosition[] = [
  0, 45, 90, 135, 180, 225, 270, 315,
];

/** 위성 중심까지의 거리(px) */
const SATELLITE_RADIUS = 157;
/** 컨테이너 크기(px) */
const CLUSTER_SIZE = 414;

function getFocusIndex(selves: CompassSelfClusterSelf[]): number | undefined {
  if (selves.length === 0) return undefined;
  let focusIndex = 0;
  for (let i = 1; i < selves.length; i++) {
    if ((selves[i].growth ?? 0) > (selves[focusIndex].growth ?? 0)) {
      focusIndex = i;
    }
  }
  return focusIndex;
}

/**
 * hover 추적은 이 컴포넌트의 안정된 위치 wrapper div에 건다 — 장식 여부에 따라
 * 자식의 props만 바뀌고 컴포넌트 타입은 바뀌지 않으므로 리마운트가 일어나지 않는다.
 */
function PositionedSatellite({
  position,
  onMouseEnter,
  onMouseLeave,
  children,
}: {
  position: CompassSelfClusterPosition;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute top-1/2 left-1/2 h-0 w-0"
      style={{ transform: `rotate(${position}deg)` }}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ top: -SATELLITE_RADIUS }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div style={{ transform: `rotate(${-position}deg)` }}>{children}</div>
      </div>
    </div>
  );
}

export function CompassSelfCluster({
  variant = "reach-or-engagement",
  label = "Reach",
  selves = [],
  activeSelfIndex,
  activeEmptyPosition,
  onSelfClick,
  onEmptySlotClick,
  onRetry,
  coachmark,
  className,
  ...props
}: CompassSelfClusterProps) {
  const filledSelves = selves.slice(0, 8);
  const isError = variant === "potential-error";
  const isGrowthSet =
    variant === "potential" || variant === "potential-estimate";
  const focusIndex = isGrowthSet ? getFocusIndex(filledSelves) : undefined;

  const [hoveredSelfIndex, setHoveredSelfIndex] = React.useState<number | null>(
    null,
  );
  const [hoveredEmptyPosition, setHoveredEmptyPosition] =
    React.useState<CompassSelfClusterPosition | null>(null);

  const decoratedIndex = isGrowthSet
    ? hoveredEmptyPosition !== null
      ? undefined
      : (hoveredSelfIndex ?? focusIndex)
    : undefined;

  return (
    <div
      className={cn("relative", className)}
      style={{ width: CLUSTER_SIZE, height: CLUSTER_SIZE }}
      {...props}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        {isError ? (
          <div className="flex flex-col items-center gap-[var(--spacing-2)]">
            <p className="text-sm-semi-bold text-[var(--text-default)]">
              We couldn&apos;t fetch your data
            </p>
            <Button variant="link" onClick={onRetry}>
              Retry
            </Button>
          </div>
        ) : (
          <p className="text-base-semi-bold text-[var(--text-default)]">
            {isGrowthSet ? "Growth Potential" : label}
          </p>
        )}
      </div>

      {FILL_ORDER.map((position, i) => {
        const self = filledSelves[i];

        if (!self) {
          const isEmptyActive = activeEmptyPosition === position;
          return (
            <PositionedSatellite
              key={position}
              position={position}
              onMouseEnter={
                isGrowthSet
                  ? () => setHoveredEmptyPosition(position)
                  : undefined
              }
              onMouseLeave={
                isGrowthSet
                  ? () =>
                      setHoveredEmptyPosition((current) =>
                        current === position ? null : current,
                      )
                  : undefined
              }
            >
              <CompassSelfAvatar
                variant="empty"
                status={isEmptyActive ? "active" : "default"}
                onClick={() => onEmptySlotClick?.(position)}
              />
            </PositionedSatellite>
          );
        }

        // hover는 decoratedIndex뿐 아니라 status도 즉시 "active"로 강제해 "Go to
        // Content Studio" + 포텐셜 배지가 지연 없이 함께 나타난다. Estimate 안내
        // 문구는 hover 중인 셀프에는 뜨지 않고, hover 없는 기본 포커스 셀프에만
        // 나타난다. 배지 색은 status와 무관하게 각 셀프 자신의 estimate 값을
        // 그대로 따른다.
        const isHoveredSelf = isGrowthSet && hoveredSelfIndex === i;
        const isActive = activeSelfIndex === i || isHoveredSelf;
        const isDecorated = isGrowthSet && i === decoratedIndex;
        const isFocusEstimate =
          variant === "potential-estimate" && (self.estimate ?? true);
        const showCoachmarkHere =
          isGrowthSet &&
          coachmark != null &&
          i === focusIndex &&
          hoveredSelfIndex === null &&
          hoveredEmptyPosition === null;

        return (
          <PositionedSatellite
            key={position}
            position={position}
            onMouseEnter={
              isGrowthSet ? () => setHoveredSelfIndex(i) : undefined
            }
            onMouseLeave={
              isGrowthSet
                ? () =>
                    setHoveredSelfIndex((current) =>
                      current === i ? null : current,
                    )
                : undefined
            }
          >
            <CompassSelfAvatar
              variant={isDecorated ? "potential" : "self"}
              position={position}
              growth={self.growth ?? 0}
              isDataCollected={!isFocusEstimate}
              status={isActive ? "active" : "default"}
              image={self.image}
              imageAlt={self.imageAlt}
              coachmark={showCoachmarkHere ? coachmark : undefined}
              onClick={() => onSelfClick?.(i)}
            />
          </PositionedSatellite>
        );
      })}
    </div>
  );
}
