import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CompassToolbar } from "./compass-toolbar";

const toggleOptions = [
  { value: "home", label: "Home" },
  { value: "analysis", label: "Analysis" },
] as const;

const selectOptions = [{ value: "all-self", label: "All 'Self'" }];

describe("CompassToolbar", () => {
  it("renders both toggle options as radios", () => {
    render(
      <CompassToolbar
        toggleOptions={toggleOptions}
        toggleValue="home"
        selectOptions={selectOptions}
      />,
    );

    expect(screen.getByRole("radio", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Analysis" })).toBeInTheDocument();
  });

  it("marks the option matching toggleValue as checked", () => {
    render(
      <CompassToolbar
        toggleOptions={toggleOptions}
        toggleValue="analysis"
        selectOptions={selectOptions}
      />,
    );

    expect(screen.getByRole("radio", { name: "Analysis" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "Home" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("calls onToggleValueChange when an unselected option is clicked", async () => {
    const user = userEvent.setup();
    const onToggleValueChange = vi.fn();
    render(
      <CompassToolbar
        toggleOptions={toggleOptions}
        toggleValue="home"
        onToggleValueChange={onToggleValueChange}
        selectOptions={selectOptions}
      />,
    );

    await user.click(screen.getByRole("radio", { name: "Analysis" }));

    expect(onToggleValueChange).toHaveBeenCalledWith("analysis");
  });

  it("renders the reused Select trigger with the given select value", () => {
    render(
      <CompassToolbar
        toggleOptions={toggleOptions}
        toggleValue="home"
        selectOptions={selectOptions}
        selectValue="all-self"
      />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("All 'Self'");
  });

  it("omits the Select entirely when selectOptions is not provided (Analysis mode)", () => {
    render(
      <CompassToolbar toggleOptions={toggleOptions} toggleValue="analysis" />,
    );

    expect(screen.queryByRole("combobox")).toBeNull();
  });
});
