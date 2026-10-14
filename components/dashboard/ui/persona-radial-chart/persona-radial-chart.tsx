"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  SelfCuration,
  selfCurationEmptySlotKey,
} from "@/components/dashboard/ui/self-curation";

/**
 * 셀프 + 8개 페르소나를 3개 지표(동심원 링) × 8개 섹터(각도)로 비교하는 원형 차트.
 * 스펙 상세는 `docs/persona-radial-chart-spec.md` 참고.
 *
 * ⚠️ 아래 반지름/각도 상수는 CSS 길이가 아니라 SVG `viewBox` 내부 좌표값이다.
 */

const CANVAS_SIZE = 500;
const RING_BOUNDARY_RADII = [128, 160, 200, 250] as const;
const RING_BAND_COUNT = 8;
const LABEL_ORBIT_RADIUS = 265;
const NOT_ENOUGH_DATA_OFFSET_Y = 276;
/** 칸 수는 8개 고정 — 채워진 칸 수(`selfCount`)와는 별개 */
const SECTOR_COUNT = 8;
const SECTOR_ANGLE = 360 / SECTOR_COUNT;
/** SVG는 3시 방향이 0°라, -90°(12시)에서 시작해야 맨 위 스포크가 수직이 된다 */
const FIRST_SECTOR_START_ANGLE = -90;
const DEFAULT_VALUE_FRACTION_DIGITS = 1;

/** 500px 차트는 150ms(기본값)로는 전환이 끊겨 보여 200ms로 잡음 */
const MOTION_DURATION = "duration-200 ease-out";
const COLOR_TRANSITION = `transition-colors ${MOTION_DURATION} motion-reduce:transition-none`;
const BADGE_TRANSITION = `transition-[color,background-color,box-shadow] ${MOTION_DURATION} motion-reduce:transition-none`;
const FADE_IN = `animate-in fade-in ${MOTION_DURATION} motion-reduce:animate-none`;
/** 다크=흰색/라이트=검정으로 반전되는 시맨틱 토큰으로 강조 밴드를, 반대 극성 토큰으로 딤 밴드를 표현 */
const HIGHLIGHT_BAND_FILL =
  "color-mix(in srgb, var(--icon-default) 20%, transparent)";
const DIMMED_BAND_FILL = "var(--background-sheer)";

/** 안쪽부터 3개의 큰 링 = 3개 지표 카테고리 */
export const PERSONA_METRICS = [
  {
    key: "growth",
    label: "Growth Potential",
    innerRadius: 128,
    outerRadius: 160,
  },
  {
    key: "reach",
    label: "Qualified Reach",
    innerRadius: 160,
    outerRadius: 200,
  },
  {
    key: "engagement",
    label: "Engagement Intensity",
    innerRadius: 200,
    outerRadius: 250,
  },
] as const;

export type PersonaMetricKey = (typeof PERSONA_METRICS)[number]["key"];

export interface PersonaDatum {
  /** 페르소나 식별자 (셀프 지정 및 React key로 사용) */
  id: string;
  /** 섹터 바깥 배지에 표시되는 이름 */
  name: string;
  /** 아바타 이미지 URL. 없으면 initials → 아이콘 순으로 폴백됩니다 */
  imageSrc?: string;
  /** 아바타 이미지가 없을 때 표시할 이니셜 */
  initials?: string;
  /** Growth Potential (%) */
  growth: number;
  /** Qualified Reach (명) */
  reach: number;
  /** Engagement Intensity (%) */
  engagement: number;
}

/** Figma mock 샘플 데이터 — 배열 순서가 곧 섹터 배치 순서(12시부터 시계방향) */
export const DEFAULT_PERSONAS: PersonaDatum[] = [
  {
    id: "data-scientist",
    name: "Data Scientist",
    imageSrc: "/images/personas/self-default.jpg",
    initials: "DS",
    growth: 80,
    reach: 8340,
    engagement: 14.3,
  },
  {
    id: "yoga-meditator",
    name: "Yoga Meditator",
    imageSrc: "/images/personas/yoga-meditator.jpg",
    initials: "YM",
    growth: 10,
    reach: 6453,
    engagement: 1.8,
  },
  {
    id: "novelist",
    name: "Novelist",
    imageSrc: "/images/personas/novelist.jpg",
    initials: "NV",
    growth: 40,
    reach: 4784,
    engagement: 0.4,
  },
  {
    id: "entrepreneur",
    name: "Entrepreneur",
    imageSrc: "/images/personas/entrepreneur.jpg",
    initials: "EN",
    growth: 70,
    reach: 978,
    engagement: 2.0,
  },
  {
    id: "fashionista",
    name: "Fashionista",
    imageSrc: "/images/personas/fashionista.jpg",
    initials: "FA",
    growth: 60,
    reach: 6782,
    engagement: 0.3,
  },
  {
    id: "fashion-editor",
    name: "Fashion Editor",
    imageSrc: "/images/personas/fashion-editor.jpg",
    initials: "FE",
    growth: 20,
    reach: 125,
    engagement: 3.7,
  },
  {
    id: "team-leader",
    name: "Team Leader",
    imageSrc: "/images/personas/team-leader.jpg",
    initials: "TL",
    growth: 50,
    reach: 8006,
    engagement: 0.5,
  },
  {
    id: "vegan-chef",
    name: "Vegan Chef",
    imageSrc: "/images/personas/vegan-chef.jpg",
    initials: "VC",
    growth: 30,
    reach: 5431,
    engagement: 1.9,
  },
];

/** `self`는 Figma variant가 아니라 아바타를 직접 hover했을 때 코드에서만 다루는 값 */
export type PersonaRadialChartHover = "default" | PersonaMetricKey | "self";

function getCenterMessage(
  hover: PersonaRadialChartHover,
  isDataCollected: boolean,
  isEmptySlotActive: boolean,
) {
  if (hover === "self") {
    // 기준은 selfCount가 아니라 지금 강조된 대상(빈 슬롯인지)이다
    return isEmptySlotActive ? "Create a Self" : "Go to Content Studio";
  }
  if (hover === "default") {
    return "Hover to see analysis";
  }
  if (hover === "growth") {
    return "Growth Potential";
  }
  if (!isDataCollected) {
    return "Create Posts to analyze";
  }
  return hover === "reach" ? "Qualified Reach" : "Engagement Intensity";
}

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

/** 도넛 조각(annulus sector) path. 섹터 각도가 45°(<180°) 고정이라 large-arc-flag는 항상 0 */
function annulusSectorPath(
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
) {
  const outerStart = polarToCartesian(outerRadius, startAngle);
  const outerEnd = polarToCartesian(outerRadius, endAngle);
  const innerEnd = polarToCartesian(innerRadius, endAngle);
  const innerStart = polarToCartesian(innerRadius, startAngle);

  return [
    `M ${round(outerStart.x)} ${round(outerStart.y)}`,
    `A ${outerRadius} ${outerRadius} 0 0 1 ${round(outerEnd.x)} ${round(outerEnd.y)}`,
    `L ${round(innerEnd.x)} ${round(innerEnd.y)}`,
    `A ${innerRadius} ${innerRadius} 0 0 0 ${round(innerStart.x)} ${round(innerStart.y)}`,
    "Z",
  ].join(" ");
}

/** 링 전체(360°) 도넛 path. `fill-rule="evenodd"`로 안쪽을 뚫는다 */
function fullAnnulusPath(innerRadius: number, outerRadius: number) {
  const ring = (r: number) =>
    `M ${r} 0 A ${r} ${r} 0 1 1 ${-r} 0 A ${r} ${r} 0 1 1 ${r} 0 Z`;
  return `${ring(outerRadius)} ${ring(innerRadius)}`;
}

function formatMetricValue(
  metricKey: PersonaMetricKey,
  value: number,
  fractionDigits: number,
) {
  const text = value.toLocaleString("en-US", {
    maximumFractionDigits: fractionDigits,
  });
  return metricKey === "reach" ? text : `${text}%`;
}

function getSectorGeometry(index: number) {
  const startAngle = FIRST_SECTOR_START_ANGLE + SECTOR_ANGLE * index;
  return {
    startAngle,
    endAngle: startAngle + SECTOR_ANGLE,
    midAngle: startAngle + SECTOR_ANGLE / 2,
  };
}

/** 배지를 원 바깥에 붙이기 위한 정렬 기준 (Figma 실측 좌표에서 역산) */
function getLabelAnchor(midAngle: number) {
  const { x, y } = polarToCartesian(1, midAngle);
  const isCornerSector = Math.abs(y) > 0.7;

  return {
    translateX: x > 0 ? "0%" : "-100%",
    translateY: isCornerSector ? (y > 0 ? "0%" : "-100%") : "-50%",
  };
}

/**
 * 밴드 칸 수 = 그 링 안에서의 순위(값 비율 아님). 1등 8칸 / 꼴등 1칸으로 균등 배분해,
 * 값이 비슷하거나 한 명이 압도적이어도 8명이 항상 구분되게 한다. 동점은 같은 칸,
 * 값이 0 이하면 0칸.
 */
function getRankBandCounts(values: number[]) {
  const ranked = values.filter((value) => value > 0).sort((a, b) => b - a);

  return values.map((value) => {
    if (value <= 0) return 0;
    if (ranked.length <= 1) return RING_BAND_COUNT;

    const rank = ranked.indexOf(value);
    const step = (RING_BAND_COUNT - 1) / (ranked.length - 1);
    return Math.max(1, Math.round(RING_BAND_COUNT - rank * step));
  });
}

export interface PersonaRadialChartProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onSelect"
> {
  /** 존재하는 페르소나 데이터. 8칸보다 적으면 남는 칸은 "No Self" 빈 슬롯이 됨 */
  personas?: PersonaDatum[];
  /** 노출할 셀프 수. 기본값은 `personas.length` */
  selfCount?: number;
  /** 배지 값의 최대 소수 자릿수. 기본 1 */
  valueFractionDigits?: number;
  /** Figma `Data collected` — 게시물이 있어야 Reach/Engagement가 산출됨 */
  isDataCollected?: boolean;
  /** 값을 주면 제어 컴포넌트(마우스 무시), 안 주면 실제 마우스 hover를 따름 */
  hover?: PersonaRadialChartHover;
  /** hover 상태가 바뀔 때 호출됨 */
  onHoverChange?: (hover: PersonaRadialChartHover) => void;
  /** 셀프로 취급할 페르소나 id. 기본값은 첫 번째 페르소나 */
  selfId?: string;
  /** 중앙 문구 클릭 핸들러 (CTA 성격) */
  onCenterClick?: () => void;
}

export function PersonaRadialChart({
  personas = DEFAULT_PERSONAS,
  selfCount,
  valueFractionDigits = DEFAULT_VALUE_FRACTION_DIGITS,
  isDataCollected = true,
  hover: controlledHover,
  onHoverChange,
  selfId,
  onCenterClick,
  className,
  ...props
}: PersonaRadialChartProps) {
  const [uncontrolledHover, setUncontrolledHover] =
    React.useState<PersonaRadialChartHover>("default");
  const hover = controlledHover ?? uncontrolledHover;

  const changeHover = (next: PersonaRadialChartHover) => {
    if (controlledHover === undefined) {
      setUncontrolledHover(next);
    }
    onHoverChange?.(next);
  };

  const [hoveredAvatarId, setHoveredAvatarId] = React.useState<string | null>(
    null,
  );

  // `selfId=""`가 `??`를 통과해버리는 걸 막기 위해 `||`를 쓴다
  const resolvedSelfId = selfId || personas[0]?.id;
  const revealedCount = selfCount ?? personas.length;

  const slots = React.useMemo(() => {
    return Array.from({ length: SECTOR_COUNT }, (_, index) => {
      const persona = personas[index];
      if (!persona) return null;
      const shown = index < revealedCount || persona.id === resolvedSelfId;
      return shown ? persona : null;
    });
  }, [personas, revealedCount, resolvedSelfId]);

  // 마우스가 우선, 없으면(제어 모드) 빈 슬롯 → 셀프 순으로 강조 대상을 고른다
  const firstEmptySlotKey = slots.findIndex((slot) => slot === null);
  const activeAvatarId =
    hoveredAvatarId ??
    (firstEmptySlotKey >= 0
      ? selfCurationEmptySlotKey(firstEmptySlotKey)
      : resolvedSelfId);
  const isEmptySlotActive = activeAvatarId?.startsWith("slot:") ?? false;

  const hasMetricData = (metricKey: PersonaMetricKey) =>
    isDataCollected || metricKey === "growth";

  const ringBandCounts = React.useMemo(() => {
    const counts = {} as Record<PersonaMetricKey, number[]>;
    for (const metric of PERSONA_METRICS) {
      counts[metric.key] = getRankBandCounts(
        personas.map((persona) => persona[metric.key]),
      );
    }
    return counts;
  }, [personas]);

  const centerMessage = getCenterMessage(
    hover,
    isDataCollected,
    isEmptySlotActive,
  );
  const isMetricHover = PERSONA_METRICS.some((metric) => metric.key === hover);
  const isAwaitingData =
    isMetricHover && !hasMetricData(hover as PersonaMetricKey);

  return (
    <div
      className={cn("relative size-[500px]", className)}
      onMouseLeave={() => {
        setHoveredAvatarId(null);
        changeHover("default");
      }}
      {...props}
    >
      <svg
        className="absolute inset-0 size-full overflow-visible"
        viewBox={`${-CANVAS_SIZE / 2} ${-CANVAS_SIZE / 2} ${CANVAS_SIZE} ${CANVAS_SIZE}`}
        role="img"
        aria-label="Persona radial analytics"
      >
        {PERSONA_METRICS.map((metric) => {
          const isDimmed = isMetricHover && hover !== metric.key;
          const bandStep =
            (metric.outerRadius - metric.innerRadius) / RING_BAND_COUNT;

          if (hover === metric.key && !hasMetricData(metric.key)) {
            return (
              <path
                key={metric.key}
                className={FADE_IN}
                d={fullAnnulusPath(metric.innerRadius, metric.outerRadius)}
                fillRule="evenodd"
                fill={HIGHLIGHT_BAND_FILL}
              />
            );
          }

          if (!hasMetricData(metric.key)) return null;

          return (
            <g key={metric.key}>
              {slots.map((persona, index) => {
                if (!persona) return null;

                const { startAngle, endAngle } = getSectorGeometry(index);
                const bands = ringBandCounts[metric.key][index];

                return Array.from({ length: bands }, (_, step) => (
                  <path
                    key={`${persona.id}-${step}`}
                    className={COLOR_TRANSITION}
                    d={annulusSectorPath(
                      metric.innerRadius,
                      metric.innerRadius + bandStep * (step + 1),
                      startAngle,
                      endAngle,
                    )}
                    fill={isDimmed ? DIMMED_BAND_FILL : HIGHLIGHT_BAND_FILL}
                  />
                ));
              })}
            </g>
          );
        })}

        <g fill="none" strokeWidth="var(--border-1)" aria-hidden="true">
          {RING_BOUNDARY_RADII.map((radius) => {
            const isHighlighted =
              isAwaitingData &&
              PERSONA_METRICS.some(
                (metric) =>
                  metric.key === hover &&
                  (metric.innerRadius === radius ||
                    metric.outerRadius === radius),
              );

            return (
              <circle
                key={radius}
                className={COLOR_TRANSITION}
                cx="0"
                cy="0"
                r={radius}
                stroke={
                  isHighlighted
                    ? "var(--color-semantic-non-changeable)"
                    : "var(--color-muted)"
                }
              />
            );
          })}
          {/* 8칸 고정이라 지름선 4개 = 스포크 8개 */}
          {Array.from({ length: SECTOR_COUNT / 2 }, (_, index) => {
            const { startAngle } = getSectorGeometry(index);
            const end = polarToCartesian(RING_BOUNDARY_RADII[3], startAngle);
            return (
              <line
                key={startAngle}
                x1={round(-end.x)}
                y1={round(-end.y)}
                x2={round(end.x)}
                y2={round(end.y)}
                stroke="var(--color-muted)"
              />
            );
          })}
        </g>

        <g fill="transparent">
          {PERSONA_METRICS.map((metric) => (
            <path
              key={metric.key}
              d={fullAnnulusPath(metric.innerRadius, metric.outerRadius)}
              fillRule="evenodd"
              onMouseEnter={() => {
                setHoveredAvatarId(null);
                changeHover(metric.key);
              }}
              aria-hidden="true"
            />
          ))}
        </g>
      </svg>

      <SelfCuration
        className="absolute inset-0"
        slots={slots}
        activeSlotId={hover === "self" ? activeAvatarId : null}
        centerMessage={centerMessage}
        onSlotHover={(slotId) => {
          if (slotId) {
            setHoveredAvatarId(slotId);
            changeHover("self");
          } else {
            setHoveredAvatarId(null);
            changeHover("default");
          }
        }}
        onCenterClick={onCenterClick}
      />

      {slots.map((persona, index) => {
        if (!persona) return null;
        if (isMetricHover && !hasMetricData(hover as PersonaMetricKey)) {
          return null;
        }

        const { midAngle } = getSectorGeometry(index);
        const position = polarToCartesian(LABEL_ORBIT_RADIUS, midAngle);
        const anchor = getLabelAnchor(midAngle);
        const isSelf = persona.id === resolvedSelfId;

        const content = isMetricHover
          ? formatMetricValue(
              hover as PersonaMetricKey,
              persona[hover as PersonaMetricKey],
              valueFractionDigits,
            )
          : persona.name;

        // 1등 판정은 링 밴드 칸 수를 재사용(8칸=1등) — 동점이면 둘 다 채워짐
        const isEmphasized = isMetricHover
          ? ringBandCounts[hover as PersonaMetricKey][index] === RING_BAND_COUNT
          : isSelf;

        return (
          <div
            key={persona.id}
            className={cn("absolute", FADE_IN)}
            style={{
              left: `calc(50% + ${round(position.x)}px)`,
              top: `calc(50% + ${round(position.y)}px)`,
              transform: `translate(${anchor.translateX}, ${anchor.translateY})`,
            }}
          >
            <Badge
              variant={isEmphasized ? "default" : "outline"}
              className={cn(
                BADGE_TRANSITION,
                // Figma description: Badge는 표시 전용 — 클릭 가능한 pill은 Chips를 쓴다
                !isEmphasized &&
                  cn(
                    "text-muted-foreground",
                    "shadow-[inset_0_0_0_var(--border-1)_var(--color-muted-foreground)]",
                  ),
              )}
            >
              <span key={content} className={FADE_IN}>
                {content}
              </span>
            </Badge>
          </div>
        );
      })}

      {isAwaitingData && (
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 -translate-y-1/2",
            FADE_IN,
          )}
          style={{ top: `calc(50% + ${NOT_ENOUGH_DATA_OFFSET_Y}px)` }}
        >
          <Badge variant="default" className={BADGE_TRANSITION}>
            Not Enough Data Yet
          </Badge>
        </div>
      )}
    </div>
  );
}
