import * as React from "react";

import { cn } from "@/lib/utils";
import {
  CompassDial,
  type CompassDialSelf,
  type CompassDialType,
} from "@/components/compass/ui/compass-dial";
import { CANVAS_SIZE } from "@/components/compass/ui/compass-dial/compass-dial-utils";
import {
  CompassSelfCluster,
  type CompassSelfClusterPosition,
  type CompassSelfClusterSelf,
  type CompassSelfClusterVariant,
} from "@/components/compass/ui/compass-self-cluster";

/**
 * `CompassDial`과 `CompassSelfCluster`를 겹쳐 보여주는 최종 조립 컴포넌트.
 * 800×800 캔버스(`CompassDial`의 `CANVAS_SIZE`) 중심에 `CompassSelfCluster`를
 * 겹쳐 놓는다.
 *
 * `CompassDialType`에는 potential류에 대응하는 타입이 없으므로, potential류
 * `clusterVariant`에서는 `dial={false}`로 다이얼 눈금 링을 숨기고 셀프
 * 클러스터만 보여주는 용도로 쓴다.
 *
 * 셀프 데이터는 `CompassDialSelf`(id/qualifiedReach/engagementIntensity)와
 * `CompassSelfClusterSelf`(image/imageAlt/growth)로 모양이 다르지만 같은 8명을
 * 같은 슬롯 순서로 가리켜야 하므로, 통합된 `CompassAnalysisSelf` 배열 하나만
 * 받아 내부에서 각 하위 컴포넌트용으로 변환한다.
 *
 * `coachmark`는 `dial`/`clusterVariant`에 맞는 하위 컴포넌트로 그대로 전달되며,
 * 해당하지 않으면(Ranking 등) 무시된다.
 */

export interface CompassAnalysisSelf {
  id: string;
  image: string;
  imageAlt?: string;
  qualifiedReach: number;
  engagementIntensity: number;
  /** potential류 clusterVariant에서만 사용 */
  growth?: number;
  /** clusterVariant="potential-estimate"에서 이 셀프가 장식될 때만 유효 */
  estimate?: boolean;
}

export interface CompassAnalysisProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** 다이얼 눈금 링 표시 여부(Figma `dial` prop). 기본 true */
  dial?: boolean;
  /** dial=true일 때만 유효. CompassDial로 그대로 전달 */
  type?: CompassDialType;
  /** dial=true일 때만 유효. CompassDial로 그대로 전달 */
  isDataCollected?: boolean;
  /** CompassSelfCluster의 variant. 기본 "reach-or-engagement" */
  clusterVariant?: CompassSelfClusterVariant;
  /** clusterVariant="reach-or-engagement"에서만 유효한 중앙 라벨 */
  label?: string;
  /** 북쪽부터 시계방향으로 채워질 셀프 목록. 최대 8명 */
  selves?: CompassAnalysisSelf[];
  activeSelfIndex?: number;
  activeEmptyPosition?: CompassSelfClusterPosition;
  onSelfClick?: (index: number) => void;
  onEmptySlotClick?: (position: CompassSelfClusterPosition) => void;
  /** clusterVariant="potential-error"에서만 유효한 Retry 클릭 핸들러 */
  onRetry?: () => void;
  /**
   * 현재 서브메뉴의 온보딩 코치마크. `dial`/`clusterVariant`에 맞는 하위
   * 컴포넌트로 그대로 전달되며, 해당하지 않으면(Ranking 등) 무시된다.
   */
  coachmark?: {
    title: string;
    description?: string;
    onDismiss?: () => void;
  };
}

export function CompassAnalysis({
  dial = true,
  type = "reach-and-engagement",
  isDataCollected = true,
  clusterVariant = "reach-or-engagement",
  label,
  selves = [],
  activeSelfIndex,
  activeEmptyPosition,
  onSelfClick,
  onEmptySlotClick,
  onRetry,
  coachmark,
  className,
  ...props
}: CompassAnalysisProps) {
  const dialSelves = React.useMemo<CompassDialSelf[]>(
    () =>
      selves.map((self) => ({
        id: self.id,
        qualifiedReach: self.qualifiedReach,
        engagementIntensity: self.engagementIntensity,
      })),
    [selves],
  );

  const clusterSelves = React.useMemo<CompassSelfClusterSelf[]>(
    () =>
      selves.map((self) => ({
        image: self.image,
        imageAlt: self.imageAlt,
        growth: self.growth,
        estimate: self.estimate,
      })),
    [selves],
  );

  return (
    <div
      className={cn("relative", className)}
      style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
      {...props}
    >
      {dial && (
        <CompassDial
          type={type}
          selves={dialSelves}
          isDataCollected={isDataCollected}
          coachmark={coachmark}
        />
      )}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <CompassSelfCluster
          variant={clusterVariant}
          label={label}
          selves={clusterSelves}
          activeSelfIndex={activeSelfIndex}
          activeEmptyPosition={activeEmptyPosition}
          onSelfClick={onSelfClick}
          onEmptySlotClick={onEmptySlotClick}
          onRetry={onRetry}
          coachmark={coachmark}
        />
      </div>
    </div>
  );
}
