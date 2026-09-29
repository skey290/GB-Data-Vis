import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { CompassSelfCluster } from "./compass-self-cluster";

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

const selfA = { image: "/a.jpg", imageAlt: "A" };
const selfB = { image: "/b.jpg", imageAlt: "B" };

/**
 * 장식 없는 셀프도 항상 CompassGrowthAvatar로 렌더링되고 opacity로만 숨겨지므로
 * (뚝뚝 끊기지 않는 트랜지션을 위해, 2026-09-28), 배지 텍스트는 항상 DOM에 존재한다.
 * "안 보인다"는 opacity-0 클래스 여부로 확인한다.
 */
function isBadgeVisible(percentText: string): boolean {
  const badge = screen.getByText(percentText);
  const wrapper = badge.closest('[class*="opacity-"]') as HTMLElement | null;
  return wrapper?.className.includes("opacity-100") ?? false;
}

describe("CompassSelfCluster", () => {
  it("fills 8 empty slots when no selves are given", () => {
    const { container } = render(<CompassSelfCluster selves={[]} />);

    expect(container.querySelectorAll("img").length).toBe(0);
    expect(screen.getAllByText("No").length).toBe(8);
  });

  it("fills selves starting from north clockwise and leaves the rest empty", () => {
    const { container } = render(
      <CompassSelfCluster selves={[selfA, selfB]} />,
    );

    expect(container.querySelectorAll("img").length).toBe(2);
    expect(screen.getAllByText("No").length).toBe(6);
  });

  it("shows the reach-or-engagement label by default", () => {
    render(<CompassSelfCluster selves={[selfA]} />);

    expect(screen.getByText("Reach")).toBeInTheDocument();
  });

  it("accepts a custom label for reach-or-engagement", () => {
    render(<CompassSelfCluster selves={[selfA]} label="Engagement" />);

    expect(screen.getByText("Engagement")).toBeInTheDocument();
  });

  it("shows the fixed 'Growth Potential' label and ignores the label prop for growth sets", () => {
    render(
      <CompassSelfCluster
        variant="growth-potential"
        selves={[{ ...selfA, growth: 40 }]}
        label="Should be ignored"
      />,
    );

    expect(screen.getByText("Growth Potential")).toBeInTheDocument();
    expect(screen.queryByText("Should be ignored")).toBeNull();
  });

  it("decorates only the single self with growth potential when there is exactly one", () => {
    render(
      <CompassSelfCluster
        variant="growth-potential"
        selves={[{ ...selfA, growth: 40 }]}
      />,
    );

    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("decorates only the self with the highest growth when there are 2+", () => {
    render(
      <CompassSelfCluster
        variant="growth-potential"
        selves={[
          { ...selfA, growth: 20 },
          { ...selfB, growth: 70 },
        ]}
      />,
    );

    expect(isBadgeVisible("70%")).toBe(true);
    expect(isBadgeVisible("20%")).toBe(false);
  });

  it("keeps the focus self's growth decoration when that self is also active", () => {
    render(
      <CompassSelfCluster
        variant="growth-potential"
        selves={[
          { ...selfA, growth: 20 },
          { ...selfB, growth: 60 },
        ]}
        activeSelfIndex={1}
      />,
    );

    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("Go to")).toBeInTheDocument();
    expect(screen.getByText("Content Studio")).toBeInTheDocument();
  });

  it("keeps the focus self's growth decoration when an empty slot is active instead", () => {
    render(
      <CompassSelfCluster
        variant="growth-potential"
        selves={[{ ...selfA, growth: 60 }]}
        activeEmptyPosition={-45}
      />,
    );

    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("Go to")).toBeInTheDocument();
    expect(screen.getByText("Assets")).toBeInTheDocument();
  });

  it("moves the growth decoration to a non-focus self when it is hovered, and removes it from the default focus self", () => {
    const { container } = render(
      <CompassSelfCluster
        variant="growth-potential"
        selves={[
          { ...selfA, growth: 20 },
          { ...selfB, growth: 60 },
        ]}
      />,
    );

    // 기본값: growth가 가장 큰 selfB(60%)가 장식됨
    expect(isBadgeVisible("60%")).toBe(true);
    expect(isBadgeVisible("20%")).toBe(false);

    // selfA(비포커스)를 hover하면 장식이 selfA로 옮겨가고 selfB의 장식은 사라짐.
    // 위치 wrapper(PositionedSatellite)는 장식 여부와 무관하게 항상 같은 DOM
    // 노드로 유지되므로, hover 전에 한 번만 잡아서 enter/leave 양쪽에 재사용한다.
    const selfAWrapper = container.querySelector(`img[alt="${selfA.imageAlt}"]`)
      ?.parentElement?.parentElement?.parentElement as HTMLElement;
    fireEvent.mouseEnter(selfAWrapper);

    expect(isBadgeVisible("20%")).toBe(true);
    expect(isBadgeVisible("60%")).toBe(false);

    // hover가 끝나면 기본 포커스(selfB)로 되돌아감
    fireEvent.mouseLeave(selfAWrapper);
    expect(isBadgeVisible("60%")).toBe(true);
    expect(isBadgeVisible("20%")).toBe(false);
  });

  it("hides all growth decoration while an empty slot is hovered", () => {
    render(
      <CompassSelfCluster
        variant="growth-potential"
        selves={[{ ...selfA, growth: 60 }]}
      />,
    );

    expect(isBadgeVisible("60%")).toBe(true);

    // hover 핸들러는 위치 wrapper(PositionedSatellite)에 달려있다(empty avatar
    // 자체가 아님) — 빈 슬롯 자체는 리마운트되지 않지만 일관되게 wrapper를 사용한다.
    const emptySlotWrapper = screen
      .getAllByText("No")[0]
      .closest("div[class*='border-dashed']")?.parentElement
      ?.parentElement as HTMLElement;
    fireEvent.mouseEnter(emptySlotWrapper);

    expect(isBadgeVisible("60%")).toBe(false);

    fireEvent.mouseLeave(emptySlotWrapper);
    expect(isBadgeVisible("60%")).toBe(true);
  });

  it("shows Estimate (red badge, no overlay text) only for the resting default focus self", () => {
    render(
      <CompassSelfCluster
        variant="growth-potential-estimate"
        selves={[{ ...selfA, growth: 60, estimate: true }]}
      />,
    );

    expect(screen.getByText("60%").className).toContain(
      "text-[var(--text-warning)]",
    );
    expect(screen.getByText("Estimate")).toBeInTheDocument();
    expect(screen.queryByText("Go to")).toBeNull();
  });

  it("never shows the Estimate overlay text on a hovered self, but the badge color still follows that self's own estimate flag", () => {
    const { container } = render(
      <CompassSelfCluster
        variant="growth-potential-estimate"
        selves={[
          { ...selfA, growth: 60, estimate: false },
          { ...selfB, growth: 20, estimate: true },
        ]}
      />,
    );

    // selfB(estimate=true)를 hover하면 안내 문구는 즉시 Estimate 대신 Content
    // Studio로 바뀌지만, 배지 색은 hover와 무관하게 selfB 자신의 데이터 상태를
    // 그대로 따라 빨강(alarm)이다(사용자 확인, 2026-09-28 — 칩 색깔은 hover로
    // 바뀌면 안 됨).
    const selfBWrapper = container.querySelector(`img[alt="${selfB.imageAlt}"]`)
      ?.parentElement?.parentElement?.parentElement as HTMLElement;
    fireEvent.mouseEnter(selfBWrapper);

    expect(isBadgeVisible("20%")).toBe(true);
    expect(screen.getByText("20%").className).toContain(
      "text-[var(--text-warning)]",
    );
    expect(screen.queryByText("Estimate")).toBeNull();
    expect(screen.getByText("Go to")).toBeInTheDocument();
    expect(screen.getByText("Content Studio")).toBeInTheDocument();
  });

  it("switches the focus badge to alarm styling for growth-potential-estimate", () => {
    render(
      <CompassSelfCluster
        variant="growth-potential-estimate"
        selves={[{ ...selfA, growth: 25 }]}
      />,
    );

    expect(screen.getByText("25%").className).toContain(
      "text-[var(--text-warning)]",
    );
    expect(screen.getByText("Estimate")).toBeInTheDocument();
  });

  it("shows the global error state with plain avatars (no decoration) and a Retry button", () => {
    const onRetry = vi.fn();
    const { container } = render(
      <CompassSelfCluster
        variant="growth-potential-error"
        selves={[{ ...selfA, growth: 90 }]}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText("We couldn't fetch your data")).toBeInTheDocument();
    expect(container.querySelectorAll("img").length).toBe(1);
    expect(screen.getAllByText("No").length).toBe(7);
    expect(screen.queryByText("90%")).toBeNull();

    screen.getByText("Retry").click();
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("calls onSelfClick with the self index when a filled avatar is clicked", () => {
    const onSelfClick = vi.fn();
    const { container } = render(
      <CompassSelfCluster selves={[selfA]} onSelfClick={onSelfClick} />,
    );

    (container.querySelector("img")?.closest("div") as HTMLElement).click();
    expect(onSelfClick).toHaveBeenCalledWith(0);
  });

  it("calls onEmptySlotClick with the position when an empty slot is clicked", () => {
    const onEmptySlotClick = vi.fn();
    render(
      <CompassSelfCluster selves={[]} onEmptySlotClick={onEmptySlotClick} />,
    );

    screen
      .getAllByText("No")[0]
      .closest("div[class*='border-dashed']")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(onEmptySlotClick).toHaveBeenCalled();
  });

  it("marks the empty slot at activeEmptyPosition as active ('Go to Assets')", () => {
    render(<CompassSelfCluster selves={[]} activeEmptyPosition={0} />);

    expect(screen.getByText("Go to")).toBeInTheDocument();
    expect(screen.getByText("Assets")).toBeInTheDocument();
  });

  it("shows the coachmark tooltip on the resting default focus self's badge", () => {
    render(
      <CompassSelfCluster
        variant="growth-potential"
        selves={[
          { ...selfA, growth: 20 },
          { ...selfB, growth: 60 },
        ]}
        coachmark={{
          title: "Growth Potential: 80%",
          description: "Start posting to turn this potential into real reach.",
        }}
      />,
    );

    // selfB(growth=60)가 기본 포커스이므로 코치마크는 그 배지에만 붙는다.
    expect(screen.getByText("Growth Potential: 80%")).toBeInTheDocument();
  });

  it("hides the coachmark while a different self is hovered", () => {
    const { container } = render(
      <CompassSelfCluster
        variant="growth-potential"
        selves={[
          { ...selfA, growth: 20 },
          { ...selfB, growth: 60 },
        ]}
        coachmark={{ title: "Growth Potential: 80%" }}
      />,
    );

    expect(screen.getByText("Growth Potential: 80%")).toBeInTheDocument();

    const selfAWrapper = container.querySelector(`img[alt="${selfA.imageAlt}"]`)
      ?.parentElement?.parentElement?.parentElement as HTMLElement;
    fireEvent.mouseEnter(selfAWrapper);

    expect(screen.queryByText("Growth Potential: 80%")).toBeNull();
  });

  it("ignores coachmark for the reach-or-engagement variant", () => {
    render(
      <CompassSelfCluster
        selves={[selfA]}
        coachmark={{ title: "Growth Potential: 80%" }}
      />,
    );

    expect(screen.queryByText("Growth Potential: 80%")).toBeNull();
  });
});
