import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  PersonaOrbit,
  personaOrbitEmptySlotKey,
  type PersonaOrbitPersona,
} from "./persona-orbit";

const TWO_PERSONAS: (PersonaOrbitPersona | null)[] = [
  { id: "a", name: "A", initials: "A" },
  { id: "b", name: "B", initials: "B" },
  null,
  null,
  null,
  null,
  null,
  null,
];

describe("PersonaOrbit", () => {
  it("renders a persona slot for each entry and an empty slot for null", () => {
    render(
      <PersonaOrbit
        slots={TWO_PERSONAS}
        centerMessage="Hover to see analysis"
      />,
    );

    expect(screen.getByRole("img", { name: "A" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "B" })).toBeInTheDocument();
    expect(screen.getAllByText("No Self")).toHaveLength(6);
  });

  it("shows the center message", () => {
    render(<PersonaOrbit slots={TWO_PERSONAS} centerMessage="Create a Self" />);

    expect(screen.getByText("Create a Self")).toBeInTheDocument();
  });

  it("highlights only the slot matching activeSlotId", () => {
    render(
      <PersonaOrbit
        slots={TWO_PERSONAS}
        activeSlotId="b"
        centerMessage="Go to Content Studio"
      />,
    );

    expect(screen.getByRole("img", { name: "A" }).parentElement).toHaveClass(
      "outline-transparent",
    );
    expect(screen.getByRole("img", { name: "B" }).parentElement).toHaveClass(
      "outline-[color:var(--color-semantic-non-changeable)]",
    );
  });

  it("highlights an empty slot via its synthetic key", () => {
    render(
      <PersonaOrbit
        slots={TWO_PERSONAS}
        activeSlotId={personaOrbitEmptySlotKey(2)}
        centerMessage="Create a Self"
      />,
    );

    const emptySlots = screen.getAllByRole("img", { name: "No Self" });
    expect(emptySlots[0]).toHaveClass(
      "outline-[color:var(--color-semantic-non-changeable)]",
    );
    expect(emptySlots[1]).toHaveClass("outline-transparent");
  });

  it("calls onSlotHover with the slot id on enter and null on leave", async () => {
    const onSlotHover = vi.fn();
    render(
      <PersonaOrbit
        slots={TWO_PERSONAS}
        centerMessage="Hover to see analysis"
        onSlotHover={onSlotHover}
      />,
    );

    const avatar = screen.getByRole("img", { name: "A" });
    await userEvent.hover(avatar);
    expect(onSlotHover).toHaveBeenCalledWith("a");

    await userEvent.unhover(avatar);
    expect(onSlotHover).toHaveBeenCalledWith(null);
  });

  it("calls onCenterClick when the center message is clicked", async () => {
    const onCenterClick = vi.fn();
    render(
      <PersonaOrbit
        slots={TWO_PERSONAS}
        centerMessage="Create a Self"
        onCenterClick={onCenterClick}
      />,
    );

    await userEvent.click(screen.getByText("Create a Self"));

    expect(onCenterClick).toHaveBeenCalledTimes(1);
  });
});
