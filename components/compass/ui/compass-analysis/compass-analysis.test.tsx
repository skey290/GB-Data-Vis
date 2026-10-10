import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { CompassAnalysis, type CompassAnalysisSelf } from "./compass-analysis";

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

const selfA: CompassAnalysisSelf = {
  id: "a",
  image: "/a.jpg",
  imageAlt: "A",
  qualifiedReach: 8340,
  engagementIntensity: 14.3,
  growth: 20,
};
const selfB: CompassAnalysisSelf = {
  id: "b",
  image: "/b.jpg",
  imageAlt: "B",
  qualifiedReach: 6453,
  engagementIntensity: 1.8,
  growth: 60,
};

describe("CompassAnalysis", () => {
  it("renders both the dial ranking labels and the self avatars by default", () => {
    const { container } = render(
      <CompassAnalysis selves={[selfA, selfB]} label="Reach" />,
    );

    expect(screen.getByText("1st")).toBeInTheDocument();
    expect(container.querySelectorAll("img").length).toBe(2);
  });

  it("hides the dial entirely when dial=false", () => {
    const { container } = render(
      <CompassAnalysis dial={false} selves={[selfA, selfB]} />,
    );

    expect(screen.queryByText("1st")).toBeNull();
    expect(container.querySelectorAll("img").length).toBe(2);
  });

  it("passes clusterVariant through to the growth-potential focus self", () => {
    render(
      <CompassAnalysis
        dial={false}
        clusterVariant="growth-potential"
        selves={[selfA, selfB]}
      />,
    );

    // 장식 없는 셀프도 opacity-0로만 숨겨질 뿐 DOM에는 계속 있다(부드러운
    // 트랜지션을 위해) — 배지 텍스트 자체는 둘 다 존재한다.
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();
  });

  it("forwards onSelfClick with the clicked self's index", () => {
    const onSelfClick = vi.fn();
    const { container } = render(
      <CompassAnalysis
        dial={false}
        selves={[selfA]}
        onSelfClick={onSelfClick}
      />,
    );

    (container.querySelector("img")?.closest("div") as HTMLElement).click();
    expect(onSelfClick).toHaveBeenCalledWith(0);
  });

  it("forwards onRetry for the growth-potential-error variant", () => {
    const onRetry = vi.fn();
    render(
      <CompassAnalysis
        dial={false}
        clusterVariant="growth-potential-error"
        selves={[selfA]}
        onRetry={onRetry}
      />,
    );

    screen.getByText("Retry").click();
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("forwards coachmark to CompassDial's north badge when dial=true", () => {
    render(
      <CompassAnalysis
        type="reach"
        selves={[selfA, selfB]}
        coachmark={{ title: "Most Reached: 8,340" }}
      />,
    );

    expect(screen.getByText("Most Reached: 8,340")).toBeInTheDocument();
  });

  it("forwards coachmark to the growth-potential focus self's badge when dial=false", () => {
    render(
      <CompassAnalysis
        dial={false}
        clusterVariant="growth-potential"
        selves={[selfA, selfB]}
        coachmark={{ title: "Growth Potential: 80%" }}
      />,
    );

    expect(screen.getByText("Growth Potential: 80%")).toBeInTheDocument();
  });
});
