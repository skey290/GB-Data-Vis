import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Toggle, type ToggleItem } from "./toggle";

function Icon() {
  return <svg aria-hidden="true" />;
}

function makeItems(overrides?: Partial<ToggleItem>[]): ToggleItem[] {
  return [
    { icon: <Icon />, "aria-label": "북마크 1", ...(overrides?.[0] ?? {}) },
    { icon: <Icon />, "aria-label": "북마크 2", ...(overrides?.[1] ?? {}) },
  ];
}

describe("Toggle", () => {
  it("renders a group with one button per item", () => {
    render(<Toggle items={makeItems()} />);

    expect(screen.getByRole("group")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "북마크 1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "북마크 2" }),
    ).toBeInTheDocument();
  });

  it("defaults every item to aria-pressed=false", () => {
    render(<Toggle items={makeItems()} />);

    const first = screen.getByRole("button", { name: "북마크 1" });
    expect(first).toHaveAttribute("aria-pressed", "false");
  });

  it("reflects the pressed prop via aria-pressed", () => {
    render(<Toggle items={makeItems([{ pressed: true }])} />);

    const first = screen.getByRole("button", { name: "북마크 1" });
    expect(first).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onPressedChange with the toggled value when clicked", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    const items = makeItems();
    items[0] = { ...items[0], onPressedChange };

    render(<Toggle items={items} />);

    await user.click(screen.getByRole("button", { name: "북마크 1" }));

    expect(onPressedChange).toHaveBeenCalledTimes(1);
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it("renders a divider between items but not before the first item", () => {
    const { container } = render(<Toggle items={makeItems()} />);

    const dividers = container.querySelectorAll('[data-slot="toggle-divider"]');
    expect(dividers).toHaveLength(1);
  });

  it("stacks items vertically when orientation is 'vertical'", () => {
    render(<Toggle items={makeItems()} orientation="vertical" />);

    const group = screen.getByRole("group");
    expect(group.className).toContain("flex-col");
  });

  it("stacks items horizontally by default", () => {
    render(<Toggle items={makeItems()} />);

    const group = screen.getByRole("group");
    expect(group.className).toContain("flex-row");
  });

  it("forwards additional props to the group container", () => {
    render(<Toggle items={makeItems()} data-testid="custom-toggle" />);

    expect(screen.getByTestId("custom-toggle")).toBeInTheDocument();
  });

  it("renders a 2-column grid when orientation is 'grid'", () => {
    const items = [
      ...makeItems(),
      { icon: <Icon />, "aria-label": "북마크 3" },
      { icon: <Icon />, "aria-label": "북마크 4" },
    ];
    const { container } = render(<Toggle items={items} orientation="grid" />);

    const group = screen.getByRole("group");
    expect(group.className).toContain("flex-col");
    // 2행(row) x 2열(column) 구조라 row 사이 divider가 1개 있어야 합니다.
    const dividers = container.querySelectorAll('[data-slot="toggle-divider"]');
    expect(dividers.length).toBeGreaterThan(0);
  });

  it("does not switch to grid automatically for 4+ vertical items", () => {
    // orientation 모델 수정: vertical은 아이템 수와 무관하게 항상 1열 스택입니다.
    const items = [
      ...makeItems(),
      { icon: <Icon />, "aria-label": "북마크 3" },
      { icon: <Icon />, "aria-label": "북마크 4" },
    ];
    render(<Toggle items={items} orientation="vertical" />);

    const group = screen.getByRole("group");
    expect(group.className).toContain("flex-col");
    expect(screen.getAllByRole("button")).toHaveLength(4);
  });

  it("renders the vertical label next to its corresponding button", () => {
    const items = makeItems([
      { label: "Growth Potential" },
      { label: "Reach" },
    ]);
    render(<Toggle items={items} orientation="vertical" />);

    expect(screen.getByText("Growth Potential")).toBeInTheDocument();
    expect(screen.getByText("Reach")).toBeInTheDocument();
  });

  it("does not render labels for horizontal or grid orientation", () => {
    const items = makeItems([{ label: "Growth Potential" }]);

    const { rerender } = render(
      <Toggle items={items} orientation="horizontal" />,
    );
    expect(screen.queryByText("Growth Potential")).not.toBeInTheDocument();

    rerender(<Toggle items={items} orientation="grid" />);
    expect(screen.queryByText("Growth Potential")).not.toBeInTheDocument();
  });

  it("disables every button when the group-level disabled prop is true", () => {
    render(<Toggle items={makeItems()} disabled />);

    const first = screen.getByRole("button", { name: "북마크 1" });
    const second = screen.getByRole("button", { name: "북마크 2" });
    expect(first).toBeDisabled();
    expect(second).toBeDisabled();
  });

  it("does not call onPressedChange when disabled", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    const items = makeItems();
    items[0] = { ...items[0], onPressedChange };

    render(<Toggle items={items} disabled />);

    await user.click(screen.getByRole("button", { name: "북마크 1" }));

    expect(onPressedChange).not.toHaveBeenCalled();
  });
});
