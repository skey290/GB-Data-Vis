"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

/**
 * Persona Radial Analytics — 셀프 + 8개 페르소나를 3개 지표(동심원 링) × 8개 섹터(각도)로
 * 비교하는 원형 차트.
 *
 * Figma: GB_Design-System-v2.2 (PrsHuyyra9LzqqrDwmrB5P) node 5526:7658
 * 원본은 `Self(1|8) × Posting(true|false) × Hover(5종)` = 15개 variant로 그려져 있고,
 * 이 컴포넌트의 props 축도 그대로 따릅니다.
 *
 * ⚠️ 좌표계 주의: 아래 반지름/각도 상수는 CSS 길이가 아니라 SVG `viewBox` 내부의
 * 기하 좌표값입니다. 그래서 `--spacing-*` / `--scale-*` 토큰을 쓰지 않고 순수 숫자
 * 상수로 둡니다. 반면 컴포넌트 바깥 치수(캔버스, 아바타, 배지)는 토큰을 사용합니다.
 *
 * ⚠️ 다크 전용: Figma 원본이 다크 배경(`--color-background`)에만 그려져 있습니다.
 * 배지/그리드/텍스트는 시맨틱 토큰이라 라이트 테마에서도 자동 대응하지만, 값 밴드만은
 * Figma가 흰색 20%(`--color-rdx-white-4`)를 리터럴로 쓰고 있어 라이트 배경에서는
 * 거의 보이지 않습니다.
 * Figma에 라이트 variant가 생기기 전까지는 원본 값을 그대로 따릅니다.
 */

/** 캔버스 크기 (Figma 컴포넌트 프레임 500×500) */
const CANVAS_SIZE = 500;
/** 링 경계 반지름 — Figma 실측 127.775/159.781/199.539/249.549의 의도값 */
const RING_BOUNDARY_RADII = [128, 160, 200, 250] as const;
/** 링 하나를 채우는 밴드 단계 수 (Figma 원본이 링당 정확히 8겹) */
const RING_BAND_COUNT = 8;
/** 아바타 중심이 놓이는 궤도 반지름 (Figma 실측 ≈97) */
const AVATAR_ORBIT_RADIUS = 97;
/** 배지의 원을 향한 모서리가 놓이는 궤도 반지름 (Figma 실측 258.9~272.3의 중앙값) */
const LABEL_ORBIT_RADIUS = 265;
/**
 * "Not Enough Data Yet" 배지의 중심 y 오프셋.
 * Figma 실측 top 516 / 높이 20 → 중심 526, 프레임 중심(250) 기준 +276.
 */
const NOT_ENOUGH_DATA_OFFSET_Y = 276;
/** 섹터 1개의 각도 (360 / 8) */
const SECTOR_ANGLE = 45;
/**
 * 첫 섹터의 시작 각도. SVG 좌표계는 3시 방향이 0°, 시계방향이 +이므로
 * -90°(12시)에서 시작해야 맨 위 스포크가 정확히 수직이 됩니다.
 */
const FIRST_SECTOR_START_ANGLE = -90;

/**
 * hover 전환 공통 설정.
 *
 * 이 프로젝트의 다른 컴포넌트는 duration 없는 `transition-colors`(Tailwind 기본 150ms)를
 * 쓰지만, 그건 버튼처럼 작은 요소 기준입니다. 지름 500px 차트는 hover 한 번에 색이
 * 바뀌는 면적이 훨씬 넓어 150ms면 여전히 툭 끊겨 보여, 한 단계 위인 200ms로 잡았습니다.
 * 속도를 조절하려면 아래 `MOTION_DURATION` 하나만 바꾸면 차트 전체에 반영됩니다.
 *
 * 모든 전환에 `motion-reduce:` 변형을 달아, OS에서 "동작 줄이기"를 켠 사용자에게는
 * 전환 없이 즉시 바뀌게 합니다.
 */
const MOTION_DURATION = "duration-200 ease-out";
/**
 * 색 전환. Tailwind v4의 `transition-colors`가 다루는 속성 목록에는 `fill`/`stroke`/
 * `outline-color`도 포함되어 있어, SVG 밴드·그리드와 outline 링에 그대로 씁니다.
 */
const COLOR_TRANSITION = `transition-colors ${MOTION_DURATION} motion-reduce:transition-none`;
/** 블러·딤처럼 색이 아닌 속성의 전환 (아바타 강조) */
const EFFECT_TRANSITION = `transition-[filter,opacity] ${MOTION_DURATION} motion-reduce:transition-none`;
/** Badge는 배경·글자색·보더(inset shadow)가 한꺼번에 바뀌므로 box-shadow까지 포함합니다 */
const BADGE_TRANSITION = `transition-[color,background-color,box-shadow] ${MOTION_DURATION} motion-reduce:transition-none`;
/**
 * 요소가 새로 나타나거나 내용이 교체될 때의 페이드인 (tw-animate-css).
 * `animate-in`은 duration을 `--tw-duration`에서 읽으므로 `MOTION_DURATION`이 그대로 먹습니다.
 */
const FADE_IN = `animate-in fade-in ${MOTION_DURATION} motion-reduce:animate-none`;
/**
 * 40px 원(아바타/빈 슬롯)의 강조 링.
 *
 * border가 아니라 outline을 쓰는 이유:
 * 1. outline은 레이아웃을 차지하지 않아 원이 40px 그대로 유지됩니다. border는
 *    box-sizing 때문에 강조될 때 안쪽 이미지를 36px로 줄여 툭 찌그러졌습니다.
 * 2. `outline-color`는 애니메이션 가능해 링이 서서히 나타납니다. border는 폭(0→2px)이
 *    바뀌는 형태라 부드럽게 만들 수 없습니다.
 * 3. outline은 border보다 위에 그려지고 `-outline-offset-2`가 빈 슬롯의 1px dashed
 *    보더를 완전히 덮습니다 — `border-style: dashed↔solid`는 CSS가 보간할 수 없는 값이라
 *    이 방식으로 우회합니다.
 */
const HIGHLIGHT_RING =
  "outline-solid outline-[length:var(--border-width-2)] -outline-offset-2";
const HIGHLIGHT_RING_ON =
  "outline-[color:var(--color-semantic-non-changeable)]";
const HIGHLIGHT_RING_OFF = "outline-transparent";

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

/**
 * Figma mock에 적혀 있는 샘플 데이터. 배열 순서가 곧 섹터 배치 순서입니다
 * (12시에서 시작해 시계방향).
 */
export const DEFAULT_PERSONAS: PersonaDatum[] = [
  {
    id: "data-scientist",
    name: "Data Scientist",
    initials: "DS",
    growth: 80,
    reach: 8340,
    engagement: 14.3,
  },
  {
    id: "yoga-meditator",
    name: "Yoga Meditator",
    initials: "YM",
    growth: 10,
    reach: 6453,
    engagement: 1.8,
  },
  {
    id: "novelist",
    name: "Novelist",
    initials: "NV",
    growth: 40,
    reach: 4784,
    engagement: 0.4,
  },
  {
    id: "entrepreneur",
    name: "Entrepreneur",
    initials: "EN",
    growth: 70,
    reach: 978,
    engagement: 2.0,
  },
  {
    id: "fashionista",
    name: "Fashionista",
    initials: "FA",
    growth: 60,
    reach: 6782,
    engagement: 0.3,
  },
  {
    id: "fashion-editor",
    name: "Fashion Editor",
    initials: "FE",
    growth: 20,
    reach: 125,
    engagement: 3.7,
  },
  {
    id: "team-leader",
    name: "Team Leader",
    initials: "TL",
    growth: 50,
    reach: 8006,
    engagement: 0.5,
  },
  {
    id: "vegan-chef",
    name: "Vegan Chef",
    initials: "VC",
    growth: 30,
    reach: 5431,
    engagement: 1.9,
  },
];

/**
 * Figma `Hover` variant.
 * - `default` — 배지에 페르소나 이름, 3개 링 모두 흰 밴드
 * - 지표 3종 — 해당 링만 흰 밴드, 나머지 2링은 검은 밴드로 가라앉고,
 *   배지 8개가 그 지표의 **값**으로 전환됩니다
 * - `self` — 셀프 아바타가 blur + 링으로 강조됩니다
 */
export type PersonaRadialChartHover = "default" | PersonaMetricKey | "self";

/** 빈 아바타 슬롯에 표시되는 플레이스홀더 문구 */
const PLACEHOLDER_LABEL = "No Self";

/** Hover × Posting 조합별 중앙 1줄 문구 (Figma 원본 그대로) */
function getCenterMessage(
  hover: PersonaRadialChartHover,
  posting: boolean,
  isEmptySlotActive: boolean,
) {
  if (hover === "self") {
    /*
     * 기준은 `selfCount`가 아니라 **지금 강조된 대상**입니다.
     * 이미 만들어진 아바타에 올렸으면 그 셀프로 작업하러 가는 것이고("Go to
     * Content Studio"), 비어 있는 슬롯에 올렸을 때만 새로 만들라는 안내입니다
     * ("Create a Self").
     *
     * selfCount로 판단하면 셀프가 1명 있는 상태에서 **그 셀프에 올려도**
     * "Create a Self"가 떠서, 이미 있는 걸 또 만들라고 말하게 됩니다.
     * Figma의 `Self=1 / Hover=self` variant도 셀프가 아니라 빈 슬롯(섹터 2)이
     * 강조된 스냅샷이라, 이 규칙이 원본과도 일치합니다.
     */
    return isEmptySlotActive ? "Create a Self" : "Go to Content Studio";
  }
  if (hover === "default") {
    return "Hover to see analysis";
  }
  if (hover === "growth") {
    return "Growth Potential";
  }
  // reach / engagement 는 게시물이 있어야 산출됩니다
  if (!posting) {
    return "Create Posts to analyze";
  }
  return hover === "reach" ? "Qualified Reach" : "Engagement Intensity";
}

/** 각도(도)를 중심 기준 직교 좌표로 변환 */
function polarToCartesian(radius: number, angleInDegrees: number) {
  const radians = (angleInDegrees * Math.PI) / 180;
  return {
    x: radius * Math.cos(radians),
    y: radius * Math.sin(radians),
  };
}

/** SVG path 좌표의 소수점 자릿수를 제한해 마크업이 불필요하게 길어지지 않게 합니다 */
function round(value: number) {
  return Number(value.toFixed(3));
}

/**
 * 도넛 조각(annulus sector) path.
 * 섹터 각도가 45°(<180°)로 고정이라 large-arc-flag는 항상 0입니다.
 */
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

/** 링 전체(360°) 도넛 path. `fill-rule="evenodd"`로 안쪽을 뚫습니다 */
function fullAnnulusPath(innerRadius: number, outerRadius: number) {
  const ring = (r: number) =>
    `M ${r} 0 A ${r} ${r} 0 1 1 ${-r} 0 A ${r} ${r} 0 1 1 ${r} 0 Z`;
  return `${ring(outerRadius)} ${ring(innerRadius)}`;
}

/** 툴팁이 아니라 배지에 직접 노출되는 값이라, 지표별 표기를 그대로 씁니다 */
function formatMetricValue(metricKey: PersonaMetricKey, value: number) {
  if (metricKey === "reach") {
    return value.toLocaleString("en-US");
  }
  return `${value}%`;
}

function getSectorGeometry(index: number) {
  const startAngle = FIRST_SECTOR_START_ANGLE + SECTOR_ANGLE * index;
  return {
    startAngle,
    endAngle: startAngle + SECTOR_ANGLE,
    midAngle: startAngle + SECTOR_ANGLE / 2,
  };
}

/**
 * 배지를 원 바깥에 붙이기 위한 정렬 기준 (Figma 실측 좌표에서 역산).
 * - 좌/우 4개(±22.5°, ±157.5°): 가로만 모서리 정렬하고 **세로는 중앙 정렬**
 * - 모서리 4개(±67.5°, ±112.5°): 가로·세로 모두 모서리 정렬
 */
function getLabelAnchor(midAngle: number) {
  const { x, y } = polarToCartesian(1, midAngle);
  const isCornerSector = Math.abs(y) > 0.7;

  return {
    translateX: x > 0 ? "0%" : "-100%",
    translateY: isCornerSector ? (y > 0 ? "0%" : "-100%") : "-50%",
  };
}

/**
 * 밴드 칸 수 = 그 링 안에서의 **순위**. 1등이 8칸, 꼴등이 1칸이 되도록 균등 배분합니다.
 *
 * 값 비율(1등 대비 몇 %)로 칠해봤더니 두 가지 문제가 있었습니다 (2026-09-10 사용자 확정):
 * 1. 값이 비슷하면 같은 칸으로 뭉개져 구분이 안 됨 — Reach의 8,340과 8,006이 둘 다 8칸
 * 2. 한 명이 압도적이면 나머지가 전부 바닥에 깔림 — Engagement의 14.3 vs 0.3~3.7
 * 순위로 칠하면 분포와 무관하게 8명이 항상 구분됩니다. 대신 "얼마나 차이나는지"는
 * 표현되지 않으므로, 정확한 값은 링을 hover했을 때 배지에서 확인합니다.
 *
 * 동점은 같은 순위 = 같은 칸을 받고, 값이 0 이하면 "데이터 없음"으로 보아 0칸입니다.
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
  /** 8개 페르소나 데이터. 배열 순서가 12시부터 시계방향 섹터 순서가 됩니다 */
  personas?: PersonaDatum[];
  /** Figma `Self` variant — 셀프 1명만 만들어진 상태인지, 8명 전부인지 */
  selfCount?: 1 | 8;
  /** Figma `Posting` variant — 게시물이 있어야 Reach/Engagement가 산출됩니다 */
  posting?: boolean;
  /**
   * Figma `Hover` variant. 값을 주면 제어 컴포넌트로 동작해 마우스와 무관하게 고정됩니다
   * (Storybook에서 variant를 재현할 때 사용). 주지 않으면 실제 마우스 hover를 따릅니다.
   */
  hover?: PersonaRadialChartHover;
  /** hover 상태가 바뀔 때 호출됩니다 */
  onHoverChange?: (hover: PersonaRadialChartHover) => void;
  /** 셀프로 취급할 페르소나 id. 기본값은 첫 번째 페르소나 */
  selfId?: string;
  /**
   * 중앙 문구 클릭 핸들러. Figma에는 Button 인스턴스가 없고 텍스트 1줄뿐이라
   * 버튼으로 만들지 않았지만, "Create a Self" 같은 CTA 성격의 문구를 위해 열어둡니다.
   */
  onCenterClick?: () => void;
  /** 바깥 배지 클릭 핸들러. 전달하지 않으면 배지는 표시 전용입니다 */
  onPersonaSelect?: (personaId: string) => void;
}

/**
 * 셀프와 8개 페르소나를 3개 지표로 비교하는 원형 데이터 시각화.
 *
 * - 각도: 8개 섹터 = 8명의 페르소나 (12시 스포크가 정확히 수직)
 * - 반지름: 3개 링 = Growth Potential / Qualified Reach / Engagement Intensity
 * - 값: 링 안쪽 경계를 공유하는 밴드를 겹쳐 쌓아, 안쪽일수록 밝아지는 8단계로 표현
 */
export function PersonaRadialChart({
  personas = DEFAULT_PERSONAS,
  selfCount = 8,
  posting = true,
  hover: controlledHover,
  onHoverChange,
  selfId,
  onCenterClick,
  onPersonaSelect,
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

  /*
   * `??`가 아니라 `||`입니다. `selfId=""`처럼 빈 문자열이 들어오면 `??`는 그대로
   * 통과시켜 어떤 페르소나와도 일치하지 않는 셀프 id가 되고, `selfCount=1`에서
   * 8칸 전부 빈 슬롯이 되어 셀프가 통째로 사라집니다.
   */
  const resolvedSelfId = selfId || personas[0]?.id;

  /** 아바타/값이 실제로 노출되는 페르소나인지 (Figma `Self` variant) */
  const isRevealed = (persona: PersonaDatum) =>
    selfCount === 8 || persona.id === resolvedSelfId;

  /**
   * 강조할 아바타. 마우스로 올린 것이 언제나 우선입니다.
   *
   * 마우스 정보가 없는 제어 모드(Storybook에서 `hover="self"`만 지정)에서는
   * Figma variant를 그대로 재현하도록, 빈 슬롯이 있으면 **첫 빈 슬롯**을,
   * 없으면 셀프를 강조합니다. Figma의 `Self=1 / Hover=self`가 셀프가 아니라
   * 빈 슬롯이 강조된 스냅샷이기 때문입니다.
   */
  const firstEmptySlotId = personas.find((persona) => !isRevealed(persona))?.id;
  const activeAvatarId = hoveredAvatarId ?? firstEmptySlotId ?? resolvedSelfId;
  /** 지금 강조된 대상이 빈 슬롯인지 — 중앙 문구를 가르는 기준입니다 */
  const isEmptySlotActive = personas.some(
    (persona) => persona.id === activeAvatarId && !isRevealed(persona),
  );

  /** 게시물이 없으면 Growth만 산출됩니다 */
  const hasMetricData = (metricKey: PersonaMetricKey) =>
    posting || metricKey === "growth";

  /**
   * 링별 밴드 칸 수(페르소나 순서 그대로). 표시 대상(`selfCount`)과 무관하게 전체
   * 데이터로 순위를 매겨, 셀프 1명만 보이는 상태에서도 척도가 흔들리지 않게 합니다.
   */
  const ringBandCounts = React.useMemo(() => {
    const counts = {} as Record<PersonaMetricKey, number[]>;
    for (const metric of PERSONA_METRICS) {
      counts[metric.key] = getRankBandCounts(
        personas.map((persona) => persona[metric.key]),
      );
    }
    return counts;
  }, [personas]);

  const centerMessage = getCenterMessage(hover, posting, isEmptySlotActive);
  const isMetricHover = PERSONA_METRICS.some((metric) => metric.key === hover);
  /** 데이터가 없는 지표를 보려는 상태 — 링을 균일하게 채우고 안내 배지를 띄웁니다 */
  const isAwaitingData =
    isMetricHover && !hasMetricData(hover as PersonaMetricKey);

  return (
    <div
      className={cn(
        // Figma 컴포넌트 프레임 500×500. 배지는 이 밖으로 넘쳐 배치됩니다
        "relative size-[calc(var(--scale-500)*1px)]",
        className,
      )}
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
        {/* 값 밴드 — 링 안쪽 경계를 공유하는 도넛 조각을 겹쳐 쌓습니다 */}
        {PERSONA_METRICS.map((metric) => {
          const isDimmed = isMetricHover && hover !== metric.key;
          const bandStep =
            (metric.outerRadius - metric.innerRadius) / RING_BAND_COUNT;

          // 데이터가 없는 링을 hover 중이면 링 전체를 균일한 한 겹으로 채웁니다
          if (hover === metric.key && !hasMetricData(metric.key)) {
            return (
              <path
                key={metric.key}
                // 8겹 밴드를 대체하며 새로 mount되는 path라 색 전환이 아닌 페이드인입니다
                className={FADE_IN}
                d={fullAnnulusPath(metric.innerRadius, metric.outerRadius)}
                fillRule="evenodd"
                fill="var(--color-rdx-white-4)"
              />
            );
          }

          if (!hasMetricData(metric.key)) return null;

          return (
            <g key={metric.key}>
              {personas.map((persona, index) => {
                if (!isRevealed(persona)) return null;

                const { startAngle, endAngle } = getSectorGeometry(index);
                const bands = ringBandCounts[metric.key][index];

                return Array.from({ length: bands }, (_, step) => (
                  <path
                    key={`${persona.id}-${step}`}
                    // hover가 바뀌어도 이 path들은 그대로 남고 fill만 교체되므로,
                    // 흰↔검정이 200ms에 걸쳐 이어집니다 (차트에서 가장 넓은 면적)
                    className={COLOR_TRANSITION}
                    d={annulusSectorPath(
                      metric.innerRadius,
                      metric.innerRadius + bandStep * (step + 1),
                      startAngle,
                      endAngle,
                    )}
                    // 겹칠수록 안쪽이 밝아집니다. 강조되지 않은 링은 흰색 대신
                    // 검은 밴드를 써서 배경보다 어둡게 가라앉힙니다 (Figma 원본 방식)
                    fill={
                      isDimmed
                        ? "var(--color-rdx-black-4)"
                        : "var(--color-rdx-white-4)"
                    }
                  />
                ));
              })}
            </g>
          );
        })}

        {/* 그리드 — 동심원 4개 + 스포크 4개(지름선), 모두 동일 색상 */}
        <g fill="none" strokeWidth="var(--stroke-width-1)" aria-hidden="true">
          {RING_BOUNDARY_RADII.map((radius) => {
            // 데이터 없는 링을 hover 중이면 그 링의 두 경계원만 흰색으로 강조됩니다
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
          {[0, 1, 2, 3].map((index) => {
            const angle = FIRST_SECTOR_START_ANGLE + SECTOR_ANGLE * index;
            const end = polarToCartesian(RING_BOUNDARY_RADII[3], angle);
            return (
              <line
                key={angle}
                x1={round(-end.x)}
                y1={round(-end.y)}
                x2={round(end.x)}
                y2={round(end.y)}
                stroke="var(--color-muted)"
              />
            );
          })}
        </g>

        {/* 링별 hover 판정 영역 — 데이터가 없는 링도 hover는 되어야 합니다 */}
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

      {/* 아바타 8개 */}
      {personas.map((persona, index) => {
        const { midAngle } = getSectorGeometry(index);
        const position = polarToCartesian(AVATAR_ORBIT_RADIUS, midAngle);
        const revealed = isRevealed(persona);
        // 마우스를 올린 아바타만 강조됩니다. Figma variant는 셀프 1개만 강조된
        // 스냅샷이지만, 실제 인터랙션은 hover한 대상이 활성화되는 것입니다.
        const isActive = hover === "self" && persona.id === activeAvatarId;

        return (
          <div
            key={persona.id}
            className="absolute"
            style={{
              left: `calc(50% + ${round(position.x)}px)`,
              top: `calc(50% + ${round(position.y)}px)`,
              transform: "translate(-50%, -50%)",
            }}
            onMouseEnter={() => {
              setHoveredAvatarId(persona.id);
              changeHover("self");
            }}
            /*
             * 아바타를 벗어나면 즉시 기본 상태로 돌아갑니다. 루트의 onMouseLeave만
             * 있으면 차트 **바깥으로 완전히 나갈 때만** 복원되어, 아바타에서 중앙
             * 빈 공간으로 마우스를 옮겼을 때 "Go to Content Studio"가 그대로
             * 남아 있었습니다.
             *
             * 아바타 → 링으로 나가는 경우에도 leave(default) → enter(지표) 순으로
             * 이벤트가 발생하므로 링 강조가 덮어씁니다. 아바타끼리는 서로 떨어져
             * 있어 사이 공간을 반드시 지나가고, 그때 기본 상태가 되는 게 맞습니다.
             */
            onMouseLeave={() => {
              setHoveredAvatarId(null);
              changeHover("default");
            }}
          >
            {revealed ? (
              /*
               * Figma의 강조는 "흰 2px 안쪽 링 + 블러 + 검정 50% 딤"입니다.
               * 밝아지는 게 아니라 어두워지고, 링이 안쪽이라 크기는 40px로 유지됩니다.
               * 세 가지가 각각 전환되도록 링/블러/딤을 항상 렌더하고 값만 바꿉니다.
               */
              <div
                className={cn(
                  "relative overflow-hidden",
                  "size-[calc(var(--scale-40)*1px)]",
                  "rounded-[var(--radius-scale-full)]",
                  HIGHLIGHT_RING,
                  COLOR_TRANSITION,
                  isActive ? HIGHLIGHT_RING_ON : HIGHLIGHT_RING_OFF,
                )}
              >
                <Avatar
                  variant="image"
                  src={persona.imageSrc}
                  initials={persona.initials}
                  alt={persona.name}
                  className={cn(
                    "size-full",
                    EFFECT_TRANSITION,
                    // Figma Effect는 FOREGROUND_BLUR radius 8이고, codegen이 CSS
                    // blur(4px)로 환산합니다 — --blur-8(8px)이 아니라 --blur-sm(4px).
                    // 비활성일 때 filter를 없애는 대신 --blur-none(blur(0px))을 두어야
                    // 브라우저가 두 상태를 보간할 수 있습니다.
                    isActive
                      ? "[filter:var(--blur-sm)]"
                      : "[filter:var(--blur-none)]",
                  )}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-0",
                    "rounded-[var(--radius-scale-full)]",
                    "bg-[var(--color-rdx-black-7)]",
                    EFFECT_TRANSITION,
                    isActive ? "opacity-100" : "opacity-0",
                  )}
                />
              </div>
            ) : (
              /*
               * 빈 슬롯 — Figma는 dashed 원 + 8px "No Self" 텍스트로, Avatar의
               * initial/icon variant와 형태가 달라 차트 전용 마크업을 씁니다.
               */
              <div
                role="img"
                aria-label={PLACEHOLDER_LABEL}
                className={cn(
                  "flex items-center justify-center",
                  "size-[calc(var(--scale-40)*1px)]",
                  "rounded-[var(--radius-scale-full)]",
                  "text-xxs-medium text-muted-foreground",
                  // dashed 보더는 두 상태 모두 유지하고, 강조는 그 위를 덮는 링으로
                  // 처리합니다 (HIGHLIGHT_RING 주석 3번 참고)
                  "border-[length:var(--border-width-default)] border-dashed",
                  "border-[color:var(--color-muted-foreground)]",
                  HIGHLIGHT_RING,
                  COLOR_TRANSITION,
                  isActive
                    ? cn(
                        HIGHLIGHT_RING_ON,
                        // Figma는 검정 20%(--color-background-transparent)라
                        // 다크 배경에서 오히려 더 어두워집니다
                        "bg-[var(--color-background-transparent)]",
                      )
                    : cn(HIGHLIGHT_RING_OFF, "bg-transparent"),
                )}
              >
                <span aria-hidden="true">{PLACEHOLDER_LABEL}</span>
              </div>
            )}
          </div>
        );
      })}

      {/*
        바깥 배지 — 만들어진 셀프 수만큼만 렌더링됩니다. 빈 슬롯에는 배지가 없고,
        지표를 hover했는데 그 지표를 산출할 수 없으면(게시물 없음) 배지가 아예
        사라집니다(이름으로 되돌아가지 않습니다).
      */}
      {personas.map((persona, index) => {
        if (!isRevealed(persona)) return null;
        if (isMetricHover && !hasMetricData(hover as PersonaMetricKey)) {
          return null;
        }

        const { midAngle } = getSectorGeometry(index);
        const position = polarToCartesian(LABEL_ORBIT_RADIUS, midAngle);
        const anchor = getLabelAnchor(midAngle);
        const isSelf = persona.id === resolvedSelfId;

        /* 지표 hover 중이면 같은 자리에서 텍스트만 값으로 교체됩니다 */
        const content = isMetricHover
          ? formatMetricValue(
              hover as PersonaMetricKey,
              persona[hover as PersonaMetricKey],
            )
          : persona.name;

        /*
         * 채워진(default) 배지가 "지금 기준이 되는 대상"을 가리킵니다.
         * - 배지가 **이름**을 보여줄 때 → 이 페이지에서 설정된 셀프
         * - 배지가 **값**을 보여줄 때(지표 hover) → 그 지표의 1등
         *
         * 1등 판정에 값을 다시 비교하지 않고 링 채움에 쓴 밴드 칸 수를 그대로
         * 재사용합니다(8칸 = 1등). 링에서 가장 길게 찬 섹터와 채워진 배지가
         * 항상 같은 페르소나를 가리키게 되고, 동점이면 둘 다 8칸이라 배지도
         * 둘 다 채워집니다.
         */
        const isEmphasized = isMetricHover
          ? ringBandCounts[hover as PersonaMetricKey][index] === RING_BAND_COUNT
          : isSelf;

        return (
          <div
            key={persona.id}
            // 배지가 통째로 사라졌다 나타나는 전환(게시물 없는 지표 hover)에서의 페이드
            className={cn("absolute", FADE_IN)}
            style={{
              left: `calc(50% + ${round(position.x)}px)`,
              top: `calc(50% + ${round(position.y)}px)`,
              transform: `translate(${anchor.translateX}, ${anchor.translateY})`,
            }}
          >
            <Badge
              variant={isEmphasized ? "default" : "outline"}
              onClick={
                onPersonaSelect ? () => onPersonaSelect(persona.id) : undefined
              }
              className={cn(
                BADGE_TRANSITION,
                onPersonaSelect && "cursor-pointer",
                // Figma의 비선택 배지는 Badge outline 기본값(--color-border 보더 /
                // foreground 텍스트)이 아니라 보더·텍스트 모두 muted-foreground입니다
                !isEmphasized &&
                  cn(
                    "text-muted-foreground",
                    "shadow-[inset_0_0_0_var(--border-width-default)_var(--color-muted-foreground)]",
                  ),
              )}
            >
              {/*
               * 이름 ↔ 값 교체는 텍스트 내용만 바뀌는 거라 transition이 걸리지 않습니다.
               * key를 내용으로 두면 바뀔 때마다 remount되어 새 텍스트가 페이드인합니다
               * (shadcn이 쓰는 tw-animate-css의 animate-in 방식).
               */}
              <span key={content} className={FADE_IN}>
                {content}
              </span>
            </Badge>
          </div>
        );
      })}

      {/* 중앙 안내 문구 — Figma에는 버튼 없이 1줄 텍스트만 있습니다 */}
      <p
        // 배지와 같은 방식 — 문구가 바뀔 때마다 remount되어 페이드인합니다
        key={centerMessage}
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "whitespace-nowrap text-center",
          "text-xs-bold text-foreground",
          FADE_IN,
          onCenterClick && "cursor-pointer",
        )}
        onClick={onCenterClick}
      >
        {centerMessage}
      </p>

      {/*
        하단 안내 배지 — Reach/Engagement를 hover했는데 게시물이 없어 산출할 수
        없을 때만, default 상태로 뜹니다.

        예전에는 게시물이 없으면 hover와 무관하게 항상 떠 있다가 해당 지표를
        hover할 때만 활성으로 바뀌는 2단 구성이었습니다. 그 비활성(회색) 상태는
        Figma에서 삭제되어, 지금은 "뜨거나 / 아예 없거나" 둘 뿐입니다.
      */}
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
