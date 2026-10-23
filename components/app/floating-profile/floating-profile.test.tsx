import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FloatingProfile } from "./floating-profile";

const baseProps = {
  avatarSrc: "https://example.com/avatar.png",
  title: "Data Scientist",
  portraitSrc: "https://example.com/portrait.png",
  timestamp: "2026.03.24 19:24:06",
  now: "I'm known for financial modeling and data analysis in early-stage startups.",
  goal: "I'm known for Finance-Fluent Modeling Partner for early-stage SaaS founders.",
};

describe("FloatingProfile", () => {
  it("renders only the avatar bubble when closed", () => {
    render(<FloatingProfile {...baseProps} open={false} />);

    expect(
      screen.getByRole("button", { name: "Data Scientist 프로필 열기" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Known for Now")).not.toBeInTheDocument();
    expect(screen.queryByText(baseProps.goal)).not.toBeInTheDocument();
  });

  it("renders the full card when open", () => {
    render(<FloatingProfile {...baseProps} open={true} />);

    expect(screen.getByText("Data Scientist")).toBeInTheDocument();
    expect(screen.getByText("Known for Now")).toBeInTheDocument();
    expect(screen.getByText("Known for Next")).toBeInTheDocument();
    expect(screen.getByText(baseProps.now)).toBeInTheDocument();
    expect(screen.getByText(baseProps.goal)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create a post" }),
    ).toBeInTheDocument();
  });

  it("renders only one pencil button, next to Known for Now", () => {
    render(<FloatingProfile {...baseProps} open={true} />);

    expect(
      screen.getByRole("button", { name: "Known for Now 편집" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Known for Next 편집" }),
    ).not.toBeInTheDocument();
  });

  it("calls onEditGoal when the pencil button is clicked", async () => {
    const user = userEvent.setup();
    const onEditGoal = vi.fn();
    render(
      <FloatingProfile {...baseProps} open={true} onEditGoal={onEditGoal} />,
    );

    await user.click(
      screen.getByRole("button", { name: "Known for Now 편집" }),
    );

    expect(onEditGoal).toHaveBeenCalledTimes(1);
  });

  it("renders the default Settings sentence under Known for Next", () => {
    render(<FloatingProfile {...baseProps} open={true} />);

    expect(screen.getByText("I post")).toBeInTheDocument();
    expect(screen.getByText("3 times a day")).toBeInTheDocument();
    expect(screen.getByText("5,000")).toBeInTheDocument();
    expect(screen.getByText("1 year")).toBeInTheDocument();
  });

  it("allows overriding the CTA label explicitly", () => {
    render(
      <FloatingProfile {...baseProps} open={true} ctaLabel="Custom CTA" />,
    );

    expect(
      screen.getByRole("button", { name: "Custom CTA" }),
    ).toBeInTheDocument();
  });

  it("renders Create a post as the only button after the Before → After section", () => {
    render(<FloatingProfile {...baseProps} open={true} />);

    expect(
      screen.queryByRole("button", { name: "Edit Assets" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "공유" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create a post" }),
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

  it("relays onEditImage to the ProfilePrint hover overlay button", async () => {
    const user = userEvent.setup();
    const onEditImage = vi.fn();
    render(
      <FloatingProfile
        {...baseProps}
        open={true}
        imageHover
        onEditImage={onEditImage}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit Asset Image" }));

    expect(onEditImage).toHaveBeenCalledTimes(1);
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
    expect(screen.queryByText("Known for Now")).not.toBeInTheDocument();
  });

  it("forwards additional props to the root element", () => {
    render(
      <FloatingProfile {...baseProps} open={false} data-testid="fp-root" />,
    );

    expect(screen.getByTestId("fp-root")).toBeInTheDocument();
  });
});
