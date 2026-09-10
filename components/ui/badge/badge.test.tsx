import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Badge } from "./badge";

describe("Badge", () => {
  it("renders children as text content", () => {
    render(<Badge>3</Badge>);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("defaults to the outline variant", () => {
    render(<Badge>Outline</Badge>);

    const badge = screen.getByText("Outline");
    expect(badge.className).toContain("border-border");
  });

  it.each([
    ["outline", "border-border"],
    ["default", "bg-primary"],
    ["secondary", "bg-secondary"],
    ["destructive", "bg-destructive"],
  ] as const)(
    "renders the %s variant with expected classes",
    (variant, expectedClass) => {
      render(<Badge variant={variant}>{variant}</Badge>);

      const badge = screen.getByText(variant);
      expect(badge.className).toContain(expectedClass);
    },
  );

  it("forwards additional props to the underlying span", () => {
    render(<Badge data-testid="custom-badge">Custom</Badge>);

    expect(screen.getByTestId("custom-badge")).toBeInTheDocument();
  });
});
