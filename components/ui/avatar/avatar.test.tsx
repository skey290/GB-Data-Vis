import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { Avatar } from "./avatar";

describe("Avatar", () => {
  it("defaults to the icon variant (circle shape) when no src/initials are given", () => {
    render(<Avatar />);

    const avatar = screen.getByRole("img");
    expect(avatar.querySelector("svg")).toBeInTheDocument();
    expect(avatar.className).toContain("rounded-[var(--radius-scale-full)]");
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
    const { container } = render(
      <Avatar
        variant="image"
        src="https://example.com/broken.png"
        initials="S"
      />,
    );

    // 기본 alt=""인 <img>는 접근성 role이 "presentation"이 되어(장식 이미지
    // 규칙) getByRole("img")로 찾을 수 없습니다 — role과 무관하게 실제 DOM
    // 태그로 직접 찾아 error 이벤트를 발생시킵니다.
    const image = container.querySelector("img") as HTMLImageElement;
    fireEvent.error(image);

    expect(screen.getByText("S")).toBeInTheDocument();
  });

  it("applies the background/border tokens for the icon/initial placeholder variants", () => {
    render(<Avatar variant="icon" />);

    const avatar = screen.getByRole("img");
    expect(avatar.className).toContain("border-[var(--border-subtle)]");
    expect(avatar.className).toContain("bg-[var(--background-default)]");
  });

  it("applies the shape prop as the radius token (rounded/rectangle/circle)", () => {
    const { rerender } = render(<Avatar variant="icon" shape="rounded" />);
    expect(screen.getByRole("img").className).toContain(
      "rounded-[var(--radius-scale-md)]",
    );

    rerender(<Avatar variant="icon" shape="rectangle" />);
    expect(screen.getByRole("img").className).toContain(
      "rounded-[var(--radius-scale-none)]",
    );

    rerender(<Avatar variant="icon" shape="circle" />);
    expect(screen.getByRole("img").className).toContain(
      "rounded-[var(--radius-scale-full)]",
    );
  });

  it("forwards additional props to the underlying div", () => {
    render(<Avatar variant="icon" data-testid="custom-avatar" />);

    expect(screen.getByTestId("custom-avatar")).toBeInTheDocument();
  });
});
