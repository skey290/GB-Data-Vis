import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Avatar } from "./avatar";

describe("Avatar", () => {
  it("defaults to the icon variant when no src/initials are given", () => {
    render(<Avatar />);

    const avatar = screen.getByRole("img");
    expect(avatar.querySelector("svg")).toBeInTheDocument();
  });

  it("renders initials for the initial variant", () => {
    render(<Avatar variant="initial" initials="S" />);

    expect(screen.getByText("S")).toBeInTheDocument();
  });

  it("falls back from initial to icon when no initials are provided", () => {
    render(<Avatar variant="initial" />);

    const avatar = screen.getByRole("img");
    expect(avatar.querySelector("svg")).toBeInTheDocument();
  });

  it("renders an image for the image variant", () => {
    render(
      <Avatar
        variant="image"
        src="https://example.com/avatar.png"
        alt="사용자"
      />,
    );

    const image = screen.getByAltText("사용자");
    expect(image.tagName).toBe("IMG");
    expect(image).toHaveAttribute("src", "https://example.com/avatar.png");
  });

  it("falls back from image to icon when no src is provided", () => {
    render(<Avatar variant="image" />);

    const avatar = screen.getByRole("img");
    expect(avatar.querySelector("svg")).toBeInTheDocument();
  });

  it("falls back from image to initials when the image fails to load and initials are set", () => {
    render(
      <Avatar
        variant="image"
        src="https://example.com/broken.png"
        initials="S"
      />,
    );

    const image = screen.getByRole("img", { hidden: true }) as HTMLImageElement;
    image.dispatchEvent(new Event("error"));

    expect(screen.getByText("S")).toBeInTheDocument();
  });

  it("applies border-muted classes for the icon/initial placeholder variants", () => {
    render(<Avatar variant="icon" />);

    expect(screen.getByRole("img").className).toContain("border-muted");
  });

  it("forwards additional props to the underlying div", () => {
    render(<Avatar variant="icon" data-testid="custom-avatar" />);

    expect(screen.getByTestId("custom-avatar")).toBeInTheDocument();
  });
});
