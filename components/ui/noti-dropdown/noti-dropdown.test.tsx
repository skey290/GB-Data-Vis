import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { NotiDropdown, type NotiDropdownItem } from "./noti-dropdown";

const items: NotiDropdownItem[] = [
  { id: "1", label: "First notification", unread: true },
  { id: "2", label: "Second notification", unread: true },
  { id: "3", label: "Third notification" },
];

describe("NotiDropdown", () => {
  it("renders All/Unread tabs with correct counts", () => {
    render(<NotiDropdown items={items} />);

    expect(screen.getByRole("tab", { name: /All/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Unread/ })).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders all items when selectedTab='all'", () => {
    render(<NotiDropdown items={items} selectedTab="all" />);

    expect(screen.getAllByText(/notification$/)).toHaveLength(3);
  });

  it("renders only unread items when selectedTab='unread'", () => {
    render(<NotiDropdown items={items} selectedTab="unread" />);

    expect(screen.getAllByText(/notification$/)).toHaveLength(2);
    expect(screen.queryByText("Third notification")).not.toBeInTheDocument();
  });

  it("calls onSelectedTabChange when the Unread tab is clicked", async () => {
    const user = userEvent.setup();
    const onSelectedTabChange = vi.fn();
    render(
      <NotiDropdown
        items={items}
        selectedTab="all"
        onSelectedTabChange={onSelectedTabChange}
      />,
    );

    await user.click(screen.getByRole("tab", { name: /Unread/ }));

    expect(onSelectedTabChange).toHaveBeenCalledWith("unread");
  });

  it("calls onSettingsClick when the settings button is clicked", async () => {
    const user = userEvent.setup();
    const onSettingsClick = vi.fn();
    render(<NotiDropdown items={items} onSettingsClick={onSettingsClick} />);

    await user.click(
      screen.getByRole("button", { name: "Notification settings" }),
    );

    expect(onSettingsClick).toHaveBeenCalledTimes(1);
  });

  it("renders nothing in the list when items is empty", () => {
    render(<NotiDropdown items={[]} />);
    expect(screen.queryByText(/notification$/)).not.toBeInTheDocument();
  });
});
