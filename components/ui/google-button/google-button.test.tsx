import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { GoogleButton } from "./google-button";

describe("GoogleButton", () => {
  it("renders the default label", () => {
    render(<GoogleButton />);

    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
  });

  it("renders a custom label", () => {
    render(<GoogleButton label="Google로 계속하기" />);

    expect(screen.getByText("Google로 계속하기")).toBeInTheDocument();
  });

  it("renders the google icon from the /icons.svg sprite", () => {
    render(<GoogleButton />);

    const use = screen.getByRole("button").querySelector("use");
    expect(use).toHaveAttribute("href", "/icons.svg#google-icon");
  });

  it("disables the button when the disabled prop is true", () => {
    render(<GoogleButton disabled />);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("uses the static-gray hover look and static-white hover text", () => {
    render(<GoogleButton />);

    const button = screen.getByRole("button");
    expect(button.className).toContain(
      "hover:bg-[var(--background-static-gray)]",
    );
    expect(button.className).toContain("hover:text-[var(--text-static-white)]");
  });

  it("forwards additional props to the underlying button element", () => {
    render(<GoogleButton data-testid="google-button" />);

    expect(screen.getByTestId("google-button")).toBeInTheDocument();
  });
});
