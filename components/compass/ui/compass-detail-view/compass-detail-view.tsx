import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import {
  CompassMetricCard,
  type CompassMetricCardState,
} from "@/components/compass/ui/compass-metric-card";

/**
 * Figma "Detail view"(❄️ GB_Compass, C34HOpbSASmThFA1iYFm8D) node-id 8003:12444.
 *
 * 특정 직업/토픽 하나에 대한 성장 분석 상세 패널. `compass-dial`/`compass-self-cluster`
 * 계열(원형 궤도 기하 구조)과는 완전히 무관한 별개 조립 컴포넌트다. 헤더(탭 1개 +
 * "Create Posts with one click" CTA) 아래 `CompassMetricCard` 3장(Growth
 * Potential / Qualified Reach / Engagement Intensity)을 세로로 쌓는다 — 카드
 * 셸은 `CompassMetricCard`(components/compass/ui/compass-metric-card)로 분리하고,
 * 카드마다 다른 콘텐츠(퍼센트 히어로, 포스트 통계, 빈 상태, 에러 상태)만 이
 * 파일에서 조립한다(사용자 승인, 2026-09-28).
 *
 * `type` 6종 → 파생 규칙(get_design_context 6개 variant 전부 실측, 2026-09-28):
 * - `error`: 3장 모두 반투명 blur 박스(circle-x + 안내문 + Retry)로 대체. CTA
 *   버튼도 `Button`의 `disabled` prop을 쓰지 않고(토큰이 다름:
 *   `--background-disabled`/`--text-static-gray`가 아니라
 *   `--background-selected`/`--text-subtler`/`--border-overlay`) className으로
 *   직접 오버라이드.
 * - `niche-data`/`no-experience`: **Growth Potential 카드에만** `--border-warning`
 *   보더가 붙는다(실측 결과 Reach/Qualified·Engagement 카드는 두 타입에서도 보더
 *   없음 — 직관과 달리 "경고 보더 = 전체 카드 공통"이 아니었음).
 * - `bls`/`trend-data`: Qualified Reach/Engagement Intensity 카드가 빈 상태
 *   대신 실제 포스트 통계(대표 포스트 + 최근 포스트, 델타 배지·Breakdown 리스트는
 *   있을 때만) 2컬럼을 보여준다. 그 외(`default`/`niche-data`/`no-experience`)는
 *   "Not Enough posts Yet" 빈 상태.
 * - Growth Potential 카드는 위 6종 어디서도 빈 상태가 없다 — 항상 퍼센트
 *   히어로 + Industry Growth/Experience 2행을 보여주고(카피만 타입별로 다름),
 *   `error`에서만 blur 박스로 전환된다.
 *
 * 아이콘: `circle-x-icon`은 Figma `data-name="lucide/circle-x"`와 실제 SVG
 * 둘 다 확인 후 사용. 카드 우측 상단의 "화살표" 아이콘은 Figma layer 이름이
 * `lucide/circle-dashed`로 되어 있지만 실제 인스턴스 스왑으로 렌더링되는 SVG는
 * arrow-up-right 모양이라(다운로드해 직접 확인, 2026-09-28) `arrow-up-right-icon`을
 * 사용했다 — layer 이름을 그대로 믿으면 안 되는 사례.
 * 빈 상태 아이콘은 `no-file-pen-icon` 사용(2026-09-28 교체, 아래 참고). 처음엔
 * "파일-펜 + 금지 슬래시" 합성 아이콘(`lucide/no file-pen`)의 정확한 스프라이트
 * 심볼이 없어 슬래시 없는 `file-pen-icon`으로 근사 처리했었으나, 사용자가 공유한
 * ❄️ GB_Design System (Atom) 아이콘 라이브러리 프레임(node-id 1086:1066)에서
 * 정확한 원본(`lucide/no file-pen`, node 4976:8231)을 발견해 `public/icons.svg`에
 * `no-file-pen-icon`으로 추가하고 이 근사치를 교체함.
 */

export type CompassDetailViewType =
  "default" | "bls" | "niche-data" | "no-experience" | "trend-data" | "error";

export interface CompassDetailViewPostStatDelta {
  label: string;
  variant: Extract<BadgeProps["variant"], "success" | "alarm">;
}

export interface CompassDetailViewPostStat {
  /** 통계 라벨 (예: "Most Reached Post") */
  label: string;
  /** 통계 값 (예: "8,340") */
  value: string;
  /** 증감 배지. 없으면 렌더링하지 않음(예: "Most Reached/Engaged Post") */
  delta?: CompassDetailViewPostStatDelta;
  /** 델타 배지 옆 캡션 (예: "vs Previous Post") */
  deltaCaption?: string;
  /** 하단 Breakdown 목록. 없으면 렌더링하지 않음 */
  breakdown?: { label: string; value: string }[];
  /** 우상단 화살표 버튼 클릭 핸들러 */
  onRefreshClick?: () => void;
}

export interface CompassDetailViewProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Figma `type` 변형. 기본 "default" */
  type?: CompassDetailViewType;
  /** 상단 탭 라벨. 기본값은 `type`별 Figma 샘플값("trend-data"만 "Vintage Fashion") */
  title?: string;
  onCreatePostsClick?: () => void;
  /** 3개 카드 공통 에러 상태 Retry 클릭 핸들러 (`type="error"`에서만 유효) */
  onRetry?: () => void;
  onGrowthFooterClick?: () => void;
  onReachFooterClick?: () => void;
  onEngagementFooterClick?: () => void;
  /** Growth Potential 퍼센트 값. 기본값은 `type`별 Figma 샘플값 */
  growthPercent?: string;
  /** Growth Potential "Industry Growth"/"Content Trend" 행의 상세 텍스트 */
  growthIndustryDetail?: string;
  /** Growth Potential "Experience" 행의 값 */
  growthExperienceYears?: string;
  /** `type="bls"|"trend-data"`에서만 사용. 최대 2개(대표 포스트 + 최근 포스트) */
  reachStats?: CompassDetailViewPostStat[];
  /** `type="bls"|"trend-data"`에서만 사용. 최대 2개(대표 포스트 + 최근 포스트) */
  engagementStats?: CompassDetailViewPostStat[];
}

const TITLE_BY_TYPE: Record<CompassDetailViewType, string> = {
  default: "Data Scientist",
  bls: "Data Scientist",
  "niche-data": "Data Scientist",
  "no-experience": "Data Scientist",
  "trend-data": "Vintage Fashion",
  error: "Data Scientist",
};

const GROWTH_DESCRIPTION_BY_TYPE: Record<
  Exclude<CompassDetailViewType, "error">,
  string
> = {
  default:
    "It reflects how promising your career background is, based on 'official U.S. labor statistics' and your experience.",
  bls: "It reflects how promising your career background is, based on 'official U.S. labor statistics' and your experience.",
  "no-experience":
    "It reflects how promising your career background is, based on 'official U.S. labor statistics' and your experience.",
  "niche-data":
    "Data is too new or niche to measure growth yet, so we're showing a neutral estimate.",
  "trend-data":
    "Your field isn't officially classified yet, so this is based on 'search trend data' instead — a lighter, rougher read than industry data.",
};

const GROWTH_INDUSTRY_LABEL_BY_TYPE: Record<
  Exclude<CompassDetailViewType, "error">,
  string
> = {
  default: "Industry Growth",
  bls: "Industry Growth",
  "no-experience": "Industry Growth",
  "niche-data": "Industry Growth",
  "trend-data": "Content Trend",
};

const GROWTH_PERCENT_DEFAULT_BY_TYPE: Record<
  Exclude<CompassDetailViewType, "error">,
  string
> = {
  default: "80%",
  bls: "80%",
  "trend-data": "80%",
  "niche-data": "20%",
  "no-experience": "20%",
};

const GROWTH_INDUSTRY_DETAIL_DEFAULT_BY_TYPE: Record<
  Exclude<CompassDetailViewType, "error">,
  string
> = {
  default: "Data Scientist, +29% projected over 10 years",
  bls: "Data Scientist, +29% projected over 10 years",
  "no-experience": "Data Scientist, +29% projected over 10 years",
  "niche-data": "Not enough data to show industry detail",
  "trend-data":
    "Vintage Fashion — content mentions have more than doubled in the past year",
};

const GROWTH_EXPERIENCE_DEFAULT_BY_TYPE: Record<
  Exclude<CompassDetailViewType, "error">,
  string
> = {
  default: "10 years",
  bls: "10 years",
  "trend-data": "10 years",
  "niche-data": "Not enough data to calculate this accurately.",
  "no-experience": "Not enough data to calculate this accurately.",
};

const REACH_DESCRIPTION =
  "An estimate of how many people your content actually reached, not just how many times it was shown.";
const REACH_HELPER_EMPTY =
  "Reach needs 9 posts, each at least 7 days old, to show results.";

const ENGAGEMENT_DESCRIPTION =
  "Not a click count.\nThis measures how deeply people responded to your post — comments and shares count for more than a like.";
const ENGAGEMENT_HELPER_EMPTY =
  "Engagement needs 9 posts, each at least 7 days old, to show results.";
const ENGAGEMENT_FOOTNOTE =
  "Can go above 100% — comments and shares count more than likes.";

const DEFAULT_REACH_STATS: CompassDetailViewPostStat[] = [
  { label: "Most Reached Post", value: "8,340" },
  {
    label: "Most Recent Post",
    value: "6,150",
    delta: { label: "-8%", variant: "alarm" },
    deltaCaption: "vs Previous Post",
  },
];

const DEFAULT_ENGAGEMENT_STATS: CompassDetailViewPostStat[] = [
  {
    label: "Most Engaged Post",
    value: "14.3%",
    breakdown: [
      { label: "Reactions", value: "310" },
      { label: "Comments", value: "42" },
      { label: "Shares", value: "18" },
    ],
  },
  {
    label: "Most Recent Post",
    value: "4.3%",
    delta: { label: "+0.2pp", variant: "success" },
    deltaCaption: "vs Previous Post",
    breakdown: [
      { label: "Reactions", value: "200" },
      { label: "Comments", value: "20" },
      { label: "Shares", value: "10" },
    ],
  },
];

/**
 * 카드 콘텐츠 영역이 "반투명 blur 박스"로 바뀌는 두 경우(빈 상태 아이콘, 에러
 * 안내) 공통 셸. Figma 실측: `aspect-[510/246]`.
 *
 * `backdrop-blur` 값 재검증(2026-09-28): 처음엔 `get_design_context`가 생성한
 * 코드의 raw `backdrop-blur-[6px]` 클래스만 보고 토큰 중 가장 가까운 8px로
 * 근사했었으나, `get_variable_defs`로 실제 바인딩된 Effect 스타일을 직접
 * 조회한 결과 이 노드가 참조하는 스타일은 **"Backdrop Blur/backdrop-blur-md"
 * (radius: 12)** 였다 — Figma 코드젠이 named effect style을 arbitrary px
 * 클래스로 변환하는 과정에서 값이 어긋난 것으로 보임(스타일 이름 자체가
 * "-md"인데 6px로 나온 것부터 모순). `src/tokens/effects.css`의
 * `--backdrop-blur-md: blur(12px)`와 스타일 이름까지 정확히 일치해 근사 없이
 * 그대로 사용 — 신규 토큰 불필요.
 */
function FrostedBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex aspect-[510/246] w-full flex-col items-center justify-center gap-[var(--spacing-2)]",
        "rounded-[var(--radius-scale-2xl)] bg-[var(--background-surface)] px-[var(--spacing-5)]",
        "opacity-[var(--opacity-85)] backdrop-blur-[var(--backdrop-blur-md)]",
      )}
    >
      {children}
    </div>
  );
}

function ErrorBoxContent({ onRetry }: { onRetry?: () => void }) {
  return (
    <FrostedBox>
      <svg
        className="size-[24px] text-[var(--icon-default)]"
        aria-hidden="true"
      >
        <use href="/icons.svg#circle-x-icon" />
      </svg>
      <p className="text-lg-medium text-center text-[var(--text-default)]">
        We couldn&apos;t fetch your data
      </p>
      <p className="text-sm-regular w-full text-center text-[var(--text-default)]">
        please try again shortly.
      </p>
      <Button variant="link" onClick={onRetry}>
        Retry
      </Button>
    </FrostedBox>
  );
}

function EmptyBoxContent({ helperText }: { helperText: string }) {
  return (
    <FrostedBox>
      <div className="flex size-[40px] shrink-0 items-center justify-center rounded-[var(--radius-scale-lg)] bg-[var(--background-subtler)]">
        <svg
          className="size-[24px] text-[var(--icon-default)]"
          aria-hidden="true"
        >
          <use href="/icons.svg#no-file-pen-icon" />
        </svg>
      </div>
      <p className="text-lg-medium text-center text-[var(--text-default)]">
        Not Enough posts Yet
      </p>
      <p className="text-sm-regular w-full text-center text-[var(--text-default)]">
        {helperText}
      </p>
    </FrostedBox>
  );
}

/** Growth Potential 전용 콘텐츠 — 퍼센트 히어로 + 세로 구분선 + 2행(Industry Growth/Experience) */
function GrowthContent({
  percent,
  industryLabel,
  industryDetail,
  experienceYears,
}: {
  percent: string;
  industryLabel: string;
  industryDetail: string;
  experienceYears: string;
}) {
  return (
    <div className="flex w-full items-center gap-[var(--spacing-5)]">
      <p className="text-5xl-black shrink-0 text-[var(--text-default)]">
        {percent}
      </p>
      {/* 86px: Figma 세로 구분선 벡터의 실측 높이(내부 기하 상수, 토큰 매칭 없음) */}
      <div
        className="h-[86px] w-0 shrink-0 border-l-[length:var(--border-1)] border-[var(--border-default)]"
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-[var(--spacing-1-5)]">
        <div className="flex flex-col gap-[var(--spacing-1)]">
          <p className="text-sm-semi-bold text-[var(--text-subtle)]">
            {industryLabel}
          </p>
          <p className="text-xs-medium text-[var(--text-default)]">
            {industryDetail}
          </p>
        </div>
        <div className="flex flex-col gap-[var(--spacing-1)]">
          <p className="text-sm-semi-bold text-[var(--text-subtle)]">
            Experience
          </p>
          <p className="text-xs-medium text-[var(--text-default)]">
            {experienceYears}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Qualified Reach/Engagement Intensity 카드의 포스트 통계 블록 1개 (라벨+값+옵션 델타/Breakdown) */
function StatBlock({ stat }: { stat: CompassDetailViewPostStat }) {
  return (
    <div className="relative flex min-w-px flex-1 flex-col items-start gap-[var(--spacing-2)] self-stretch">
      <p className="text-sm-bold overflow-hidden text-ellipsis whitespace-nowrap text-[var(--text-default)]">
        {stat.label}
      </p>
      <p className="text-5xl-black w-full min-w-full text-[var(--text-default)]">
        {stat.value}
      </p>
      {stat.delta && (
        <div className="flex w-full items-center gap-[var(--spacing-1)]">
          <Badge variant={stat.delta.variant} size="20">
            {stat.delta.label}
          </Badge>
          {stat.deltaCaption && (
            <p
              className={cn(
                "text-xs-semi-bold overflow-hidden text-ellipsis whitespace-nowrap",
                stat.delta.variant === "success"
                  ? "text-[var(--text-success)]"
                  : "text-[var(--text-warning)]",
              )}
            >
              {stat.deltaCaption}
            </p>
          )}
        </div>
      )}
      {stat.breakdown && (
        <div className="flex w-full flex-col items-start gap-[var(--spacing-1-5)]">
          <p className="text-sm-bold w-full overflow-hidden text-ellipsis text-[var(--text-subtle)]">
            Breakdown
          </p>
          {stat.breakdown.map((row) => (
            <div
              key={row.label}
              className="flex w-full items-center gap-[var(--spacing-2)]"
            >
              <p className="text-sm-medium min-w-px flex-1 overflow-hidden text-ellipsis text-[var(--text-subtle)]">
                {row.label}
              </p>
              <p className="text-sm-medium shrink-0 overflow-hidden text-ellipsis text-[var(--text-subtle)]">
                {row.value}
              </p>
            </div>
          ))}
        </div>
      )}
      <Button
        variant="ghost"
        icon="arrow-up-right-icon"
        aria-label={`${stat.label} 자세히 보기`}
        onClick={stat.onRefreshClick}
        className="absolute top-[-8px] right-0"
      />
    </div>
  );
}

/** bls/trend-data 타입에서 보여주는 통계 2컬럼 + 세로 구분선 */
function StatRow({ stats }: { stats: CompassDetailViewPostStat[] }) {
  return (
    <div className="flex w-full items-start gap-[var(--spacing-5)]">
      {stats.map((stat, i) => (
        <React.Fragment key={stat.label}>
          {i > 0 && (
            <div
              className="w-0 shrink-0 self-stretch border-l-[length:var(--border-1)] border-[var(--border-default)]"
              aria-hidden="true"
            />
          )}
          <StatBlock stat={stat} />
        </React.Fragment>
      ))}
    </div>
  );
}

export function CompassDetailView({
  type = "default",
  title,
  onCreatePostsClick,
  onRetry,
  onGrowthFooterClick,
  onReachFooterClick,
  onEngagementFooterClick,
  growthPercent,
  growthIndustryDetail,
  growthExperienceYears,
  reachStats,
  engagementStats,
  className,
  ...props
}: CompassDetailViewProps) {
  const isError = type === "error";
  const isStatGroup = type === "bls" || type === "trend-data";
  const isGrowthWarning = type === "niche-data" || type === "no-experience";

  const resolvedTitle = title ?? TITLE_BY_TYPE[type];
  const resolvedReachStats = reachStats ?? DEFAULT_REACH_STATS;
  const resolvedEngagementStats = engagementStats ?? DEFAULT_ENGAGEMENT_STATS;

  // Reach/Engagement 카드는 niche-data/no-experience에서도 경고 보더가 붙지
  // 않는다(Growth Potential 카드만의 규칙, 실측 확인) — error에서만 상태 전환.
  const growthState: CompassMetricCardState = isError
    ? "error"
    : isGrowthWarning
      ? "warning"
      : "default";
  const postCardState: CompassMetricCardState = isError ? "error" : "default";

  return (
    <div
      className={cn(
        // 660px: Figma "Detail view" 프레임 자체의 물리적 폭(내부 기하 상수,
        // --scale-*와 매칭되지 않음)
        "isolate flex w-[660px] max-w-[660px] flex-col items-start gap-[var(--spacing-5)]",
        "bg-[var(--background-subtlest)] px-[var(--spacing-9)] pt-[var(--spacing-3)] pb-[var(--spacing-8)]",
        className,
      )}
      {...props}
    >
      <div className="z-[4] flex w-full flex-col items-start gap-[var(--spacing-8)]">
        <Tabs
          items={[{ label: resolvedTitle }]}
          selectedIndex={0}
          className="w-full border-b-[var(--border-mute)]"
        />
        <Button
          variant="primary"
          onClick={onCreatePostsClick}
          aria-disabled={isError || undefined}
          className={cn(
            "w-full",
            isError &&
              "pointer-events-none border border-[var(--border-overlay)] bg-[var(--background-selected)] text-[var(--text-subtler)]",
          )}
        >
          Create Posts with one click
        </Button>
      </div>

      <CompassMetricCard
        title="Growth Potential"
        badgeLabel="Become Recommended"
        description={isError ? undefined : GROWTH_DESCRIPTION_BY_TYPE[type]}
        state={growthState}
        onFooterLinkClick={onGrowthFooterClick}
        className="z-[3]"
      >
        {isError ? (
          <ErrorBoxContent onRetry={onRetry} />
        ) : (
          <GrowthContent
            percent={growthPercent ?? GROWTH_PERCENT_DEFAULT_BY_TYPE[type]}
            industryLabel={GROWTH_INDUSTRY_LABEL_BY_TYPE[type]}
            industryDetail={
              growthIndustryDetail ??
              GROWTH_INDUSTRY_DETAIL_DEFAULT_BY_TYPE[type]
            }
            experienceYears={
              growthExperienceYears ?? GROWTH_EXPERIENCE_DEFAULT_BY_TYPE[type]
            }
          />
        )}
      </CompassMetricCard>

      <CompassMetricCard
        title="Qualified Reach"
        badgeLabel="Become Known"
        description={REACH_DESCRIPTION}
        state={postCardState}
        onFooterLinkClick={onReachFooterClick}
        className="z-[2]"
      >
        {isError ? (
          <ErrorBoxContent onRetry={onRetry} />
        ) : isStatGroup ? (
          <StatRow stats={resolvedReachStats} />
        ) : (
          <EmptyBoxContent helperText={REACH_HELPER_EMPTY} />
        )}
      </CompassMetricCard>

      <CompassMetricCard
        title="Engagement Intensity"
        badgeLabel="Become Trusted"
        description={isError ? undefined : ENGAGEMENT_DESCRIPTION}
        state={postCardState}
        onFooterLinkClick={onEngagementFooterClick}
        className="z-[1]"
      >
        {isError ? (
          <ErrorBoxContent onRetry={onRetry} />
        ) : isStatGroup ? (
          <>
            <StatRow stats={resolvedEngagementStats} />
            <div
              className="h-0 w-full border-t-[length:var(--border-1)] border-[var(--border-default)]"
              aria-hidden="true"
            />
            <p className="text-xs-regular w-full text-[var(--text-subtle)]">
              {ENGAGEMENT_FOOTNOTE}
            </p>
          </>
        ) : (
          <EmptyBoxContent helperText={ENGAGEMENT_HELPER_EMPTY} />
        )}
      </CompassMetricCard>
    </div>
  );
}
