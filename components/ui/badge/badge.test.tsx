import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Badge } from "./badge";

describe("Badge", () => {
  it("renders children as text content", () => {
    render(<Badge>3</Badge>);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("defaults to the outline variant and size 20", () => {
    render(<Badge>Outline</Badge>);

    const badge = screen.getByText("Outline");
    expect(badge.className).toContain("text-[var(--text-subtle)]");
    expect(badge.className).toContain("h-[20px]");
  });

  it.each([
    ["default", "bg-[var(--background-bold)]"],
    ["reverse", "bg-[var(--background-default)]"],
    ["outline", "text-[var(--text-subtle)]"],
    ["disabled", "bg-[var(--background-disabled)]"],
    ["alarm", "text-[var(--text-warning)]"],
    ["success", "text-[var(--text-success)]"],
    ["destructive", "bg-[var(--background-error-default)]"],
  ] as const)(
    "renders the %s variant with expected classes",
    (variant, expectedClass) => {
      render(<Badge variant={variant}>{variant}</Badge>);

      const badge = screen.getByText(variant);
      expect(badge.className).toContain(expectedClass);
    },
  );

  it("uses semibold typography only for the destructive variant", () => {
    render(<Badge variant="destructive">Destructive</Badge>);
    render(<Badge variant="default">Default</Badge>);

    expect(screen.getByText("Destructive").className).toContain(
      "text-xs-semi-bold",
    );
    expect(screen.getByText("Default").className).toContain("text-xs-medium");
  });

  it.each([
    ["20", "h-[20px]"],
    ["28", "h-[28px]"],
  ] as const)(
    "renders size %s with expected height class",
    (size, expectedClass) => {
      render(
        <Badge size={size} variant="default">
          Sized
        </Badge>,
      );

      expect(screen.getAllByText("Sized")[0].className).toContain(
        expectedClass,
      );
    },
  );

  it("renders the icon slot when provided", () => {
    render(
      <Badge icon={<svg data-testid="badge-icon" />} variant="default">
        With icon
      </Badge>,
    );

    expect(screen.getByTestId("badge-icon")).toBeInTheDocument();
  });

  it("does not render an icon wrapper when icon is omitted", () => {
    const { container } = render(<Badge variant="default">No icon</Badge>);

    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it("forwards additional props to the underlying span", () => {
    render(<Badge data-testid="custom-badge">Custom</Badge>);

    expect(screen.getByTestId("custom-badge")).toBeInTheDocument();
  });
});
