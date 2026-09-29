import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CompassGrowthAvatar } from "./compass-growth-avatar";

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

describe("CompassGrowthAvatar", () => {
  it("renders only the avatar image with no ring/connector/badge when growth=0", () => {
    const { container } = render(
      <CompassGrowthAvatar growth={0} image="/self.jpg" />,
    );

    expect(container.querySelector("img")).toBeInTheDocument();
    expect(container.querySelector(".border-dashed")).not.toBeInTheDocument();
    expect(screen.queryByText("0%")).toBeNull();
  });

  it("renders a dashed guide ring sized 100 + growth*1.25 px in diameter when growth>0", () => {
    const { container } = render(
      <CompassGrowthAvatar growth={40} position={0} image="/self.jpg" />,
    );

    const ring = container.querySelector(".border-dashed") as HTMLElement;
    expect(ring).toBeInTheDocument();
    // radius = 50 + 40*1.25 = 100 -> diameter 200
    expect(ring.style.width).toBe("200px");
    expect(ring.style.height).toBe("200px");
  });

  it("renders the percentage badge rounded from the growth value", () => {
    render(
      <CompassGrowthAvatar growth={33.7} position={0} image="/self.jpg" />,
    );

    expect(screen.getByText("34%")).toBeInTheDocument();
  });

  it("uses the reverse badge variant by default and alarm when estimate=true", () => {
    const { rerender } = render(
      <CompassGrowthAvatar growth={20} position={0} image="/self.jpg" />,
    );

    expect(screen.getByText("20%").className).toContain(
      "bg-[var(--background-default)]",
    );

    rerender(
      <CompassGrowthAvatar
        growth={20}
        position={0}
        estimate
        image="/self.jpg"
      />,
    );

    expect(screen.getByText("20%").className).toContain(
      "text-[var(--text-warning)]",
    );
  });

  it("rotates the connector/badge pivot by -position degrees", () => {
    const { container } = render(
      <CompassGrowthAvatar growth={20} position={90} image="/self.jpg" />,
    );

    const pivots = container.querySelectorAll('[style*="rotate(-90deg)"]');
    expect(pivots.length).toBeGreaterThan(0);
  });

  it("shows the CompassSelfAvatar error overlay when estimate=true and status=default", () => {
    render(
      <CompassGrowthAvatar
        growth={20}
        position={0}
        estimate
        image="/self.jpg"
      />,
    );

    expect(screen.getByText("Estimate")).toBeInTheDocument();
    expect(screen.getByText("(Lack of Data)")).toBeInTheDocument();
  });

  it("hides the error overlay but keeps the badge's alarm color when status=active (badge follows estimate, not status)", () => {
    render(
      <CompassGrowthAvatar
        growth={20}
        position={0}
        status="active"
        estimate
        image="/self.jpg"
      />,
    );

    expect(screen.queryByText("Estimate")).toBeNull();
    expect(screen.getByText("20%").className).toContain(
      "text-[var(--text-warning)]",
    );
  });

  it("fades the ring/connector/badge to opacity-0 when decorated=false, without unmounting them", () => {
    const { container } = render(
      <CompassGrowthAvatar
        growth={20}
        position={0}
        estimate
        decorated={false}
        image="/self.jpg"
      />,
    );

    // 배지는 여전히 DOM에 있고(부드러운 트랜지션을 위해) 색상도 estimate를 그대로
    // 따르지만, 감싸는 wrapper가 opacity-0이라 화면에는 보이지 않는다.
    expect(screen.getByText("20%").className).toContain(
      "text-[var(--text-warning)]",
    );
    const ring = container.querySelector(".border-dashed") as HTMLElement;
    expect(ring).toBeInTheDocument();
    expect(ring.className).toContain("opacity-0");
  });

  it("renders the empty slot and ignores growth/position/estimate for variant='empty'", () => {
    render(<CompassGrowthAvatar variant="empty" growth={40} position={90} />);

    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.getByText("Self Yet")).toBeInTheDocument();
    expect(screen.queryByText("40%")).toBeNull();
  });

  it("forwards additional props to the root element", () => {
    render(<CompassGrowthAvatar data-testid="growth-avatar" image="/a.jpg" />);

    expect(screen.getByTestId("growth-avatar")).toBeInTheDocument();
  });

  it("wraps the percentage badge in an always-open coachmark tooltip when coachmark is given", () => {
    render(
      <CompassGrowthAvatar
        growth={80}
        position={0}
        image="/self.jpg"
        coachmark={{
          title: "Growth Potential: 80%",
          description: "Start posting to turn this potential into real reach.",
        }}
      />,
    );

    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    expect(screen.getByText("Growth Potential: 80%")).toBeInTheDocument();
  });

  it("does not render a coachmark tooltip when coachmark is not given", () => {
    render(<CompassGrowthAvatar growth={80} position={0} image="/self.jpg" />);

    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("calls coachmark.onDismiss when the tooltip's close button is clicked", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <CompassGrowthAvatar
        growth={80}
        position={0}
        image="/self.jpg"
        coachmark={{ title: "Growth Potential: 80%", onDismiss }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Close tooltip" }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
