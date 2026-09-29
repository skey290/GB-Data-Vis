import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { CompassSelfAvatar } from "./compass-self-avatar";

describe("CompassSelfAvatar", () => {
  it("renders a dashed circle with no content for variant='guide'", () => {
    const { container } = render(<CompassSelfAvatar variant="guide" />);

    const guide = container.firstElementChild as HTMLElement;
    expect(guide.className).toContain("border-dashed");
    expect(guide.style.width).toBe("100px");
    expect(guide.style.height).toBe("100px");
    expect(guide.textContent).toBe("");
  });

  it("scales the guide size in px per guideSize", () => {
    const { container } = render(
      <CompassSelfAvatar variant="guide" guideSize={250} />,
    );

    const guide = container.firstElementChild as HTMLElement;
    expect(guide.style.width).toBe("250px");
    expect(guide.style.height).toBe("250px");
  });

  it("renders the default empty slot with 'No Self Yet' text", () => {
    render(<CompassSelfAvatar variant="empty" />);

    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.getByText("Self Yet")).toBeInTheDocument();
  });

  it("switches the empty slot to the active style with 'Go to Assets'", () => {
    render(<CompassSelfAvatar variant="empty" status="active" />);

    expect(screen.getByText("Go to")).toBeInTheDocument();
    expect(screen.getByText("Assets")).toBeInTheDocument();
  });

  it("renders a plain image with no overlay for variant='self' default status", () => {
    const { container } = render(
      <CompassSelfAvatar variant="self" image="/self.jpg" imageAlt="Jane" />,
    );

    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "/self.jpg");
    expect(img).toHaveAttribute("alt", "Jane");
    expect(img?.className).not.toContain("blur-[4px]");
    expect(screen.queryByText("Go to")).toBeNull();
  });

  it("blurs the image and shows the active overlay label", () => {
    render(
      <CompassSelfAvatar variant="self" status="active" image="/self.jpg" />,
    );

    expect(screen.getByText("Go to")).toBeInTheDocument();
    expect(screen.getByText("Content Studio")).toBeInTheDocument();
  });

  it("shows the error overlay only when status is default", () => {
    render(<CompassSelfAvatar variant="self" error image="/self.jpg" />);

    expect(screen.getByText("Estimate")).toBeInTheDocument();
    expect(screen.getByText("(No experience data)")).toBeInTheDocument();
  });

  it("ignores error when status is active (Figma combination rule)", () => {
    render(
      <CompassSelfAvatar
        variant="self"
        status="active"
        error
        image="/self.jpg"
      />,
    );

    expect(screen.queryByText("Estimate")).toBeNull();
    expect(screen.getByText("Go to")).toBeInTheDocument();
  });

  it("accepts a custom label to replace the default overlay text", () => {
    render(
      <CompassSelfAvatar
        variant="self"
        status="active"
        image="/self.jpg"
        label="Custom Label"
      />,
    );

    expect(screen.getByText("Custom Label")).toBeInTheDocument();
  });

  it("forwards additional props to the root element", () => {
    render(<CompassSelfAvatar data-testid="self-avatar" />);

    expect(screen.getByTestId("self-avatar")).toBeInTheDocument();
  });

  it("reacts to mouse hover on a filled self even without status='active'", () => {
    render(
      <CompassSelfAvatar
        variant="self"
        image="/self.jpg"
        data-testid="self-avatar"
      />,
    );

    expect(screen.queryByText("Go to")).toBeNull();

    fireEvent.mouseEnter(screen.getByTestId("self-avatar"));
    expect(screen.getByText("Go to")).toBeInTheDocument();
    expect(screen.getByText("Content Studio")).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByTestId("self-avatar"));
    expect(screen.queryByText("Go to")).toBeNull();
  });

  it("reacts to mouse hover on an empty slot even without status='active'", () => {
    render(<CompassSelfAvatar variant="empty" data-testid="self-avatar" />);

    fireEvent.mouseEnter(screen.getByTestId("self-avatar"));
    expect(screen.getByText("Go to")).toBeInTheDocument();
    expect(screen.getByText("Assets")).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByTestId("self-avatar"));
    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.getByText("Self Yet")).toBeInTheDocument();
  });

  it("keeps the active look while hovered even if status='active' is later cleared by hover leaving", () => {
    render(
      <CompassSelfAvatar
        variant="self"
        status="active"
        image="/self.jpg"
        data-testid="self-avatar"
      />,
    );

    fireEvent.mouseLeave(screen.getByTestId("self-avatar"));
    expect(screen.getByText("Go to")).toBeInTheDocument();
  });
});
