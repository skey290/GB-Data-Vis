import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { SelfSlot } from "./self-slot";

const PERSONA = { name: "Data Scientist", initials: "DS" };

describe("SelfSlot", () => {
  it("renders the persona as an image-role avatar", () => {
    render(<SelfSlot persona={PERSONA} />);

    expect(
      screen.getByRole("img", { name: "Data Scientist" }),
    ).toBeInTheDocument();
  });

  it("renders the empty slot with the No Self placeholder", () => {
    render(<SelfSlot persona={null} />);

    const slot = screen.getByRole("img", { name: "No Self" });
    expect(slot).toBeInTheDocument();
    expect(slot).toHaveClass("border-dashed");
  });

  it("keeps the highlight ring mounted (transparent) when inactive", () => {
    const { container } = render(<SelfSlot persona={PERSONA} />);

    const ring = container.querySelector(".border-solid");
    expect(ring).toHaveClass("border-transparent");
  });

  it("turns the highlight ring on when active", () => {
    const { container } = render(
      <SelfSlot persona={PERSONA} status="active" />,
    );

    const ring = container.querySelector(".border-solid");
    expect(ring).toHaveClass("border-[color:var(--border-static-white)]");
  });

  it("blurs the avatar only when active", () => {
    const { rerender } = render(<SelfSlot persona={PERSONA} />);
    expect(screen.getByRole("img", { name: "Data Scientist" })).toHaveClass(
      "[filter:var(--backdrop-blur-none)]",
    );

    rerender(<SelfSlot persona={PERSONA} status="active" />);
    expect(screen.getByRole("img", { name: "Data Scientist" })).toHaveClass(
      "[filter:var(--backdrop-blur-sm)]",
    );
  });

  it("fills the empty slot's background only when active", () => {
    const { rerender } = render(<SelfSlot persona={null} />);
    expect(screen.getByRole("img", { name: "No Self" })).toHaveClass(
      "bg-transparent",
    );

    rerender(<SelfSlot persona={null} status="active" />);
    expect(screen.getByRole("img", { name: "No Self" })).toHaveClass(
      "bg-[var(--background-sheer)]",
    );
  });
});
