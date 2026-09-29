import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ButtonGroup } from "./button-group";

describe("ButtonGroup", () => {
  it("renders children", () => {
    render(
      <ButtonGroup>
        <button>First</button>
        <button>Second</button>
      </ButtonGroup>,
    );

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("defaults to horizontal orientation and gap 2", () => {
    render(
      <ButtonGroup data-testid="group">
        <button>Only</button>
      </ButtonGroup>,
    );

    const group = screen.getByTestId("group");
    expect(group.className).toContain("flex-row");
    expect(group.className).toContain("gap-[var(--spacing-2)]");
  });

  it("renders the vertical orientation with items stretched", () => {
    render(
      <ButtonGroup orientation="vertical" data-testid="group">
        <button>Only</button>
      </ButtonGroup>,
    );

    const group = screen.getByTestId("group");
    expect(group.className).toContain("flex-col");
    expect(group.className).toContain("items-stretch");
  });

  it.each([
    ["1-5", "gap-[var(--spacing-1-5)]"],
    ["2", "gap-[var(--spacing-2)]"],
    ["2-5", "gap-[var(--spacing-2-5)]"],
    ["3", "gap-[var(--spacing-3)]"],
  ] as const)(
    "renders the %s gap with expected class",
    (gap, expectedClass) => {
      render(
        <ButtonGroup gap={gap} data-testid="group">
          <button>Only</button>
        </ButtonGroup>,
      );

      expect(screen.getByTestId("group").className).toContain(expectedClass);
    },
  );

  it("forwards additional props to the underlying div element", () => {
    render(
      <ButtonGroup data-testid="custom-group">
        <button>Only</button>
      </ButtonGroup>,
    );

    expect(screen.getByTestId("custom-group")).toBeInTheDocument();
  });

  it("injects disabled into every child when the group disabled prop is true", () => {
    render(
      <ButtonGroup disabled>
        <button>First</button>
        <button>Second</button>
      </ButtonGroup>,
    );

    expect(screen.getByText("First")).toBeDisabled();
    expect(screen.getByText("Second")).toBeDisabled();
  });

  it("leaves children enabled when the group disabled prop is false or omitted", () => {
    render(
      <ButtonGroup>
        <button>First</button>
      </ButtonGroup>,
    );

    expect(screen.getByText("First")).not.toBeDisabled();
  });
});
