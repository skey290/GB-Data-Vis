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
 * Figma "Analysis" (❄️ GB_Compass, C34HOpbSASmThFA1iYFm8D) node-id 8175:10959.
 *
 * `CompassDial`과 `CompassSelfCluster`를 겹쳐 보여주는 최종 조립 컴포넌트.
 * 두 인스턴스는 리스케일 없이(100% 크기) 중심이 일치하게 겹쳐져 있으므로, 이
 * 컴포넌트는 800×800 캔버스(`CompassDial`의 `CANVAS_SIZE`) 중심에
 * `CompassSelfCluster`를 겹쳐 놓기만 한다. 셀프 아바타 링(반지름 ~157px)과
 * 다이얼 눈금 링(반지름 ~380~400px) 사이에는 겹치지 않는 여백이 있다.
 *
 * Figma가 노출한 prop은 `dial`(boolean) 하나뿐 — `CompassDialType`에는
 * growth-potential에 대응하는 타입이 없으므로, growth-potential류 variant에서는
 * `dial={false}`로 다이얼 눈금 링 자체를 숨기고 셀프 클러스터만 보여주는 용도로
 * 쓴다(진입 시 growth-potential이 먼저 보이고, GNB 근처 토글로
 * reach/engagement/ranking(다이얼 있음)으로 전환됨).
 *
 * 셀프 데이터는 `CompassDialSelf`(id/qualifiedReach/engagementIntensity)와
 * `CompassSelfClusterSelf`(image/imageAlt/growth)로 모양이 다르지만 같은 8명을
 * 같은 슬롯 순서로 가리켜야 하므로, 호출부 부담을 줄이기 위해 통합된
 * `CompassAnalysisSelf` 배열 하나만 받아 내부에서 각 하위 컴포넌트용으로 변환한다.
 *
 * `coachmark`: 서브메뉴(Growth Potential/Reach/Engagement) 온보딩 코치마크
 * 하나를 이 레벨에서 받아 `dial`/`type`에 따라 알맞은 하위 컴포넌트로 그대로
 * 전달한다 — `CompassDial`은 `type="reach"|"engagement"`가 아니면 무시하고,
 * `CompassSelfCluster`는 growth-potential류가 아니면 무시하므로 호출부
 * (`app/compass/page.tsx`)는 "지금 서브메뉴에 코치마크가 있는지"만 신경 쓰면
 * 된다(Ranking은 코치마크가 없어 `undefined`를 넘기면 됨).
 */

export interface CompassAnalysisSelf {
  id: string;
  image: string;
  imageAlt?: string;
  qualifiedReach: number;
  engagementIntensity: number;
  /** growth-potential류 clusterVariant에서만 사용 */
  growth?: number;
  /** clusterVariant="growth-potential-estimate"에서 이 셀프가 장식될 때만 유효 */
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
  dataCollected?: boolean;
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
  /** clusterVariant="growth-potential-error"에서만 유효한 Retry 클릭 핸들러 */
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
  dataCollected = true,
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
          dataCollected={dataCollected}
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
