import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Home } from "lucide-react";

import { MenuButton } from "./menu-button";

describe("MenuButton", () => {
  it("renders an icon-only button with an accessible name from aria-label", () => {
    render(<MenuButton type="icon" icon={Home} aria-label="Dashboard" />);

    const button = screen.getByRole("button", { name: "Dashboard" });
    expect(button).toBeInTheDocument();
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("renders icon + label when type='icon-with-text'", () => {
    render(<MenuButton type="icon-with-text" icon={Home} label="Dashboard" />);

    const button = screen.getByRole("button", { name: "Dashboard" });
    expect(button.querySelector("svg")).toBeInTheDocument();
    expect(button).toHaveTextContent("Dashboard");
  });

  it("renders only the label when type='text' (no icon, even if provided)", () => {
    render(<MenuButton type="text" icon={Home} label="Dashboard" />);

    const button = screen.getByRole("button", { name: "Dashboard" });
    expect(button.querySelector("svg")).not.toBeInTheDocument();
  });

  it("marks status='active' with aria-current", () => {
    render(<MenuButton type="text" label="Dashboard" status="active" />);

    expect(screen.getByRole("button", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("does not set aria-current for default/disabled status", () => {
    render(<MenuButton type="text" label="Dashboard" status="default" />);
    expect(
      screen.getByRole("button", { name: "Dashboard" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("disables the button when status='disabled'", () => {
    render(<MenuButton type="text" label="Dashboard" status="disabled" />);
    expect(screen.getByRole("button", { name: "Dashboard" })).toBeDisabled();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<MenuButton type="text" label="Dashboard" onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: "Dashboard" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <MenuButton
        type="text"
        label="Dashboard"
        status="disabled"
        onClick={onClick}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Dashboard" }));

    expect(onClick).not.toHaveBeenCalled();
  });
});
