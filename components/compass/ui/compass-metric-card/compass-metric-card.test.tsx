import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CompassMetricCard } from "./compass-metric-card";

describe("CompassMetricCard", () => {
  it("renders title and badge", () => {
    render(
      <CompassMetricCard
        title="Growth Potential"
        badgeLabel="Become Recommended"
      >
        <p>80%</p>
      </CompassMetricCard>,
    );

    expect(screen.getByText("Growth Potential")).toBeInTheDocument();
    expect(screen.getByText("Become Recommended")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("renders the description paragraph for state='default'", () => {
    render(
      <CompassMetricCard
        title="Growth Potential"
        badgeLabel="Become Recommended"
        description="설명 문단"
      >
        <p>80%</p>
      </CompassMetricCard>,
    );

    expect(screen.getByText("설명 문단")).toBeInTheDocument();
  });

  it("renders the footer link by default", () => {
    render(
      <CompassMetricCard
        title="Growth Potential"
        badgeLabel="Become Recommended"
      >
        <p>80%</p>
      </CompassMetricCard>,
    );

    expect(screen.getByText("Update in Know thyself")).toBeInTheDocument();
  });

  it("uses a custom footer link label when provided", () => {
    render(
      <CompassMetricCard
        title="Growth Potential"
        badgeLabel="Become Recommended"
        footerLinkLabel="Custom link"
      >
        <p>80%</p>
      </CompassMetricCard>,
    );

    expect(screen.getByText("Custom link")).toBeInTheDocument();
  });

  it("calls onFooterLinkClick when the footer link is clicked", async () => {
    const onFooterLinkClick = vi.fn();
    render(
      <CompassMetricCard
        title="Growth Potential"
        badgeLabel="Become Recommended"
        onFooterLinkClick={onFooterLinkClick}
      >
        <p>80%</p>
      </CompassMetricCard>,
    );

    await userEvent.click(screen.getByText("Update in Know thyself"));
    expect(onFooterLinkClick).toHaveBeenCalledTimes(1);
  });

  it("adds the warning border for state='warning'", () => {
    const { container } = render(
      <CompassMetricCard
        title="Growth Potential"
        badgeLabel="Become Recommended"
        state="warning"
      >
        <p>20%</p>
      </CompassMetricCard>,
    );

    expect(container.firstElementChild?.className).toContain(
      "border-[var(--border-warning)]",
    );
  });

  it("omits the border for state='default' and state='error'", () => {
    const { container: defaultContainer } = render(
      <CompassMetricCard
        title="Growth Potential"
        badgeLabel="Become Recommended"
      >
        <p>80%</p>
      </CompassMetricCard>,
    );
    const { container: errorContainer } = render(
      <CompassMetricCard
        title="Growth Potential"
        badgeLabel="Become Recommended"
        state="error"
      >
        <p>Error</p>
      </CompassMetricCard>,
    );

    expect(defaultContainer.firstElementChild?.className).not.toContain(
      "border-[var(--border-warning)]",
    );
    expect(errorContainer.firstElementChild?.className).not.toContain(
      "border-[var(--border-warning)]",
    );
  });

  it("always hides the footer link for state='error'", () => {
    render(
      <CompassMetricCard
        title="Growth Potential"
        badgeLabel="Become Recommended"
        description="설명 문단"
        state="error"
      >
        <p>We couldn&apos;t fetch your data</p>
      </CompassMetricCard>,
    );

    expect(
      screen.queryByText("Update in Know thyself"),
    ).not.toBeInTheDocument();
  });

  it("keeps rendering the description in state='error' when one is provided (Qualified Reach/Engagement Intensity real usage)", () => {
    render(
      <CompassMetricCard
        title="Qualified Reach"
        badgeLabel="Become Known"
        description="설명 문단"
        state="error"
      >
        <p>We couldn&apos;t fetch your data</p>
      </CompassMetricCard>,
    );

    expect(screen.getByText("설명 문단")).toBeInTheDocument();
  });

  it("omits the description in state='error' when none is provided (Growth Potential real usage)", () => {
    render(
      <CompassMetricCard
        title="Growth Potential"
        badgeLabel="Become Recommended"
        state="error"
      >
        <p>We couldn&apos;t fetch your data</p>
      </CompassMetricCard>,
    );

    expect(screen.queryByText("설명 문단")).not.toBeInTheDocument();
  });

  it("right-aligns the footer link wrapper (bug fix — was center-aligned, Figma coords prove right-aligned)", () => {
    render(
      <CompassMetricCard
        title="Growth Potential"
        badgeLabel="Become Recommended"
      >
        <p>80%</p>
      </CompassMetricCard>,
    );

    const link = screen.getByText("Update in Know thyself");
    const wrapper = link.parentElement;

    expect(wrapper?.className).toContain("items-end");
    expect(wrapper?.className).not.toContain("items-center");
  });

  it("gives the footer link a different hover color than its default color (bug fix — both used to resolve to --text-subtle, so hover looked broken)", () => {
    render(
      <CompassMetricCard
        title="Growth Potential"
        badgeLabel="Become Recommended"
      >
        <p>80%</p>
      </CompassMetricCard>,
    );

    const link = screen.getByText("Update in Know thyself");

    expect(link.className).toContain("text-[var(--text-subtle)]");
    expect(link.className).toContain("hover:text-[var(--text-emphasis)]");
  });

  it("forwards additional props to the root element", () => {
    render(
      <CompassMetricCard
        title="Growth Potential"
        badgeLabel="Become Recommended"
        data-testid="metric-card"
      >
        <p>80%</p>
      </CompassMetricCard>,
    );

    expect(screen.getByTestId("metric-card")).toBeInTheDocument();
  });
});
