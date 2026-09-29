import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CompassDetailView } from "./compass-detail-view";

describe("CompassDetailView", () => {
  it("renders the default tab title and CTA button", () => {
    render(<CompassDetailView />);

    expect(screen.getByText("Data Scientist")).toBeInTheDocument();
    expect(screen.getByText("Create Posts with one click")).toBeInTheDocument();
  });

  it("renders all three metric card titles", () => {
    render(<CompassDetailView />);

    expect(screen.getByText("Growth Potential")).toBeInTheDocument();
    expect(screen.getByText("Qualified Reach")).toBeInTheDocument();
    expect(screen.getByText("Engagement Intensity")).toBeInTheDocument();
  });

  it("shows the growth percent hero for type='default'", () => {
    render(<CompassDetailView type="default" />);

    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("shows the empty state for Reach/Engagement on type='default'", () => {
    render(<CompassDetailView type="default" />);

    expect(screen.getAllByText("Not Enough posts Yet")).toHaveLength(2);
  });

  it("shows real post stats for Reach/Engagement on type='bls'", () => {
    render(<CompassDetailView type="bls" />);

    expect(screen.getByText("Most Reached Post")).toBeInTheDocument();
    expect(screen.getByText("8,340")).toBeInTheDocument();
    expect(screen.getByText("Most Engaged Post")).toBeInTheDocument();
    expect(screen.getByText("14.3%")).toBeInTheDocument();
    expect(screen.queryByText("Not Enough posts Yet")).not.toBeInTheDocument();
  });

  it("shows real post stats for Reach/Engagement on type='trend-data'", () => {
    render(<CompassDetailView type="trend-data" />);

    expect(screen.getByText("Most Reached Post")).toBeInTheDocument();
    expect(screen.getByText("Most Engaged Post")).toBeInTheDocument();
  });

  it("uses '20%' growth percent and lower-confidence copy for type='niche-data'", () => {
    render(<CompassDetailView type="niche-data" />);

    expect(screen.getByText("20%")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Data is too new or niche to measure growth yet, so we're showing a neutral estimate.",
      ),
    ).toBeInTheDocument();
  });

  it("adds the warning border only to the Growth Potential card for type='niche-data'", () => {
    const { container } = render(<CompassDetailView type="niche-data" />);

    const warningBordered = container.querySelectorAll(
      '[class*="border-\\[var\\(--border-warning\\)\\]"]',
    );
    expect(warningBordered).toHaveLength(1);
  });

  it("adds the warning border for type='no-experience' too, with '20%'", () => {
    const { container } = render(<CompassDetailView type="no-experience" />);

    expect(screen.getByText("20%")).toBeInTheDocument();
    expect(
      container.querySelectorAll(
        '[class*="border-\\[var\\(--border-warning\\)\\]"]',
      ),
    ).toHaveLength(1);
  });

  it("does not add a warning border for type='default'/'bls'/'trend-data'", () => {
    for (const type of ["default", "bls", "trend-data"] as const) {
      const { container } = render(<CompassDetailView type={type} />);
      expect(
        container.querySelectorAll(
          '[class*="border-\\[var\\(--border-warning\\)\\]"]',
        ),
      ).toHaveLength(0);
    }
  });

  it("uses the 'Vintage Fashion' tab title and 'Content Trend' label for type='trend-data'", () => {
    render(<CompassDetailView type="trend-data" />);

    expect(screen.getByText("Vintage Fashion")).toBeInTheDocument();
    expect(screen.getByText("Content Trend")).toBeInTheDocument();
  });

  it("replaces all three cards with the fetch-error box for type='error'", () => {
    render(<CompassDetailView type="error" />);

    expect(screen.getAllByText("We couldn't fetch your data")).toHaveLength(3);
    expect(screen.getAllByText("Retry")).toHaveLength(3);
    expect(screen.queryByText("80%")).not.toBeInTheDocument();
  });

  it("omits the Growth Potential description for type='error' but keeps Reach/Engagement descriptions", () => {
    render(<CompassDetailView type="error" />);

    expect(
      screen.queryByText(
        "It reflects how promising your career background is, based on 'official U.S. labor statistics' and your experience.",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "An estimate of how many people your content actually reached, not just how many times it was shown.",
      ),
    ).toBeInTheDocument();
  });

  it("styles the CTA button with the error-specific tokens instead of using Button's disabled prop for type='error'", () => {
    render(<CompassDetailView type="error" />);

    const cta = screen.getByText("Create Posts with one click");
    expect(cta.className).toContain("bg-[var(--background-selected)]");
    expect(cta.className).toContain("text-[var(--text-subtler)]");
    // Figma의 error CTA 색은 --background-disabled/--text-static-gray가 아니라
    // --background-selected/--text-subtler라 Button의 `disabled` html 속성을
    // 쓰지 않는다 — 실제로 비활성화(disabled attribute)되지 않았는지 확인.
    expect(cta).not.toBeDisabled();
    expect(cta.getAttribute("aria-disabled")).toBe("true");
  });

  it("calls onCreatePostsClick when the CTA button is clicked", async () => {
    const onCreatePostsClick = vi.fn();
    render(<CompassDetailView onCreatePostsClick={onCreatePostsClick} />);

    await userEvent.click(screen.getByText("Create Posts with one click"));
    expect(onCreatePostsClick).toHaveBeenCalledTimes(1);
  });

  it("calls onRetry when any of the three Retry buttons is clicked", async () => {
    const onRetry = vi.fn();
    render(<CompassDetailView type="error" onRetry={onRetry} />);

    const retryButtons = screen.getAllByText("Retry");
    await userEvent.click(retryButtons[1]);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("calls the per-card footer link handlers", async () => {
    const onGrowthFooterClick = vi.fn();
    const onReachFooterClick = vi.fn();
    const onEngagementFooterClick = vi.fn();
    render(
      <CompassDetailView
        onGrowthFooterClick={onGrowthFooterClick}
        onReachFooterClick={onReachFooterClick}
        onEngagementFooterClick={onEngagementFooterClick}
      />,
    );

    const links = screen.getAllByText("Update in Know thyself");
    expect(links).toHaveLength(3);

    await userEvent.click(links[0]);
    expect(onGrowthFooterClick).toHaveBeenCalledTimes(1);

    await userEvent.click(links[1]);
    expect(onReachFooterClick).toHaveBeenCalledTimes(1);

    await userEvent.click(links[2]);
    expect(onEngagementFooterClick).toHaveBeenCalledTimes(1);
  });

  it("hides all footer links for type='error'", () => {
    render(<CompassDetailView type="error" />);

    expect(
      screen.queryByText("Update in Know thyself"),
    ).not.toBeInTheDocument();
  });

  it("accepts a custom title overriding the type-based default", () => {
    render(<CompassDetailView title="Custom Title" />);

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.queryByText("Data Scientist")).not.toBeInTheDocument();
  });

  it("renders provided growth override values instead of the type default", () => {
    render(
      <CompassDetailView
        growthPercent="55%"
        growthIndustryDetail="Custom industry detail"
        growthExperienceYears="5 years"
      />,
    );

    expect(screen.getByText("55%")).toBeInTheDocument();
    expect(screen.getByText("Custom industry detail")).toBeInTheDocument();
    expect(screen.getByText("5 years")).toBeInTheDocument();
  });

  it("renders custom reachStats/engagementStats when provided", () => {
    render(
      <CompassDetailView
        type="bls"
        reachStats={[{ label: "Custom Reach Stat", value: "1,234" }]}
        engagementStats={[{ label: "Custom Engagement Stat", value: "9.9%" }]}
      />,
    );

    expect(screen.getByText("Custom Reach Stat")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.getByText("Custom Engagement Stat")).toBeInTheDocument();
    expect(screen.getByText("9.9%")).toBeInTheDocument();
  });

  it("shows the engagement footnote only for the stat group (bls/trend-data)", () => {
    const { unmount } = render(<CompassDetailView type="bls" />);
    expect(
      screen.getByText(
        "Can go above 100% — comments and shares count more than likes.",
      ),
    ).toBeInTheDocument();
    unmount();

    render(<CompassDetailView type="default" />);
    expect(
      screen.queryByText(
        "Can go above 100% — comments and shares count more than likes.",
      ),
    ).not.toBeInTheDocument();
  });

  it("forwards additional props to the root element", () => {
    render(<CompassDetailView data-testid="detail-view" />);

    expect(screen.getByTestId("detail-view")).toBeInTheDocument();
  });
});
