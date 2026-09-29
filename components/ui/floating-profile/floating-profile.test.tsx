import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FloatingProfile } from "./floating-profile";

const baseProps = {
  avatarSrc: "https://example.com/avatar.png",
  title: "Data Scientist",
  portraitSrc: "https://example.com/portrait.png",
  timestamp: "2026.03.24 19:24:06",
  tagline: "4 years in finance, 3 in data science.",
  bio: "Bio text.",
};

describe("FloatingProfile", () => {
  it("renders only the avatar bubble when closed", () => {
    render(<FloatingProfile {...baseProps} open={false} />);

    expect(
      screen.getByRole("button", { name: "Data Scientist 프로필 열기" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Edit Assets")).not.toBeInTheDocument();
    expect(screen.queryByText(baseProps.bio)).not.toBeInTheDocument();
  });

  it("renders the full card when open", () => {
    render(<FloatingProfile {...baseProps} open={true} />);

    expect(screen.getByText("Data Scientist")).toBeInTheDocument();
    expect(screen.getByText(baseProps.tagline)).toBeInTheDocument();
    expect(screen.getByText(baseProps.bio)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Edit Assets" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Edit Goal" }),
    ).toBeInTheDocument();
  });

  it("secondary buttons enabled with active tone, CTA labelled 'Create a post'", () => {
    render(<FloatingProfile {...baseProps} open={true} />);

    const editAssets = screen.getByRole("button", { name: "Edit Assets" });
    expect(editAssets).not.toBeDisabled();
    expect(editAssets.className).toContain("bg-[var(--background-default)]");
    expect(
      screen.getByRole("button", { name: "Create a post" }),
    ).toBeInTheDocument();
  });

  it("allows overriding the CTA label explicitly", () => {
    render(
      <FloatingProfile {...baseProps} open={true} ctaLabel="Custom CTA" />,
    );

    expect(
      screen.getByRole("button", { name: "Custom CTA" }),
    ).toBeInTheDocument();
  });

  it("calls onOpenChange(true) when clicking the avatar bubble while closed", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <FloatingProfile
        {...baseProps}
        open={false}
        onOpenChange={onOpenChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Data Scientist 프로필 열기" }),
    );

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("calls onOpenChange(false) when clicking the close button while open", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <FloatingProfile
        {...baseProps}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "닫기" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onCtaClick when the CTA button is clicked", async () => {
    const user = userEvent.setup();
    const onCtaClick = vi.fn();
    render(
      <FloatingProfile {...baseProps} open={true} onCtaClick={onCtaClick} />,
    );

    await user.click(screen.getByRole("button", { name: "Create a post" }));

    expect(onCtaClick).toHaveBeenCalledTimes(1);
  });

  it("calls onShare when the share button is clicked", async () => {
    const user = userEvent.setup();
    const onShare = vi.fn();
    render(<FloatingProfile {...baseProps} open={true} onShare={onShare} />);

    await user.click(screen.getByRole("button", { name: "공유" }));

    expect(onShare).toHaveBeenCalledTimes(1);
  });

  it("renders the icon fallback (no profile) and disables the avatar click when avatarSrc is omitted", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { avatarSrc, ...propsWithoutAvatar } = baseProps;
    render(
      <FloatingProfile
        {...propsWithoutAvatar}
        open={false}
        onOpenChange={onOpenChange}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Data Scientist" });
    expect(trigger).toBeDisabled();
    expect(screen.getByRole("img")).toBeInTheDocument();

    await user.click(trigger);

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.queryByText("Edit Assets")).not.toBeInTheDocument();
  });

  it("forwards additional props to the root element", () => {
    render(
      <FloatingProfile {...baseProps} open={false} data-testid="fp-root" />,
    );

    expect(screen.getByTestId("fp-root")).toBeInTheDocument();
  });
});
