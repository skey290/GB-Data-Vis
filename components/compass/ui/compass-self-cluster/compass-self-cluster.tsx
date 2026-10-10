import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CompassSelfAvatar } from "@/components/compass/ui/compass-self-avatar";
import {
  CompassGrowthAvatar,
  type CompassGrowthAvatarPosition,
} from "@/components/compass/ui/compass-growth-avatar";

/**
 * Figma "Compass self" (❄️ GB_Compass, C34HOpbSASmThFA1iYFm8D) node-id 8003:11059.
 *
 * 최대 8명의 "셀프"를 다이얼과 무관한 독립 8방향 위성으로 배치하는 조립 컴포넌트
 * (반지름 ~157px 고정. `compass-dial`의 outward/inward 반지름과는 전혀 다른
 * 스케일이라 다이얼 위에 얹히는 레이어가 아님을 실측 확인).
 *
 * 두 세트로 나뉜다(Figma `Style` 축 → React의 `style`(인라인 스타일) prop과
 * 이름이 겹쳐 `variant`로 바꿈, `components/ui/avatar`의 선례와 동일):
 * - `reach-or-engagement`: 셀프를 `CompassSelfAvatar`(self/empty)로 표시. 중앙에
 *   `label` 텍스트(기본 "Reach").
 * - `growth-potential` / `growth-potential-estimate`: 기본(hover 없음)은 `growth`
 *   값이 가장 큰 셀프(1명이면 그 1명) 하나만 `CompassGrowthAvatar`로 성장 장식
 *   (링/커넥터/배지)을 보여주고, 나머지는 장식 없는 `CompassSelfAvatar` self/empty로
 *   표시한다. **채워진 다른 셀프를 hover하면 장식이 그 셀프로 즉시 옮겨가 자신의
 *   `growth` 값을 보여주고, 빈 슬롯을 hover하면 장식이 전부 사라진다**(Figma 정적 프레임에는 없는 동적 동작). hover 중인
 *   셀프는 항상 `status="active"`로도 강제되어 "Go to Content Studio" + 포텐셜
 *   배지가 지연 없이 함께 뜬다. `-estimate`의 Estimate(빨강 배지 + 안내 문구)는
 *   **아무것도 hover하지 않은 디폴트 포커스 셀프의 평상시(=hover 아님) 모습에만**
 *   나타나며, 그 여부는 그 셀프의 `CompassSelfClusterSelf.estimate`(기본 `true`)로
 *   결정한다 — hover 중인 다른 셀프는 자신의 estimate 값과 무관하게 항상
 *   Content Studio + 흰 배지로 보인다(status=active면 Estimate가 무시되는 Figma
 *   검증 규칙과 일치).
 * - `growth-potential-error`: 전역 API 실패 상태. 셀프는 전부 장식 없이 표시하고
 *   중앙 라벨이 "We couldn't fetch your data" + Retry 버튼(기존 `Button
 *   variant="link"` 재사용)으로 바뀐다.
 *
 * 채움 순서: `selves` 배열 순서 = 북쪽부터 시계방향.
 * Figma 실측(1명=북쪽만, 2명=북+남 정반대)과는 다르지만, 실제 서비스에서 원하는
 * 채움 규칙(시계방향)을 그대로 구현했다.
 *
 * `coachmark`(신규): Growth Potential 온보딩 코치마크는 "지금
 * 장식(decorated) 중인 포커스 셀프"의 퍼센트 배지에만 붙는다(`CompassGrowthAvatar`
 * 참고). 사용자가 다른 셀프를 hover하거나 빈 슬롯을 hover해 장식이 옮겨가거나
 * 사라지면 코치마크도 함께 숨긴다 — 정적 온보딩 힌트가 hover 인터랙션 중에
 * 엉뚱한 위치로 따라다니는 것을 막기 위함(과설계 방지, 최소 변경).
 */

export type CompassSelfClusterVariant =
  | "reach-or-engagement"
  | "growth-potential"
  | "growth-potential-estimate"
  | "growth-potential-error";

export type CompassSelfClusterPosition = CompassGrowthAvatarPosition;

export interface CompassSelfClusterSelf {
  image: string;
  imageAlt?: string;
  /** growth-potential류 variant에서만 사용. 포커스 셀프 선정(최댓값)과 링 크기에 쓰임 */
  growth?: number;
  /**
   * variant="growth-potential-estimate"에서, 이 셀프가 **hover 없이 디폴트로**
   * 장식될 때만 유효(hover 중인 셀프는 이 값과 무관하게 항상 흰 배지). 이 셀프의
   * 데이터가 부족한지 여부 — `true`(기본값)면 평상시 배지가 빨강(경고), `false`면
   * 흰색.
   */
  estimate?: boolean;
}

export interface CompassSelfClusterProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Figma `Style` 축(React `style` prop과의 이름 충돌을 피해 `variant`로 명명) */
  variant?: CompassSelfClusterVariant;
  /** variant="reach-or-engagement"에서만 유효한 중앙 라벨. 기본 "Reach" */
  label?: string;
  /** 북쪽부터 시계방향으로 채워질 셀프 목록. 최대 8명(초과분은 무시) */
  selves?: CompassSelfClusterSelf[];
  /** selves 배열 인덱스 기준 활성(hover/press) 상태 — 채워진 셀프에 적용 */
  activeSelfIndex?: number;
  /** 빈 슬롯에 활성 상태를 줄 때의 위치(Figma `Active where=empty`) */
  activeEmptyPosition?: CompassSelfClusterPosition;
  /** 채워진 셀프 클릭 — Content Studio 이동 의도 */
  onSelfClick?: (index: number) => void;
  /** 빈 슬롯 클릭 — Assets 이동 의도 */
  onEmptySlotClick?: (position: CompassSelfClusterPosition) => void;
  /** variant="growth-potential-error"에서만 유효한 Retry 클릭 핸들러 */
  onRetry?: () => void;
  /**
   * growth-potential류 variant에서만 유효. 지금 장식 중인 기본(hover 아님)
   * 포커스 셀프의 퍼센트 배지에 붙는 온보딩 코치마크.
   */
  coachmark?: {
    title: string;
    description?: string;
    onDismiss?: () => void;
  };
}

/** 북쪽(0)부터 시계방향 순서. CompassGrowthAvatar의 `position`(=−bearing) 규약과 동일 */
const FILL_ORDER: CompassSelfClusterPosition[] = [
  0, -45, -90, -135, -180, 135, 90, 45,
];

/** 위성 중심까지의 거리(px). 8방향 전부 실측 평균(156.5~158px) */
const SATELLITE_RADIUS = 157;
/** 컨테이너 크기(px). Figma 프레임 413×415 실측을 정사각형으로 단순화 */
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
 * hover 추적은 이 컴포넌트의 안정된 위치 wrapper div에 건다(`CompassGrowthAvatar`
 * ↔ `CompassSelfAvatar` 사이를 오가는 자식 대신) — 장식 여부에 따라 자식 컴포넌트
 * 타입이 바뀌면 React가 그 서브트리를 통째로 unmount/remount하므로, 자식에 직접
 * hover 핸들러를 달면 hover 도중 DOM 노드가 사라져 hover state가 끊기는 버그가
 * 생긴다(실측). 이 wrapper 자체는 자식 타입과 무관하게 항상 유지된다.
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
      style={{ transform: `rotate(${-position}deg)` }}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ top: -SATELLITE_RADIUS }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div style={{ transform: `rotate(${position}deg)` }}>{children}</div>
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
  const isError = variant === "growth-potential-error";
  const isGrowthSet =
    variant === "growth-potential" || variant === "growth-potential-estimate";
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

        // growth-potential류는 항상 CompassGrowthAvatar로 렌더링한다(장식 없는
        // 셀프도 마찬가지) — 장식 여부에 따라 CompassSelfAvatar↔CompassGrowthAvatar로
        // 컴포넌트 타입 자체를 바꾸면 hover마다 서브트리가 리마운트되어 전환이
        // 뚝뚝 끊긴다(실측). 대신 `decorated` prop으로 opacity만
        // 부드럽게 트랜지션한다(compass-growth-avatar.tsx 참고).
        //
        // hover는 decoratedIndex뿐 아니라 status도 즉시 "active"로 강제해
        // "Go to Content Studio" + 포텐셜 배지가 지연 없이 함께 나타난다. 이 규칙
        // 덕분에 Estimate 안내 문구는 hover 중인 셀프에는 절대 뜨지 않고, 아무것도
        // hover하지 않은 디폴트 포커스 셀프의 평상시 모습에만 나타난다(Figma
        // 검증된 status=active 규칙과 일치). 배지 색은
        // status와 무관하게 각 셀프 자신의 estimate 값을 그대로 따른다.
        const isHoveredSelf = isGrowthSet && hoveredSelfIndex === i;
        const isActive = activeSelfIndex === i || isHoveredSelf;
        const isDecorated = isGrowthSet && i === decoratedIndex;
        // 코치마크는 "아무 hover도 없는" 기본 포커스 셀프에만 붙인다 — hover로
        // 장식이 다른 셀프에게 옮겨가거나(hoveredSelfIndex) 전부 사라지면
        // (hoveredEmptyPosition) 함께 숨긴다.
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
            {isGrowthSet ? (
              <CompassGrowthAvatar
                variant="self"
                position={position}
                growth={self.growth ?? 0}
                decorated={isDecorated}
                estimate={
                  variant === "growth-potential-estimate" &&
                  (self.estimate ?? true)
                }
                status={isActive ? "active" : "default"}
                image={self.image}
                imageAlt={self.imageAlt}
                coachmark={showCoachmarkHere ? coachmark : undefined}
                onClick={() => onSelfClick?.(i)}
              />
            ) : (
              <CompassSelfAvatar
                variant="self"
                status={isActive ? "active" : "default"}
                image={self.image}
                imageAlt={self.imageAlt}
                onClick={() => onSelfClick?.(i)}
              />
            )}
          </PositionedSatellite>
        );
      })}
    </div>
  );
}
