import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CompassSelfAvatar } from "./compass-self-avatar";

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

describe("CompassSelfAvatar", () => {
  it("renders the default empty slot with 'No Self Yet' text", () => {
    render(<CompassSelfAvatar variant="empty" />);

    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.getByText("Self Yet")).toBeInTheDocument();
  });

  it("switches the empty slot to the active style with 'Go to Assets'", () => {
    render(<CompassSelfAvatar variant="empty" status="active" />);

    expect(screen.getByText("Go to")).toBeInTheDocument();
    expect(screen.getByText("Assets")).toBeInTheDocument();
  });

  it("renders a plain image with no overlay for variant='self' default status", () => {
    const { container } = render(
      <CompassSelfAvatar variant="self" image="/self.jpg" imageAlt="Jane" />,
    );

    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "/self.jpg");
    expect(img).toHaveAttribute("alt", "Jane");
    expect(img?.className).not.toContain("blur-[4px]");
    expect(screen.queryByText("Go to")).toBeNull();
  });

  it("blurs the image and shows the active overlay label", () => {
    render(
      <CompassSelfAvatar variant="self" status="active" image="/self.jpg" />,
    );

    expect(screen.getByText("Go to")).toBeInTheDocument();
    expect(screen.getByText("Content Studio")).toBeInTheDocument();
  });

  it("shows the error overlay only when status is default", () => {
    render(<CompassSelfAvatar variant="self" error image="/self.jpg" />);

    expect(screen.getByText("Estimate")).toBeInTheDocument();
    expect(screen.getByText("(No experience data)")).toBeInTheDocument();
  });

  it("ignores error when status is active (Figma combination rule)", () => {
    render(
      <CompassSelfAvatar
        variant="self"
        status="active"
        error
        image="/self.jpg"
      />,
    );

    expect(screen.queryByText("Estimate")).toBeNull();
    expect(screen.getByText("Go to")).toBeInTheDocument();
  });

  it("accepts a custom label to replace the default overlay text", () => {
    render(
      <CompassSelfAvatar
        variant="self"
        status="active"
        image="/self.jpg"
        label="Custom Label"
      />,
    );

    expect(screen.getByText("Custom Label")).toBeInTheDocument();
  });

  it("forwards additional props to the root element", () => {
    render(<CompassSelfAvatar data-testid="self-avatar" />);

    expect(screen.getByTestId("self-avatar")).toBeInTheDocument();
  });

  it("reacts to mouse hover on a filled self even without status='active'", () => {
    render(
      <CompassSelfAvatar
        variant="self"
        image="/self.jpg"
        data-testid="self-avatar"
      />,
    );

    expect(screen.queryByText("Go to")).toBeNull();

    fireEvent.mouseEnter(screen.getByTestId("self-avatar"));
    expect(screen.getByText("Go to")).toBeInTheDocument();
    expect(screen.getByText("Content Studio")).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByTestId("self-avatar"));
    expect(screen.queryByText("Go to")).toBeNull();
  });

  it("reacts to mouse hover on an empty slot even without status='active'", () => {
    render(<CompassSelfAvatar variant="empty" data-testid="self-avatar" />);

    fireEvent.mouseEnter(screen.getByTestId("self-avatar"));
    expect(screen.getByText("Go to")).toBeInTheDocument();
    expect(screen.getByText("Assets")).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByTestId("self-avatar"));
    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.getByText("Self Yet")).toBeInTheDocument();
  });

  it("keeps the active look while hovered even if status='active' is later cleared by hover leaving", () => {
    render(
      <CompassSelfAvatar
        variant="self"
        status="active"
        image="/self.jpg"
        data-testid="self-avatar"
      />,
    );

    fireEvent.mouseLeave(screen.getByTestId("self-avatar"));
    expect(screen.getByText("Go to")).toBeInTheDocument();
  });

  describe("variant='potential'", () => {
    it("renders only the avatar image with no ring/connector/badge when growth=0", () => {
      const { container } = render(
        <CompassSelfAvatar variant="potential" growth={0} image="/self.jpg" />,
      );

      expect(container.querySelector("img")).toBeInTheDocument();
      expect(container.querySelector(".border-dashed")).not.toBeInTheDocument();
      expect(screen.queryByText("0%")).toBeNull();
    });

    it("renders a dashed guide ring sized 100 + growth*1.25 px in diameter when growth>0", () => {
      const { container } = render(
        <CompassSelfAvatar
          variant="potential"
          growth={40}
          position={0}
          image="/self.jpg"
        />,
      );

      const ring = container.querySelector(".border-dashed") as HTMLElement;
      expect(ring).toBeInTheDocument();
      expect(ring.style.width).toBe("200px");
      expect(ring.style.height).toBe("200px");
    });

    it("renders the percentage badge rounded from the growth value", () => {
      render(
        <CompassSelfAvatar
          variant="potential"
          growth={33.7}
          position={0}
          image="/self.jpg"
        />,
      );

      expect(screen.getByText("34%")).toBeInTheDocument();
    });

    it("uses the reverse badge variant by default and alarm when isDataCollected=false", () => {
      const { rerender } = render(
        <CompassSelfAvatar
          variant="potential"
          growth={20}
          position={0}
          image="/self.jpg"
        />,
      );

      expect(screen.getByText("20%")).toHaveAttribute(
        "data-variant",
        "reverse",
      );

      rerender(
        <CompassSelfAvatar
          variant="potential"
          growth={20}
          position={0}
          isDataCollected={false}
          image="/self.jpg"
        />,
      );

      expect(screen.getByText("20%")).toHaveAttribute("data-variant", "alarm");
    });

    it("rotates the connector/badge pivot by the position degrees", () => {
      const { container } = render(
        <CompassSelfAvatar
          variant="potential"
          growth={20}
          position={270}
          image="/self.jpg"
        />,
      );

      const pivots = container.querySelectorAll('[style*="rotate(270deg)"]');
      expect(pivots.length).toBeGreaterThan(0);
    });

    it("shows the error overlay when isDataCollected=false and status=default", () => {
      render(
        <CompassSelfAvatar
          variant="potential"
          growth={20}
          position={0}
          isDataCollected={false}
          image="/self.jpg"
        />,
      );

      expect(screen.getByText("Estimate")).toBeInTheDocument();
      expect(screen.getByText("(Lack of Data)")).toBeInTheDocument();
    });

    it("hides the error overlay but keeps the badge's alarm color when status=active", () => {
      render(
        <CompassSelfAvatar
          variant="potential"
          growth={20}
          position={0}
          status="active"
          isDataCollected={false}
          image="/self.jpg"
        />,
      );

      expect(screen.queryByText("Estimate")).toBeNull();
      expect(screen.getByText("20%")).toHaveAttribute("data-variant", "alarm");
    });

    it("unmounts the ring/connector/badge when decorated=false", () => {
      const { container } = render(
        <CompassSelfAvatar
          variant="potential"
          growth={20}
          position={0}
          isDataCollected={false}
          decorated={false}
          image="/self.jpg"
        />,
      );

      expect(screen.queryByText("20%")).toBeNull();
      expect(container.querySelector(".border-dashed")).not.toBeInTheDocument();
    });

    it("forwards additional props to the outer wrapper", () => {
      render(
        <CompassSelfAvatar
          variant="potential"
          data-testid="potential-avatar"
          image="/a.jpg"
        />,
      );

      expect(screen.getByTestId("potential-avatar")).toBeInTheDocument();
    });

    it("wraps the percentage badge in an always-open coachmark tooltip when coachmark is given", () => {
      render(
        <CompassSelfAvatar
          variant="potential"
          growth={80}
          position={0}
          image="/self.jpg"
          coachmark={{
            title: "Growth Potential: 80%",
            description:
              "Start posting to turn this potential into real reach.",
          }}
        />,
      );

      expect(screen.getByRole("tooltip")).toBeInTheDocument();
      expect(screen.getByText("Growth Potential: 80%")).toBeInTheDocument();
    });

    it("does not render a coachmark tooltip when coachmark is not given", () => {
      render(
        <CompassSelfAvatar
          variant="potential"
          growth={80}
          position={0}
          image="/self.jpg"
        />,
      );

      expect(screen.queryByRole("tooltip")).toBeNull();
    });

    it("calls coachmark.onDismiss when the tooltip's close button is clicked", async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn();
      render(
        <CompassSelfAvatar
          variant="potential"
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
});
