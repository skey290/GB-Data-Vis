import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Button } from "./button";

describe("Button", () => {
  it("renders children as text content", () => {
    render(<Button>Click me</Button>);

    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("defaults to the primary variant", () => {
    render(<Button>Primary</Button>);

    const button = screen.getByText("Primary");
    expect(button.className).toContain("bg-primary");
  });

  it.each([
    ["primary", "bg-primary"],
    ["mute", "background-subtler"],
    ["outline", "border-border"],
    ["link", "underline"],
  ] as const)(
    "renders the %s variant with expected classes",
    (variant, expectedClass) => {
      render(<Button variant={variant}>{variant}</Button>);

      const button = screen.getByText(variant);
      expect(button.className).toContain(expectedClass);
    },
  );

  it("renders a lucide-react icon for icon ids registered in LUCIDE_SPRITE_MAP", () => {
    render(<Button variant="icon" icon="search-icon" />);

    const button = screen.getByRole("button", { name: "search-icon" });

    expect(button.querySelector("use")).not.toBeInTheDocument();
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("falls back to the circle-dashed-icon placeholder (lucide) when no icon id is given", () => {
    render(<Button variant="ghost" />);

    const button = screen.getByRole("button", { name: "circle-dashed-icon" });

    expect(button.querySelector("use")).not.toBeInTheDocument();
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("falls back to the /icons.svg sprite for app-specific icon ids outside LUCIDE_SPRITE_MAP", () => {
    render(<Button variant="icon" icon="google-icon" />);

    const button = screen.getByRole("button", { name: "google-icon" });
    const use = button.querySelector("use");

    expect(use).toHaveAttribute("href", "/icons.svg#google-icon");
  });

  it("disables the button when the disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);

    expect(screen.getByText("Disabled")).toBeDisabled();
  });

  it("applies the mute-subtle underline decoration color on the link variant", () => {
    render(<Button variant="link">Link</Button>);

    const button = screen.getByText("Link");
    expect(button.className).toContain(
      "decoration-[var(--gb-border-mute-subtle)]",
    );
  });

  it("forwards additional props to the underlying button element", () => {
    render(<Button data-testid="custom-button">Custom</Button>);

    expect(screen.getByTestId("custom-button")).toBeInTheDocument();
  });

  it("forwards ref to the underlying button element", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Button ref={ref}>Ref</Button>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it.each(["ghost", "icon-rounded"] as const)(
    "renders the %s variant without visible text content",
    (variant) => {
      render(<Button variant={variant} icon="plus-icon" />);

      expect(
        screen.getByRole("button", { name: "plus-icon" }),
      ).toBeInTheDocument();
    },
  );

  it("disables the mute variant", () => {
    render(
      <Button variant="mute" disabled>
        Mute disabled
      </Button>,
    );

    expect(screen.getByText("Mute disabled")).toBeDisabled();
  });
});
