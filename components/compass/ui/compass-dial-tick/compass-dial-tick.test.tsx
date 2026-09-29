import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CompassDialTick } from "./compass-dial-tick";

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

describe("CompassDialTick", () => {
  it("renders only the tick mark for type='default'", () => {
    const { container } = render(<CompassDialTick type="default" />);

    expect(
      container.querySelector('[data-slot="compass-dial-tick-mark"]'),
    ).toBeInTheDocument();
    expect(container.querySelector("p")).toBeNull();
    expect(container.querySelector("span")).toBeNull();
  });

  it("renders the label text for type='text'", () => {
    render(<CompassDialTick type="text" label="6/1" />);

    expect(screen.getByText("6/1")).toBeInTheDocument();
  });

  it("renders a Badge for type='circle'", () => {
    render(<CompassDialTick type="circle" label="Badge" />);

    const badge = screen.getByText("Badge");
    expect(badge.className).toContain("bg-[var(--background-bold)]");
  });

  it("switches the Badge to outline variant when muted", () => {
    render(<CompassDialTick type="circle" muted label="Badge" />);

    const badge = screen.getByText("Badge");
    expect(badge.className).toContain("text-[var(--text-subtle)]");
  });

  it("downgrades text typography when muted", () => {
    render(<CompassDialTick type="text" muted label="6/1" />);

    const label = screen.getByText("6/1");
    expect(label.className).toContain("text-sm-semi-bold");
    expect(label.className).toContain("text-[var(--text-subtle)]");
  });

  it("uses base-semi-bold typography when not muted", () => {
    render(<CompassDialTick type="text" label="6/1" />);

    const label = screen.getByText("6/1");
    expect(label.className).toContain("text-base-semi-bold");
    expect(label.className).toContain("text-[var(--text-default)]");
  });

  it.each([
    ["outward", "cross", 0],
    ["outward", "cross-reverse", 180],
    ["outward", "parallel", -90],
    ["outward", "parallel-reverse", 90],
    ["inward", "cross", 180],
    ["inward", "cross-reverse", 0],
    ["inward", "parallel", -90],
    ["inward", "parallel-reverse", 90],
  ] as const)(
    "rotates the text label %s deg for direction=%s textArrangement=%s",
    (direction, textArrangement, expectedDeg) => {
      render(
        <CompassDialTick
          type="text"
          direction={direction}
          textArrangement={textArrangement}
          label="6/1"
        />,
      );

      expect(screen.getByText("6/1").style.transform).toBe(
        `rotate(${expectedDeg}deg)`,
      );
    },
  );

  it("positions the label absolutely above the box for direction='inward'", () => {
    const { container } = render(
      <CompassDialTick type="text" direction="inward" label="6/1" />,
    );

    const wrapper = screen.getByText("6/1").parentElement;
    expect(wrapper?.className).toContain("absolute");
    expect(container.querySelector(".justify-end")).toBeNull();
  });

  it("bottom-aligns content for direction='outward'", () => {
    const { container } = render(
      <CompassDialTick type="text" direction="outward" label="6/1" />,
    );

    expect(container.firstElementChild?.className).toContain("justify-end");
  });

  it("keeps the tick stroke on the static-white token regardless of muted", () => {
    const { container: mutedContainer } = render(
      <CompassDialTick type="text" muted label="6/1" />,
    );
    const { container: normalContainer } = render(
      <CompassDialTick type="text" label="6/1" />,
    );

    expect(mutedContainer.querySelector("path")?.getAttribute("stroke")).toBe(
      "var(--border-static-white)",
    );
    expect(normalContainer.querySelector("path")?.getAttribute("stroke")).toBe(
      "var(--border-static-white)",
    );
  });

  it("scales the tick path with size", () => {
    const { container: size5 } = render(<CompassDialTick size={5} />);
    const { container: size1 } = render(<CompassDialTick size={1} />);

    expect(size5.querySelector("svg")?.getAttribute("height")).toBe("80");
    expect(size1.querySelector("svg")?.getAttribute("height")).toBe("20");
  });

  it("does not flip circle+inward+cross-reverse (would mirror the badge text)", () => {
    render(
      <CompassDialTick
        type="circle"
        direction="inward"
        textArrangement="cross-reverse"
        label="Badge"
      />,
    );

    const badgeWrapper = screen.getByText("Badge").parentElement;
    expect(badgeWrapper?.style.transform).toBe("rotate(0deg)");
  });

  it("does not flip circle+inward for cross/parallel arrangements", () => {
    render(
      <CompassDialTick
        type="circle"
        direction="inward"
        textArrangement="cross"
        label="Badge"
      />,
    );

    const badgeWrapper = screen.getByText("Badge").parentElement;
    expect(badgeWrapper?.style.transform).toBe("rotate(0deg)");
  });

  it("forwards additional props to the root element", () => {
    render(<CompassDialTick data-testid="dial-tick" />);

    expect(screen.getByTestId("dial-tick")).toBeInTheDocument();
  });

  it("wraps the circle badge label in an always-open coachmark tooltip when coachmark is given", () => {
    render(
      <CompassDialTick
        type="circle"
        label="8,340"
        coachmark={{ title: "Most Reached: 8,340" }}
      />,
    );

    // Tooltip content renders into a portal, so it's found via document body, not `container`.
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    expect(screen.getByText("Most Reached: 8,340")).toBeInTheDocument();
  });

  it("does not render a coachmark tooltip when coachmark is not given", () => {
    render(<CompassDialTick type="circle" label="8,340" />);

    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("calls coachmark.onDismiss when the tooltip's close button is clicked", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <CompassDialTick
        type="circle"
        label="8,340"
        coachmark={{ title: "Most Reached: 8,340", onDismiss }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Close tooltip" }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
