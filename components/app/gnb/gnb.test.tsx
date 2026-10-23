import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Blocks, Compass, Home, UserRoundSearch } from "lucide-react";

import { Gnb, type GnbItem } from "./gnb";
import { createSpriteIcon } from "@/lib/sprite-icon";

// gnb.stories.tsx와 동일한 아이콘 구성(Figma 실측 기준)을 사용해 데모 데이터를 일치시킨다.
const AssetIcon = createSpriteIcon("asset-icon");

const items: GnbItem[] = [
  { id: "dashboard", icon: Home, label: "Dashboard" },
  { id: "assets", icon: AssetIcon, label: "Assets" },
  { id: "compass", icon: Compass, label: "Compass" },
  { id: "contents-studio", icon: Blocks, label: "Contents Studio" },
  { id: "know-thyself", icon: UserRoundSearch, label: "Know Thyself" },
];

describe("Gnb", () => {
  it("renders all nav items as icon-only (aria-label) when collapsed", () => {
    render(<Gnb expanded={false} items={items} activeId="dashboard" />);

    expect(
      screen.getByRole("button", { name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Assets" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Expand sidebar" }),
    ).toBeInTheDocument();
  });

  it("renders icon+label nav items and the logo when expanded", () => {
    render(<Gnb expanded={true} items={items} activeId="dashboard" />);

    expect(screen.getByAltText("Gabrielle")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Collapse sidebar" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("marks the item matching activeId with aria-current", () => {
    render(<Gnb expanded={true} items={items} activeId="compass" />);

    expect(screen.getByRole("button", { name: "Compass" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(
      screen.getByRole("button", { name: "Dashboard" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("disables items listed in disabledIds and never marks them active", () => {
    render(
      <Gnb
        expanded={true}
        items={items}
        activeId="contents-studio"
        disabledIds={["contents-studio"]}
      />,
    );

    const button = screen.getByRole("button", { name: "Contents Studio" });
    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute("aria-current");
  });

  it("calls onExpandedChange when the toggle button is clicked", async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    render(
      <Gnb
        expanded={false}
        items={items}
        activeId="dashboard"
        onExpandedChange={onExpandedChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Expand sidebar" }));

    expect(onExpandedChange).toHaveBeenCalledWith(true);
  });

  it("calls onItemSelect with the clicked item's id", async () => {
    const user = userEvent.setup();
    const onItemSelect = vi.fn();
    render(
      <Gnb
        expanded={true}
        items={items}
        activeId="dashboard"
        onItemSelect={onItemSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Assets" }));

    expect(onItemSelect).toHaveBeenCalledWith("assets");
  });

  it("does not call onItemSelect for a disabled item", async () => {
    const user = userEvent.setup();
    const onItemSelect = vi.fn();
    render(
      <Gnb
        expanded={true}
        items={items}
        activeId="dashboard"
        disabledIds={["assets"]}
        onItemSelect={onItemSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Assets" }));

    expect(onItemSelect).not.toHaveBeenCalled();
  });

  it("calls onSettingsClick when the Settings button is clicked", async () => {
    const user = userEvent.setup();
    const onSettingsClick = vi.fn();
    render(
      <Gnb
        expanded={true}
        items={items}
        activeId="dashboard"
        onSettingsClick={onSettingsClick}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Settings" }));

    expect(onSettingsClick).toHaveBeenCalledTimes(1);
  });

  it("shows the unread dot on the bell only when unreadCount > 0", () => {
    const { rerender } = render(
      <Gnb
        expanded={false}
        items={items}
        activeId="dashboard"
        unreadCount={0}
      />,
    );
    const getUnreadDot = () =>
      screen
        .getByRole("button", { name: "Notification" })
        .querySelector('[data-testid="unread-dot"]');
    expect(getUnreadDot()).not.toBeInTheDocument();

    rerender(
      <Gnb
        expanded={false}
        items={items}
        activeId="dashboard"
        unreadCount={3}
      />,
    );
    expect(getUnreadDot()).toBeInTheDocument();
  });

  it("opens the notification dropdown when the bell is clicked and calls onToggleNotification", async () => {
    const user = userEvent.setup();
    const onToggleNotification = vi.fn();
    render(
      <Gnb
        expanded={false}
        items={items}
        activeId="dashboard"
        notificationItems={[{ id: "1", label: "Hello world" }]}
        onToggleNotification={onToggleNotification}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Notification" }));

    expect(onToggleNotification).toHaveBeenCalledWith(true);
    expect(await screen.findByText("Hello world")).toBeInTheDocument();
  });

  it("opens the Setting panel when Settings is clicked and closes it on a second click", async () => {
    const user = userEvent.setup();
    render(<Gnb expanded={true} items={items} activeId="dashboard" />);

    await user.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByText("Usage")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.queryByText("Usage")).not.toBeInTheDocument();
  });

  it("closes Work History and opens Setting when Settings is clicked while Work History is open", async () => {
    const user = userEvent.setup();
    render(<Gnb expanded={true} items={items} activeId="dashboard" />);

    await user.click(screen.getByRole("button", { name: "Work history" }));
    expect(screen.getByText("Work History")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.queryByText("Work History")).not.toBeInTheDocument();
    expect(screen.getByText("Usage")).toBeInTheDocument();
  });

  it("calls onSettingSectionSelect with the clicked section's id", async () => {
    const user = userEvent.setup();
    const onSettingSectionSelect = vi.fn();
    render(
      <Gnb
        expanded={true}
        items={items}
        activeId="dashboard"
        onSettingSectionSelect={onSettingSectionSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.click(screen.getByRole("button", { name: "Billing" }));

    expect(onSettingSectionSelect).toHaveBeenCalledWith("billing");
  });

  it("jumps to the Setting panel's Notification section from the notification dropdown's gear icon", async () => {
    const user = userEvent.setup();
    const onNotificationSettingsClick = vi.fn();
    const onSettingSectionSelect = vi.fn();
    render(
      <Gnb
        expanded={true}
        items={items}
        activeId="dashboard"
        notificationItems={[{ id: "1", label: "Hello world" }]}
        onNotificationSettingsClick={onNotificationSettingsClick}
        onSettingSectionSelect={onSettingSectionSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Notification" }));
    await user.click(
      await screen.findByRole("button", { name: "Notification settings" }),
    );

    expect(screen.queryByText("Hello world")).not.toBeInTheDocument();
    expect(onNotificationSettingsClick).toHaveBeenCalledTimes(1);
    expect(onSettingSectionSelect).toHaveBeenCalledWith("notification");
    const notificationButtons = screen.getAllByRole("button", {
      name: "Notification",
    });
    expect(notificationButtons[notificationButtons.length - 1]).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("also jumps to the Setting panel's Notification section when a notification list item is clicked", async () => {
    const user = userEvent.setup();
    const onSettingSectionSelect = vi.fn();
    render(
      <Gnb
        expanded={true}
        items={items}
        activeId="dashboard"
        notificationItems={[{ id: "1", label: "Hello world" }]}
        onSettingSectionSelect={onSettingSectionSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Notification" }));
    await user.click(
      await screen.findByRole("button", { name: "Hello world" }),
    );

    expect(screen.queryByText("Hello world")).not.toBeInTheDocument();
    expect(onSettingSectionSelect).toHaveBeenCalledWith("notification");
  });

  it("calls onSettingSearchChange when typing in the Setting panel's search input (uncontrolled)", async () => {
    const user = userEvent.setup();
    const onSettingSearchChange = vi.fn();
    render(
      <Gnb
        expanded={true}
        items={items}
        activeId="dashboard"
        onSettingSearchChange={onSettingSearchChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.type(screen.getByPlaceholderText("Search placeholder"), "a");

    expect(onSettingSearchChange).toHaveBeenCalledWith("a");
  });
});
