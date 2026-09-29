import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { CompassDial } from "./compass-dial";

beforeAll(() => {
  // Radix Tooltip의 Arrow(useSize)는 포지셔닝 계산에 ResizeObserver를 사용하는데
  // jsdom에는 없음 — components/ui/tooltip/tooltip.test.tsx와 동일한 폴리필 패턴
  if (!("ResizeObserver" in window)) {
    (window as unknown as { ResizeObserver: unknown }).ResizeObserver = vi
      .fn()
      .mockImplementation(function ResizeObserverMock() {
        return {
          observe: vi.fn(),
          unobserve: vi.fn(),
          disconnect: vi.fn(),
        };
      });
  }
});
import {
  buildCompassDialPlan,
  computeFinalRanks,
  computeSizesForTicks,
  formatEngagement,
  formatReach,
  getBucketSize,
  getTextArrangement,
  ordinal,
  OUTWARD_NORTH_LABEL_MAX_BLEED,
  rankDescending,
  type CompassDialSelf,
  type FilledAnchor,
} from "./compass-dial-utils";

const SELVES_8: CompassDialSelf[] = [
  { id: "data-scientist", qualifiedReach: 8340, engagementIntensity: 14.3 },
  { id: "yoga-meditator", qualifiedReach: 6453, engagementIntensity: 1.8 },
  { id: "novelist", qualifiedReach: 4784, engagementIntensity: 0.4 },
  { id: "entrepreneur", qualifiedReach: 978, engagementIntensity: 2.0 },
  { id: "fashionista", qualifiedReach: 6782, engagementIntensity: 0.3 },
  { id: "fashion-editor", qualifiedReach: 125, engagementIntensity: 3.7 },
  { id: "team-leader", qualifiedReach: 8006, engagementIntensity: 0.5 },
  { id: "vegan-chef", qualifiedReach: 5431, engagementIntensity: 1.9 },
];

describe("formatReach / formatEngagement", () => {
  it("formats reach with thousands separators and no decimals", () => {
    expect(formatReach(8340)).toBe("8,340");
    expect(formatReach(125)).toBe("125");
    expect(formatReach(1000000)).toBe("1,000,000");
  });

  it("formats engagement with exactly one decimal, including trailing zero", () => {
    expect(formatEngagement(14.3)).toBe("14.3%");
    expect(formatEngagement(2)).toBe("2.0%");
  });
});

describe("ordinal", () => {
  it("adds st/nd/rd/th suffixes", () => {
    expect(ordinal(1)).toBe("1st");
    expect(ordinal(2)).toBe("2nd");
    expect(ordinal(3)).toBe("3rd");
    expect(ordinal(4)).toBe("4th");
    expect(ordinal(8)).toBe("8th");
  });

  it("handles the 11th/12th/13th exception", () => {
    expect(ordinal(11)).toBe("11th");
    expect(ordinal(12)).toBe("12th");
    expect(ordinal(13)).toBe("13th");
  });
});

describe("rankDescending", () => {
  it("ranks the largest value 0", () => {
    expect(rankDescending([10, 30, 20])).toEqual([2, 0, 1]);
  });

  it("breaks ties by original array order", () => {
    expect(rankDescending([5, 5, 1])).toEqual([0, 1, 2]);
  });
});

describe("getBucketSize (Rule D)", () => {
  it("gives rank 0 (best) size 5 and the worst rank size 1 for N=8", () => {
    const sizes = Array.from({ length: 8 }, (_, i) => getBucketSize(i, 8));
    expect(sizes).toEqual([5, 4, 4, 3, 3, 2, 2, 1]);
  });

  it("returns size 5 for a lone value (N<=1, comparison impossible)", () => {
    expect(getBucketSize(0, 1)).toBe(5);
    expect(getBucketSize(0, 0)).toBe(5);
  });

  it("only produces two distinct sizes for N=2", () => {
    expect(getBucketSize(0, 2)).toBe(5);
    expect(getBucketSize(1, 2)).toBe(1);
  });
});

describe("computeSizesForTicks (Rule E)", () => {
  it("tapers symmetrically from a single anchor around the full circle", () => {
    const sizes = computeSizesForTicks([{ tickIndex: 0, size: 5 }]);
    expect(sizes).toHaveLength(80);
    expect(sizes[0]).toBe(5);
    expect(sizes[1]).toBe(4);
    expect(sizes[4]).toBe(1);
    // antipodal point (40 steps away either direction) is fully decayed
    expect(sizes[40]).toBe(1);
    // symmetric on both sides of the anchor
    expect(sizes[79]).toBe(4);
  });

  it("keeps each anchor's own size exactly at its tick index", () => {
    const anchors: FilledAnchor[] = [
      { tickIndex: 0, size: 5 },
      { tickIndex: 10, size: 3 },
      { tickIndex: 20, size: 1 },
    ];
    const sizes = computeSizesForTicks(anchors);
    expect(sizes[0]).toBe(5);
    expect(sizes[10]).toBe(3);
    expect(sizes[20]).toBe(1);
  });

  it("handles a large wrap-around gap between the last and first filled anchors", () => {
    // 3 anchors filling slots 0,1,2 (tick index 0,10,20) leaves a 50-tick gap
    // (slot 2 -> wraps around -> slot 0) exactly like the spec's worked example.
    const anchors: FilledAnchor[] = [
      { tickIndex: 0, size: 5 },
      { tickIndex: 10, size: 4 },
      { tickIndex: 20, size: 3 },
    ];
    const sizes = computeSizesForTicks(anchors);
    // Deep in the empty gap (halfway between tick 20 and tick 80/0) decays to 1
    expect(sizes[45]).toBe(1);
  });

  it("returns all-1 when there are no anchors", () => {
    expect(computeSizesForTicks([])).toEqual(Array(80).fill(1));
  });
});

describe("computeFinalRanks (Rule F, GB_Compass.md 3부)", () => {
  it("weights engagement 2x and reach 1x, breaking the reach-only leader down", () => {
    // A: reach rank 2 (score 2), engagement rank 1 (score 3) -> 2*3+2=8
    // B: reach rank 1 (score 3), engagement rank 3 (score 1) -> 2*1+3=5
    // C: reach rank 3 (score 1), engagement rank 2 (score 2) -> 2*2+1=5, ties B
    //    but C's engagement rank (2) beats B's engagement rank (3) -> C ranks above B
    const selves: CompassDialSelf[] = [
      { id: "A", qualifiedReach: 12000, engagementIntensity: 3.5 },
      { id: "B", qualifiedReach: 18000, engagementIntensity: 1.2 },
      { id: "C", qualifiedReach: 5000, engagementIntensity: 2.5 },
    ];
    const ranks = computeFinalRanks(selves);
    expect(ranks[0]).toBe(1); // A
    expect(ranks[2]).toBeLessThan(ranks[1]); // C above B
  });

  it("returns an empty array for zero selves", () => {
    expect(computeFinalRanks([])).toEqual([]);
  });
});

describe("getTextArrangement", () => {
  it("keeps north/south upright for outward (cross family)", () => {
    expect(getTextArrangement(0, "outward")).toBe("cross");
    expect(getTextArrangement(180, "outward")).toBe("cross-reverse");
  });

  it("swaps which cross variant reads upright for inward", () => {
    expect(getTextArrangement(0, "inward")).toBe("cross-reverse");
    expect(getTextArrangement(180, "inward")).toBe("cross");
  });

  it("uses the same parallel family for east/west regardless of direction", () => {
    expect(getTextArrangement(90, "outward")).toBe("parallel");
    expect(getTextArrangement(90, "inward")).toBe("parallel");
    expect(getTextArrangement(270, "outward")).toBe("parallel-reverse");
    expect(getTextArrangement(270, "inward")).toBe("parallel-reverse");
  });

  it("assigns the diagonal tie (45deg) to the parallel bucket, matching Figma", () => {
    expect(getTextArrangement(45, "outward")).toBe("parallel");
  });
});

describe("buildCompassDialPlan", () => {
  it("shows the real value at size 5 for a lone self with data collected (not 'No Data Collected')", () => {
    const plan = buildCompassDialPlan({
      type: "reach",
      selves: [SELVES_8[0]],
      dataCollected: true,
    });
    const north = plan.outward?.[0];
    expect(north?.label).toBe("8,340");
    expect(north?.size).toBe(5);
  });

  it("shows a small 'No Data Collected' badge when dataCollected is false", () => {
    const plan = buildCompassDialPlan({
      type: "reach",
      selves: [SELVES_8[0]],
      dataCollected: false,
    });
    const north = plan.outward?.[0];
    expect(north?.label).toBe("No Data Collected");
    expect(north?.size).toBe(1);
    expect(plan.outward?.[1]?.type).toBe("default");
  });

  it("locks ranking to 'No Data Collected' at size 5 when fewer than 2 selves exist, even with data collected", () => {
    const plan = buildCompassDialPlan({
      type: "reach-and-engagement",
      selves: [SELVES_8[0]],
      dataCollected: true,
    });
    expect(plan.outward?.[0]?.label).toBe("No Data Collected");
    expect(plan.outward?.[0]?.size).toBe(5);
    // the inward ring has no badge at all in this suppressed case
    expect(plan.inward?.every((tick) => tick.label === undefined)).toBe(true);
  });

  it("renders no labels at all for zero selves", () => {
    const plan = buildCompassDialPlan({ type: "reach", selves: [] });
    expect(plan.outward?.every((tick) => tick.label === undefined)).toBe(true);
  });

  it("labels the outward ring with rank ordinals and leaves the inward ring unlabeled for reach-and-engagement", () => {
    const plan = buildCompassDialPlan({
      type: "reach-and-engagement",
      selves: SELVES_8,
    });
    const outwardLabels = plan.outward
      ?.map((tick) => tick.label)
      .filter(Boolean);
    expect(outwardLabels).toContain("1st");
    expect(outwardLabels).toContain("8th");
    expect(plan.inward?.every((tick) => tick.label === undefined)).toBe(true);
  });

  it("only builds the ring matching the requested type", () => {
    expect(
      buildCompassDialPlan({ type: "reach", selves: SELVES_8 }).inward,
    ).toBeUndefined();
    expect(
      buildCompassDialPlan({ type: "engagement", selves: SELVES_8 }).outward,
    ).toBeUndefined();
  });
});

describe("CompassDial", () => {
  it("renders the north badge and a muted label for type='reach'", () => {
    render(<CompassDial type="reach" selves={SELVES_8} />);

    expect(screen.getByText("8,340")).toBeInTheDocument();
    expect(screen.getByText("125")).toBeInTheDocument();
  });

  it("renders percentage labels for type='engagement'", () => {
    render(<CompassDial type="engagement" selves={SELVES_8} />);

    expect(screen.getByText("14.3%")).toBeInTheDocument();
  });

  it("renders ordinal rank labels for type='reach-and-engagement'", () => {
    render(<CompassDial type="reach-and-engagement" selves={SELVES_8} />);

    expect(screen.getByText("1st")).toBeInTheDocument();
    expect(screen.getByText("8th")).toBeInTheDocument();
  });

  it("shows 'No Data Collected' when dataCollected is false", () => {
    render(
      <CompassDial type="reach" selves={SELVES_8} dataCollected={false} />,
    );

    expect(screen.getByText("No Data Collected")).toBeInTheDocument();
    expect(screen.queryByText("8,340")).toBeNull();
  });

  it("attaches the coachmark tooltip to the north (rank-position-independent) badge for type='reach'", () => {
    render(
      <CompassDial
        type="reach"
        selves={SELVES_8}
        coachmark={{ title: "Most Reached: 8,340" }}
      />,
    );

    expect(screen.getByText("Most Reached: 8,340")).toBeInTheDocument();
  });

  it("ignores coachmark for type='reach-and-engagement' (Ranking has no normal-state coachmark)", () => {
    render(
      <CompassDial
        type="reach-and-engagement"
        selves={SELVES_8}
        coachmark={{ title: "Most Reached: 8,340" }}
      />,
    );

    expect(screen.queryByText("Most Reached: 8,340")).toBeNull();
  });
});

describe("OUTWARD_NORTH_LABEL_MAX_BLEED", () => {
  it("stays at 44px — app/compass/page.tsx hardcodes this exact value in a Tailwind", () => {
    // arbitrary-value class (`pt-[calc(var(--spacing-4)*2+53px+44px)]`) because
    // Tailwind's JIT scanner needs a static literal, not a JS-interpolated one.
    // If dial geometry changes and this constant drifts from 44, that page-level
    // class must be updated to match or the Reach/Ranking floating-nav overlap
    // fix (2026-09-29) silently regresses.
    expect(OUTWARD_NORTH_LABEL_MAX_BLEED).toBe(44);
  });
});
