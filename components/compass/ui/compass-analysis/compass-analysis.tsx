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
} from "@/components/compass/ui/compass-self-cluster";

/**
 * `CompassDial`과 `CompassSelfCluster`를 겹쳐 보여주는 최종 조립 컴포넌트.
 * 800×800 캔버스(`CompassDial`의 `CANVAS_SIZE`) 중심에 `CompassSelfCluster`를
 * 겹쳐 놓는다.
 *
 * `type`이 다이얼 노출 여부까지 함께 결정하는 지정된 짝이다(자유 조합 아님):
 * `reach`/`engagement`/`reach-and-engagement`는 다이얼+클러스터를 함께 보여주고,
 * `potential`은 다이얼 없이 클러스터만 보여준다(`potentialVariant`로
 * potential/potential-estimate/potential-error 중 하나 선택).
 *
 * 셀프 데이터는 `CompassDialSelf`(id/qualifiedReach/engagementIntensity)와
 * `CompassSelfClusterSelf`(image/imageAlt/growth)로 모양이 다르지만 같은 8명을
 * 같은 슬롯 순서로 가리켜야 하므로, 통합된 `CompassAnalysisSelf` 배열 하나만
 * 받아 내부에서 각 하위 컴포넌트용으로 변환한다.
 *
 * `coachmark`는 다이얼/클러스터 중 해당하는 쪽으로 그대로 전달되며, 둘 다
 * 해당하지 않으면(Ranking 등) 무시된다.
 */

export type CompassAnalysisType =
  "potential" | "reach" | "engagement" | "reach-and-engagement";

export type CompassAnalysisPotentialVariant =
  "potential" | "potential-estimate" | "potential-error";

export interface CompassAnalysisSelf {
  id: string;
  image: string;
  imageAlt?: string;
  qualifiedReach: number;
  engagementIntensity: number;
  /** type="potential"에서만 사용 */
  growth?: number;
  /** potentialVariant="potential-estimate"에서 이 셀프가 장식될 때만 유효 */
  estimate?: boolean;
}

export interface CompassAnalysisProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** 다이얼 노출 여부까지 함께 결정. 기본 "reach-and-engagement" */
  type?: CompassAnalysisType;
  /** type="potential"에서만 유효. 기본 "potential" */
  potentialVariant?: CompassAnalysisPotentialVariant;
  /** type이 reach/engagement/reach-and-engagement일 때만 유효 */
  isDataCollected?: boolean;
  /** 중앙 라벨. 미지정 시 type에 따른 기본값("reach"→"Reach"/"engagement"→"Engagement"/"reach-and-engagement"→"Ranking") 사용. type="potential"에서는 무시됨(클러스터가 "Growth Potential" 고정) */
  label?: string;
  /** 북쪽부터 시계방향으로 채워질 셀프 목록. 최대 8명 */
  selves?: CompassAnalysisSelf[];
  activeSelfIndex?: number;
  activeEmptyPosition?: CompassSelfClusterPosition;
  onSelfClick?: (index: number) => void;
  onEmptySlotClick?: (position: CompassSelfClusterPosition) => void;
  /** potentialVariant="potential-error"에서만 유효한 Retry 클릭 핸들러 */
  onRetry?: () => void;
  /**
   * 현재 서브메뉴의 온보딩 코치마크. 다이얼/클러스터 중 해당하는 쪽으로
   * 그대로 전달되며, 둘 다 해당하지 않으면(Ranking 등) 무시된다.
   */
  coachmark?: {
    title: string;
    description?: string;
    onDismiss?: () => void;
  };
}

const DEFAULT_LABEL_BY_TYPE: Record<CompassDialType, string> = {
  reach: "Reach",
  engagement: "Engagement",
  "reach-and-engagement": "Ranking",
};

export function CompassAnalysis({
  type = "reach-and-engagement",
  potentialVariant = "potential",
  isDataCollected = true,
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
  const isPotential = type === "potential";
  const dialType: CompassDialType | undefined = isPotential ? undefined : type;
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
      {dialType && (
        <CompassDial
          type={dialType}
          selves={dialSelves}
          isDataCollected={isDataCollected}
          coachmark={coachmark}
        />
      )}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <CompassSelfCluster
          variant={isPotential ? potentialVariant : "reach-or-engagement"}
          label={
            isPotential ? undefined : (label ?? DEFAULT_LABEL_BY_TYPE[type])
          }
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
