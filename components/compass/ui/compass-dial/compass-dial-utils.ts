import type {
  CompassDialTickDirection,
  CompassDialTickSize,
  CompassDialTickTextArrangement,
  CompassDialTickType,
} from "@/components/compass/ui/compass-dial-tick";

/**
 * `CompassDial`(Figma "Dial", ❄️ GB_Compass node 8003:8878)의 순수 계산 로직.
 *
 * 렌더링(각도 배치·회전·CSS)은 `compass-dial.tsx`가 담당하고, 이 파일은 버킷팅·
 * 그라데이션·랭킹처럼 입력값 → 출력값이 결정적인 계산만 모아 유닛 테스트가
 * 쉽도록 분리했습니다.
 */

/** 원형 전체 눈금 수 (Figma 원본이 4.5° 간격 80개 고정) */
export const TICK_COUNT = 80;
/** 눈금 8개마다 하나씩 오는 "앵커"(실데이터가 붙는 자리) 수 */
export const ANCHOR_COUNT = 8;
/** 눈금 1개당 각도 간격 */
export const TICK_STEP_DEGREES = 360 / TICK_COUNT;
/** 앵커 사이 눈금 간격(tick-step 단위). 360/8 = 45° = 10 tick-step */
export const ANCHOR_TICK_STEP = TICK_COUNT / ANCHOR_COUNT;

/**
 * `CompassDialTick` 박스 자체의 고정 치수(px). 컴포넌트 원자 쪽 상수(h-[117px])와
 * 동일해야 하므로 여기서도 기하 상수로 고정합니다(토큰 아님 — SVG/레이아웃 실측
 * 좌표라 `--spacing-*`와 매칭되지 않음, 기존 `reference_svg_geometry_not_tokens`
 * 판단 기준과 동일).
 */
export const TICK_BOX_HEIGHT = 117;

/**
 * 두 링의 "고정 기준 반지름"(px, 800×800 캔버스·중심 (400,400) 기준).
 *
 * outward(Reach) = 328, inward(Engagement) = 311. Figma
 * 스크린샷을 800×800(또는 오버플로 포함 1063×1063 — get_screenshot의
 * `original_width`로 스케일 보정) 픽셀 단위로 직접 실측해 확정했습니다.
 *
 * - outward: 북쪽(rank1, size5) 눈금의 안쪽 끝(중심에 더 가까운 쪽)이 정확히
 *   반지름 328에서 시작하고, 바깥쪽 끝(크기에 따라 자라는 쪽)이 328+80=408에서
 *   끝남을 확인(`CompassDialTick`의 `direction="outward"`는 박스 **아래쪽**이
 *   이 328px 앵커).
 * - inward: `tick_inward` 프레임 자체의 바운딩 박스가 622×622(반지름 311)로
 *   정확히 중심에 맞춰져 있고, 북쪽 눈금의 라벨 오프셋(-48px, 원자 컴포넌트의
 *   `getInwardLabelOffset`과 동일)이 정확히 이 311 지점을 기준으로 계산됨을
 *   확인(`direction="inward"`는 박스 **위쪽**이 이 311px 앵커).
 */
export const OUTWARD_ANCHOR_RADIUS = 328;
export const INWARD_ANCHOR_RADIUS = 311;

/** 캔버스 크기(px) — Figma "Dial" 컴포넌트 프레임 800×800 고정 */
export const CANVAS_SIZE = 800;

export interface CompassDialSelf {
  id: string;
  qualifiedReach: number;
  /** 퍼센트 값. 예: 14.3 */
  engagementIntensity: number;
}

export type CompassDialType = "reach" | "engagement" | "reach-and-engagement";

export interface CompassDialTickCoachmark {
  title: string;
  description?: string;
  onDismiss?: () => void;
}

export interface CompassDialTickPlan {
  /** 0(북쪽)부터 시계방향 각도(도) */
  angle: number;
  type: CompassDialTickType;
  muted: boolean;
  size: CompassDialTickSize;
  textArrangement: CompassDialTickTextArrangement;
  label?: string;
  coachmark?: CompassDialTickCoachmark;
}

/** 눈금 크기(1~5) clamp */
function clampSize(value: number): CompassDialTickSize {
  return Math.min(5, Math.max(1, value)) as CompassDialTickSize;
}

/** 80개 눈금의 각도 배열: [0, 4.5, 9, ..., 355.5] */
export function buildTickAngles(): number[] {
  return Array.from({ length: TICK_COUNT }, (_, i) => i * TICK_STEP_DEGREES);
}

/** 슬롯(0~7) → 눈금 인덱스(0,10,20,...,70) */
export function slotToTickIndex(slot: number): number {
  return slot * ANCHOR_TICK_STEP;
}

/**
 * 각도(0~360, 북쪽=0·시계방향) → `textArrangement`.
 *
 * `CompassDialTick`은 라벨을 4가지 고정 회전값(cross/parallel/parallel-reverse/
 * cross-reverse)으로만 되돌릴 수 있는데, 조립 컴포넌트가 눈금 전체를 각도만큼
 * 통째로 회전시키므로 라벨이 최종적으로 똑바로 보이려면 "각도 + 원자의 내부
 * 회전값 ≡ 0(mod 360)"이 되는 arrangement를 90° 구간별로 골라야 합니다(대각선
 * 앵커에서는 완전한 상쇄가 불가능해 최대 45° 기울어짐 — Figma 원본도 동일하게
 * 기울어져 있음, 스크린샷 확대 대조로 확인).
 *
 * outward/inward는 `cross`↔`cross-reverse`의 내부 회전값이 서로 뒤바뀌어 있어
 * (outward: cross=0/cross-reverse=180, inward: cross=180/cross-reverse=0),
 * 북쪽·남쪽 구간에서 두 방향이 반대 arrangement를 씁니다. 동쪽·서쪽 구간의
 * parallel/parallel-reverse는 두 방향이 동일합니다. 대각선 경계(45/135/225/315°)
 * 타이는 상위(시계방향 다음) 구간으로 귀속됩니다 — 실제 엔게이지먼트 링
 * 북동쪽(45°) 라벨의 기울어진 방향을 스크린샷에서 대조해 확정.
 */
export function getTextArrangement(
  angle: number,
  direction: CompassDialTickDirection,
): CompassDialTickTextArrangement {
  const normalized = ((angle % 360) + 360) % 360;

  if (normalized >= 45 && normalized < 135) return "parallel";
  if (normalized >= 225 && normalized < 315) return "parallel-reverse";

  const isNorthQuadrant = normalized < 45 || normalized >= 315;
  if (direction === "outward") {
    return isNorthQuadrant ? "cross" : "cross-reverse";
  }
  return isNorthQuadrant ? "cross-reverse" : "cross";
}

/**
 * Rule D — 순위(0-based, 0=1등) → 눈금 크기(1~5).
 *
 * `size = round(5 - (rankIndex / (n-1)) * 4)`. n<=1(비교 대상 없음)이면
 * 5(가장 큰 크기, 유일한 값이므로 최대로 표시 — Figma "Self number=1,
 * Data Collected=true" 실측: 북쪽 눈금이 size5로 렌더링됨, 확인).
 */
export function getBucketSize(
  rankIndex: number,
  n: number,
): CompassDialTickSize {
  if (n <= 1) return 5;
  const raw = 5 - (rankIndex / (n - 1)) * 4;
  return clampSize(Math.round(raw));
}

/**
 * 값 배열을 내림차순 기준으로 순위(0-based) 매깁니다. 동점은 원래 배열 순서가
 * 빠른 쪽이 더 높은 순위를 받습니다(안정 정렬).
 */
export function rankDescending(values: number[]): number[] {
  const order = values
    .map((_, index) => index)
    .sort((a, b) => values[b] - values[a] || a - b);
  const ranks = new Array<number>(values.length);
  order.forEach((originalIndex, rank) => {
    ranks[originalIndex] = rank;
  });
  return ranks;
}

export interface FilledAnchor {
  /** 0~79 */
  tickIndex: number;
  size: CompassDialTickSize;
}

/**
 * Rule E — 앵커 사이 장식용 눈금의 크기.
 *
 * 각 눈금 위치에서 "모든 앵커로부터 시계방향 거리 기준 max(anchor.size - 거리, 1)"의
 * 최댓값을 취합니다. 앵커가 1개뿐이면(N=1) 원형 전체를 한 바퀴(80 tick-step) 감아
 * 자기 자신에게서 멀어졌다 다시 가까워지는 대칭 그라데이션이 되고, 앵커가
 * 8개 미만으로 듬성듬성 채워졌을 때도 "가장 가까운 두 앵커"를 명시적으로 찾을
 * 필요 없이 모든 앵커의 기여도 중 최댓값을 취하는 것만으로 자동으로 올바른
 * 결과가 나옵니다(먼 앵커의 기여는 거리항 때문에 항상 더 작으므로).
 */
export function computeSizesForTicks(
  anchors: FilledAnchor[],
  totalTicks: number = TICK_COUNT,
): CompassDialTickSize[] {
  if (anchors.length === 0) {
    return Array<CompassDialTickSize>(totalTicks).fill(1);
  }

  const sizes: CompassDialTickSize[] = new Array(totalTicks);
  for (let pos = 0; pos < totalTicks; pos++) {
    let best = 1;
    for (const anchor of anchors) {
      const forwardDistance =
        (((pos - anchor.tickIndex) % totalTicks) + totalTicks) % totalTicks;
      const backwardDistance =
        (((anchor.tickIndex - pos) % totalTicks) + totalTicks) % totalTicks;
      best = Math.max(
        best,
        anchor.size - forwardDistance,
        anchor.size - backwardDistance,
      );
    }
    sizes[pos] = clampSize(best);
  }
  return sizes;
}

/** 천단위 콤마가 붙은 정수 Reach 표기 (예: 8340 → "8,340") */
export function formatReach(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** 소수점 1자리 % Engagement 표기 (예: 14.3 → "14.3%") */
export function formatEngagement(value: number): string {
  return `${value.toFixed(1)}%`;
}

/** 1 → "1st", 2 → "2nd", 3 → "3rd", 4 → "4th", 11~13 → "11th"~"13th" 등 */
export function ordinal(n: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const remainder = n % 100;
  const suffix =
    suffixes[(remainder - 20) % 10] ?? suffixes[remainder] ?? suffixes[0];
  return `${n}${suffix}`;
}

/**
 * Rule F — Ranking 최종 순위 (`GB_Compass.md` 3부 그대로).
 *
 * 1) Qualified Reach·Engagement Intensity 각각 1~N등을 매기고
 * 2) 등수를 점수로 뒤집는다(1등=N점 ... N등=1점)
 * 3) 최종 점수 = Engagement 점수×2 + Reach 점수×1
 * 4) 최종 점수로 재정렬. 동점이면 Engagement 등수가 더 높은(숫자가 작은) 쪽이 상위.
 *
 * 반환값은 입력 배열과 같은 순서의 1-based 최종 순위 배열입니다.
 */
export function computeFinalRanks(selves: CompassDialSelf[]): number[] {
  const n = selves.length;
  if (n === 0) return [];

  const reachRanks = rankDescending(selves.map((s) => s.qualifiedReach));
  const engagementRanks = rankDescending(
    selves.map((s) => s.engagementIntensity),
  );
  const reachScores = reachRanks.map((rank) => n - rank);
  const engagementScores = engagementRanks.map((rank) => n - rank);
  const finalScores = reachScores.map(
    (reachScore, i) => engagementScores[i] * 2 + reachScore,
  );

  const order = selves
    .map((_, index) => index)
    .sort((a, b) => {
      if (finalScores[b] !== finalScores[a]) {
        return finalScores[b] - finalScores[a];
      }
      return engagementRanks[a] - engagementRanks[b];
    });

  const finalRanks = new Array<number>(n);
  order.forEach((originalIndex, rank) => {
    finalRanks[originalIndex] = rank + 1;
  });
  return finalRanks;
}

export interface FilledSlot {
  /** 크기 버킷팅에 쓰이는 값 (Reach 링이면 qualifiedReach, Engagement 링이면 engagementIntensity) */
  value: number;
  /** 표시할 라벨. `undefined`면 이 슬롯은 라벨 없이 크기만 반영합니다(Ranking 안쪽 링) */
  label?: string;
}

/**
 * 링 하나(outward 또는 inward)의 80개 눈금 렌더 계획을 계산합니다.
 *
 * - 슬롯 순서 = 배열 인덱스(0=북쪽, Rule C: 호출부가 이미 슬롯 배정을 마친 배열을 넘김)
 * - 크기는 슬롯 위치가 아니라 `value` 기준 내림차순 순위로 버킷팅됩니다(Rule D)
 * - 라벨이 있는 슬롯 중 북쪽(슬롯0)은 항상 `type="circle" muted=false`,
 *   나머지는 `otherLabelType`(Reach/Engagement="text", Ranking="circle") + `muted=true`
 * - 라벨이 없는 슬롯(및 앵커가 아닌 79개 장식용 눈금)은 `type="default"`
 * - `northCoachmark`가 있고 북쪽 슬롯에 실제 라벨이 있으면(=Self가 채워져
 *   있으면) 그 슬롯에만 코치마크를 붙인다. 북쪽이 항상 `type="circle"`인
 *   규칙과 맞물려, 순위와 무관하게 "북쪽 칩"이라는 고정된 자리를 가리킨다.
 */
export function buildRingPlan({
  direction,
  filled,
  otherLabelType = "text",
  northCoachmark,
}: {
  direction: CompassDialTickDirection;
  filled: FilledSlot[];
  otherLabelType?: "text" | "circle";
  northCoachmark?: CompassDialTickCoachmark;
}): CompassDialTickPlan[] {
  const n = filled.length;
  const ranks = rankDescending(filled.map((f) => f.value));
  const anchors: FilledAnchor[] = filled.map((f, slot) => ({
    tickIndex: slotToTickIndex(slot),
    size: getBucketSize(ranks[slot], n),
  }));
  const sizes = computeSizesForTicks(anchors);
  const anchorByTickIndex = new Map(
    anchors.map((anchor, slot) => [anchor.tickIndex, { anchor, slot }]),
  );

  return buildTickAngles().map((angle, tickIndex) => {
    const textArrangement = getTextArrangement(angle, direction);
    const match = anchorByTickIndex.get(tickIndex);
    const filledSlot = match ? filled[match.slot] : undefined;
    const hasLabel = filledSlot?.label != null;

    if (!hasLabel) {
      return {
        angle,
        type: "default",
        muted: false,
        size: sizes[tickIndex],
        textArrangement,
      };
    }

    const isNorth = tickIndex === 0;
    return {
      angle,
      type: isNorth ? "circle" : otherLabelType,
      muted: !isNorth,
      size: sizes[tickIndex],
      textArrangement,
      label: filledSlot.label,
      coachmark: isNorth ? northCoachmark : undefined,
    };
  });
}

/**
 * "데이터 없음" 상태(콜드스타트)의 80개 눈금 렌더 계획.
 *
 * - `primary`인 링만 북쪽에 "No Data Collected" 배지(`type="circle" muted=false`)를
 *   표시하고, 나머지 79개(및 primary가 아닌 링 전체)는 라벨 없는 `type="default"`
 *   size1 장식용 눈금입니다.
 * - `size`는 호출부가 결정합니다: `!dataCollected` → 1,
 *   Ranking인데 Self 2명 미만(데이터는 있으나 순위를 매길 수 없음) → 5
 *   (Figma `get_design_context` 실측으로 확정).
 */
export function buildSuppressedRingPlan(
  direction: CompassDialTickDirection,
  primary: boolean,
  badgeSize: CompassDialTickSize,
): CompassDialTickPlan[] {
  return buildTickAngles().map((angle, tickIndex) => {
    const textArrangement = getTextArrangement(angle, direction);
    if (primary && tickIndex === 0) {
      return {
        angle,
        type: "circle",
        muted: false,
        size: badgeSize,
        textArrangement,
        label: "No Data Collected",
      };
    }
    return {
      angle,
      type: "default",
      muted: false,
      size: 1,
      textArrangement,
    };
  });
}

export interface CompassDialPlan {
  outward?: CompassDialTickPlan[];
  inward?: CompassDialTickPlan[];
}

/**
 * `CompassDial`의 최상위 계획 함수. `type`·`selves`·`dataCollected`로부터 두 링
 * (outward=Reach, inward=Engagement)의 렌더 계획을 계산합니다.
 *
 * 우선순위(Figma 실측으로 확정 — 아래 3가지 모두 최초 조사 요청에는
 * 없었던, `get_design_context`로 직접 검증한 보정 사항):
 * 1) Self 0명 → 두 링 모두 라벨 없이 전부 장식용(size1)
 * 2) `dataCollected=false` → primary 링 북쪽에 size1 "No Data Collected" 배지
 * 3) `type="reach-and-engagement"`인데 Self 2명 미만(비교 불가) → outward 북쪽에
 *    size5 "No Data Collected" 배지(값 자체는 있지만 순위를 매길 수 없다는 뜻이라
 *    2번과 다르게 큰 사이즈로 표시됨 — `Self number=1, Data Collected=true`
 *    실측으로 확인, 문서에 없던 발견)
 * 4) 그 외 → `buildRingPlan`으로 정상 버킷팅
 *
 * `coachmark`(신규)는 `type="reach"`/`"engagement"`에서만 북쪽 칩에
 * 붙는다. `"reach-and-engagement"`(Ranking)에는 Figma에 정상 데이터 상태의
 * 코치마크가 없어(Self 2명 미만일 때의 "No Ranking Data Yet" 예외 상태만 있음,
 * 이번 범위 밖) 의도적으로 전달하지 않는다.
 */
export function buildCompassDialPlan({
  type,
  selves,
  dataCollected = true,
  coachmark,
}: {
  type: CompassDialType;
  selves: CompassDialSelf[];
  dataCollected?: boolean;
  coachmark?: CompassDialTickCoachmark;
}): CompassDialPlan {
  const filled = selves.slice(0, ANCHOR_COUNT);
  const usesOutward = type === "reach" || type === "reach-and-engagement";
  const usesInward = type === "engagement" || type === "reach-and-engagement";

  if (filled.length === 0) {
    return {
      outward: usesOutward
        ? buildSuppressedRingPlan("outward", false, 1)
        : undefined,
      inward: usesInward
        ? buildSuppressedRingPlan("inward", false, 1)
        : undefined,
    };
  }

  if (!dataCollected) {
    return {
      outward: usesOutward
        ? buildSuppressedRingPlan("outward", true, 1)
        : undefined,
      inward: usesInward
        ? buildSuppressedRingPlan("inward", !usesOutward, 1)
        : undefined,
    };
  }

  if (type === "reach-and-engagement" && filled.length < 2) {
    return {
      outward: buildSuppressedRingPlan("outward", true, 5),
      inward: buildSuppressedRingPlan("inward", false, 5),
    };
  }

  if (type === "reach") {
    return {
      outward: buildRingPlan({
        direction: "outward",
        filled: filled.map((s) => ({
          value: s.qualifiedReach,
          label: formatReach(s.qualifiedReach),
        })),
        otherLabelType: "text",
        northCoachmark: coachmark,
      }),
    };
  }

  if (type === "engagement") {
    return {
      inward: buildRingPlan({
        direction: "inward",
        filled: filled.map((s) => ({
          value: s.engagementIntensity,
          label: formatEngagement(s.engagementIntensity),
        })),
        otherLabelType: "text",
        northCoachmark: coachmark,
      }),
    };
  }

  const finalRanks = computeFinalRanks(filled);
  return {
    outward: buildRingPlan({
      direction: "outward",
      filled: filled.map((s, i) => ({
        value: s.qualifiedReach,
        label: ordinal(finalRanks[i]),
      })),
      otherLabelType: "circle",
    }),
    inward: buildRingPlan({
      direction: "inward",
      filled: filled.map((s) => ({ value: s.engagementIntensity })),
    }),
  };
}

/**
 * 회전 전 눈금 박스(4×117px)의 `top` 오프셋(px, 중심 기준 음수=위쪽).
 *
 * outward는 박스 **아래쪽**이 328px 앵커, inward는 박스 **위쪽**이 311px
 * 앵커입니다(둘 다 `CompassDialTick`이 이미 알고 있는 justify-end/start 정렬과
 * 짝을 이룸). 조립 컴포넌트는 이 오프셋으로 박스를 배치한 뒤 중심 기준으로
 * `rotate(angle)`만 적용하면 됩니다.
 */
export function getTickBoxTopOffset(
  direction: CompassDialTickDirection,
): number {
  return direction === "outward"
    ? -(OUTWARD_ANCHOR_RADIUS + TICK_BOX_HEIGHT)
    : -INWARD_ANCHOR_RADIUS;
}

/**
 * outward(Reach/Ranking) 링의 북쪽(슬롯0) 라벨이 `CompassDial` 캔버스 상단
 * (로컬 y=0)보다 최대 몇 px 더 위로 튀어나올 수 있는지(실사용 겹침
 * 버그 수정 — `app/compass/page.tsx`가 상단 `CompassFloatingNav`와의 여백을
 * 계산할 때 이 값만큼 추가로 확보해야 한다).
 *
 * 북쪽은 항상 `type="circle"`(`Badge size="20"`, 높이 20px)이고,
 * `CompassDialTick`은 outward일 때 `justify-end`로 [라벨, gap(--spacing-4=16px),
 * 눈금선] 묶음을 박스(높이 `TICK_BOX_HEIGHT`) 하단에 붙여 쌓는다. 눈금선이
 * 가장 큰 size5(`TICK_GEOMETRY[5].total`=80px)일 때 묶음 전체 높이가 최대(116px)가
 * 되어 박스 상단에 남는 여백(leftover)이 최소(1px)가 되고, 그만큼 라벨이 박스
 * 상단에 가장 가깝게(=캔버스 바깥쪽으로 가장 많이) 붙는다 — 이때가 worst case.
 * (북쪽 눈금이 항상 size5인 건 아니지만, size가 작을수록 leftover가 커져 라벨이
 * 오히려 캔버스 쪽으로 더 들어오므로 size5가 상한값을 보장한다.)
 */
export const OUTWARD_NORTH_LABEL_MAX_BLEED = (() => {
  // size5 눈금선 길이. `CompassDialTick`(compass-dial-tick.tsx)의
  // `TICK_GEOMETRY[5].total`과 동일해야 함(그 파일의 private 상수라 여기선
  // 리터럴로 복제 — 값이 바뀌면 이 주석과 아래 테스트(compass-dial.test.tsx의
  // `OUTWARD_NORTH_LABEL_MAX_BLEED` describe)가 어긋난 것을 잡아준다).
  const NORTH_TICK_SIZE5_LENGTH = 80;
  const NORTH_BADGE_HEIGHT = 20; // Badge size="20" → --scale-20(px)
  const NORTH_LABEL_GAP = 16; // CompassDialTick outward gap-[var(--spacing-4)](px)

  const boxTopLocal =
    CANVAS_SIZE / 2 - (OUTWARD_ANCHOR_RADIUS + TICK_BOX_HEIGHT); // -45
  const worstCaseContentHeight =
    NORTH_TICK_SIZE5_LENGTH + NORTH_LABEL_GAP + NORTH_BADGE_HEIGHT; // 80+16+20=116
  const leftover = TICK_BOX_HEIGHT - worstCaseContentHeight; // 1
  const labelTopLocal = boxTopLocal + leftover; // -44

  return -labelTopLocal; // 44 — 양수로 표현(캔버스 상단 위로 튀어나오는 px)
})();
