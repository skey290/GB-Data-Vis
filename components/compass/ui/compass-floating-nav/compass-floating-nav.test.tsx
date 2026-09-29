import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { CompassFloatingNav } from "./compass-floating-nav";

describe("CompassFloatingNav", () => {
  it("renders Home as an icon-only tab and marks the active item", () => {
    render(<CompassFloatingNav activeId="compass" />);

    expect(screen.getByRole("tab", { name: "Home" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(screen.getByRole("tab", { name: "Compass" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Assets" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(screen.getByRole("tab", { name: "Content Studio" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("calls onItemSelect with the clicked item's id", () => {
    const onItemSelect = vi.fn();
    render(
      <CompassFloatingNav activeId="compass" onItemSelect={onItemSelect} />,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Assets" }));
    expect(onItemSelect).toHaveBeenCalledWith("assets");

    fireEvent.click(screen.getByRole("tab", { name: "Home" }));
    expect(onItemSelect).toHaveBeenCalledWith("home");
  });

  it("disables every tab and clears the active highlight when disabled", () => {
    const onItemSelect = vi.fn();
    render(
      <CompassFloatingNav
        activeId="compass"
        disabled
        onItemSelect={onItemSelect}
      />,
    );

    expect(screen.getByRole("tab", { name: "Compass" })).toBeDisabled();
    expect(screen.getByRole("tab", { name: "Compass" })).toHaveAttribute(
      "aria-selected",
      "false",
    );

    fireEvent.click(screen.getByRole("tab", { name: "Compass" }));
    expect(onItemSelect).not.toHaveBeenCalled();
  });
});
