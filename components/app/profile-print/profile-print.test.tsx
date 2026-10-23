import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProfilePrint } from "./profile-print";

const PORTRAIT_SRC = "https://example.com/portrait.png";

describe("ProfilePrint", () => {
  it("defaults to the process type: shimmer loader + Processing badge", () => {
    render(<ProfilePrint />);

    expect(screen.getByText("Processing")).toBeInTheDocument();
    expect(screen.getByText("2026.03.24 19:24:06")).toBeInTheDocument();
  });

  it("renders the portrait photo and timestamp when completed", () => {
    render(
      <ProfilePrint
        type="completed"
        portraitSrc={PORTRAIT_SRC}
        portraitAlt="portrait"
      />,
    );

    expect(screen.getByAltText("portrait")).toHaveAttribute(
      "src",
      PORTRAIT_SRC,
    );
    expect(screen.getByText("2026.03.24 19:24:06")).toBeInTheDocument();
    expect(screen.queryByText("Processing")).not.toBeInTheDocument();
  });

  it("renders the empty-state CTA copy and 'Gabrielle.ai' watermark when upload", () => {
    render(<ProfilePrint type="upload" />);

    expect(
      screen.getByText("Let's create your brand image!"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Open your folder" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Gabrielle.ai")).toBeInTheDocument();
  });

  it("allows overriding the timestamp text", () => {
    render(<ProfilePrint type="completed" timestamp="2099.01.01 00:00:00" />);

    expect(screen.getByText("2099.01.01 00:00:00")).toBeInTheDocument();
  });

  it("renders the Update this image hover overlay (hidden by default via CSS)", () => {
    render(
      <ProfilePrint
        type="completed"
        portraitSrc={PORTRAIT_SRC}
        portraitAlt="portrait"
      />,
    );

    expect(screen.getByText("Update this image")).toBeInTheDocument();
    expect(
      screen.getByText("Make a quick change to keep it current and sharp."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Edit Asset Image" }),
    ).toBeInTheDocument();
  });

  it("marks the hover overlay with data-image-hover when imageHover is true", () => {
    const { container } = render(
      <ProfilePrint type="completed" portraitSrc={PORTRAIT_SRC} imageHover />,
    );

    expect(container.querySelector("[data-image-hover]")).toBeInTheDocument();
  });

  it("does not set data-image-hover by default", () => {
    const { container } = render(
      <ProfilePrint type="completed" portraitSrc={PORTRAIT_SRC} />,
    );

    expect(container.querySelector("[data-image-hover]")).toBeNull();
  });

  it("calls onEditImage when the hover overlay's 'Edit Asset Image' button is clicked", async () => {
    const user = userEvent.setup();
    const onEditImage = vi.fn();
    render(
      <ProfilePrint
        type="completed"
        portraitSrc={PORTRAIT_SRC}
        onEditImage={onEditImage}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit Asset Image" }));

    expect(onEditImage).toHaveBeenCalledTimes(1);
  });

  it("does not render the empty-state background image unless emptyStateBackgroundSrc is provided", () => {
    render(<ProfilePrint type="upload" />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders the empty-state background image when emptyStateBackgroundSrc is provided", () => {
    render(
      <ProfilePrint
        type="upload"
        emptyStateBackgroundSrc="https://example.com/texture.png"
        emptyStateBackgroundAlt="background texture"
      />,
    );

    expect(screen.getByAltText("background texture")).toHaveAttribute(
      "src",
      "https://example.com/texture.png",
    );
  });

  it("triggers the hidden file input when 'Open your folder' is clicked", async () => {
    const user = userEvent.setup();
    render(<ProfilePrint type="upload" />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const clickSpy = vi.fn();
    fileInput.addEventListener("click", clickSpy);

    await user.click(screen.getByRole("button", { name: "Open your folder" }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("calls onFileSelect with the chosen file", async () => {
    const user = userEvent.setup();
    const onFileSelect = vi.fn();
    render(<ProfilePrint type="upload" onFileSelect={onFileSelect} />);

    const file = new File(["hello"], "photo.png", { type: "image/png" });
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    await user.upload(fileInput, file);

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it("forwards additional props to the root element", () => {
    render(<ProfilePrint data-testid="profile-print-root" />);

    expect(screen.getByTestId("profile-print-root")).toBeInTheDocument();
  });
});
