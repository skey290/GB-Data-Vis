import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CompassAnalysisMenu } from "./compass-analysis-menu";

describe("CompassAnalysisMenu", () => {
  it("renders all four submenu items with their labels", () => {
    render(<CompassAnalysisMenu value="growth-potential" />);

    expect(screen.getByText("Growth Potential")).toBeInTheDocument();
    expect(screen.getByText("Reach")).toBeInTheDocument();
    expect(screen.getByText("Engagement")).toBeInTheDocument();
    expect(screen.getByText("Ranking")).toBeInTheDocument();
  });

  it("marks only the item matching value as pressed", () => {
    render(<CompassAnalysisMenu value="engagement" />);

    expect(screen.getByRole("button", { name: "Engagement" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Reach" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("calls onValueChange with the clicked item's value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <CompassAnalysisMenu
        value="growth-potential"
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Ranking" }));

    expect(onValueChange).toHaveBeenCalledWith("ranking");
  });

  it("does not call onValueChange when the already-selected item is clicked", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<CompassAnalysisMenu value="reach" onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: "Reach" }));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("disables every item when disabled=true", () => {
    render(<CompassAnalysisMenu value="reach" disabled />);

    expect(screen.getByRole("button", { name: "Reach" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Growth Potential" }),
    ).toBeDisabled();
  });
});
