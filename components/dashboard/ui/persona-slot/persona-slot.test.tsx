import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { PersonaSlot } from "./persona-slot";

const PERSONA = { name: "Data Scientist", initials: "DS" };

describe("PersonaSlot", () => {
  it("renders the persona as an image-role avatar", () => {
    render(<PersonaSlot persona={PERSONA} />);

    expect(
      screen.getByRole("img", { name: "Data Scientist" }),
    ).toBeInTheDocument();
  });

  it("renders the empty slot with the No Self placeholder", () => {
    render(<PersonaSlot persona={null} />);

    const slot = screen.getByRole("img", { name: "No Self" });
    expect(slot).toBeInTheDocument();
    expect(slot).toHaveClass("border-dashed");
  });

  it("keeps the highlight ring mounted (transparent) when inactive", () => {
    render(<PersonaSlot persona={PERSONA} />);

    const ring = screen.getByRole("img", {
      name: "Data Scientist",
    }).parentElement;
    expect(ring).toHaveClass("outline-solid");
    expect(ring).toHaveClass("outline-transparent");
  });

  it("turns the highlight ring on when active", () => {
    render(<PersonaSlot persona={PERSONA} active />);

    const ring = screen.getByRole("img", {
      name: "Data Scientist",
    }).parentElement;
    expect(ring).toHaveClass(
      "outline-[color:var(--color-semantic-non-changeable)]",
    );
  });

  it("blurs the avatar only when active", () => {
    const { rerender } = render(<PersonaSlot persona={PERSONA} />);
    expect(screen.getByRole("img", { name: "Data Scientist" })).toHaveClass(
      "[filter:var(--blur-none)]",
    );

    rerender(<PersonaSlot persona={PERSONA} active />);
    expect(screen.getByRole("img", { name: "Data Scientist" })).toHaveClass(
      "[filter:var(--blur-sm)]",
    );
  });

  it("fills the empty slot's background only when active", () => {
    const { rerender } = render(<PersonaSlot persona={null} />);
    expect(screen.getByRole("img", { name: "No Self" })).toHaveClass(
      "bg-transparent",
    );

    rerender(<PersonaSlot persona={null} active />);
    expect(screen.getByRole("img", { name: "No Self" })).toHaveClass(
      "bg-[var(--background-sheer)]",
    );
  });
});
