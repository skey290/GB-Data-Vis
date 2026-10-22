import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  SelfCuration,
  selfCurationEmptySlotKey,
  type SelfCurationPersona,
} from "./self-curation";

const TWO_PERSONAS: (SelfCurationPersona | null)[] = [
  { id: "a", name: "A", initials: "A" },
  { id: "b", name: "B", initials: "B" },
  null,
  null,
  null,
  null,
  null,
  null,
];

describe("SelfCuration", () => {
  it("renders a persona slot for each entry and an empty slot for null", () => {
    render(
      <SelfCuration
        slots={TWO_PERSONAS}
        centerMessage="Hover to see analysis"
      />,
    );

    expect(screen.getByRole("img", { name: "A" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "B" })).toBeInTheDocument();
    expect(screen.getAllByText("No Self")).toHaveLength(6);
  });

  it("shows the center message", () => {
    render(<SelfCuration slots={TWO_PERSONAS} centerMessage="Create a Self" />);

    expect(screen.getByText("Create a Self")).toBeInTheDocument();
  });

  it("highlights only the slot matching activeSlotId", () => {
    render(
      <SelfCuration
        slots={TWO_PERSONAS}
        activeSlotId="b"
        centerMessage="Go to Content Studio"
      />,
    );

    const ringOf = (name: string) =>
      screen
        .getByRole("img", { name })
        .parentElement?.querySelector(".border-solid");

    expect(ringOf("A")).toHaveClass("border-transparent");
    expect(ringOf("B")).toHaveClass("border-[color:var(--gb-border-static-white)]");
  });

  it("highlights an empty slot via its synthetic key", () => {
    render(
      <SelfCuration
        slots={TWO_PERSONAS}
        activeSlotId={selfCurationEmptySlotKey(2)}
        centerMessage="Create a Self"
      />,
    );

    const emptySlots = screen.getAllByRole("img", { name: "No Self" });

    expect(emptySlots[0]).toHaveClass(
      "border-[color:var(--gb-border-static-white)]",
    );
    expect(emptySlots[1]).toHaveClass(
      "border-[color:var(--gb-border-muted)]",
    );
  });

  it("calls onSlotHover with the slot id on enter and null on leave", async () => {
    const onSlotHover = vi.fn();
    render(
      <SelfCuration
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
      <SelfCuration
        slots={TWO_PERSONAS}
        centerMessage="Create a Self"
        onCenterClick={onCenterClick}
      />,
    );

    await userEvent.click(screen.getByText("Create a Self"));

    expect(onCenterClick).toHaveBeenCalledTimes(1);
  });
});
