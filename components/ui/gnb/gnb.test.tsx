import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Blocks, Home, UserSearch } from "lucide-react";

import { Gnb, type GnbItem } from "./gnb";
import { createSpriteIcon } from "@/lib/sprite-icon";

// gnb.stories.tsx와 동일한 아이콘 구성(Figma 실측 기준)을 사용해 데모 데이터를 일치시킨다.
const AssetIcon = createSpriteIcon("asset-icon");
const CompassIcon = createSpriteIcon("compass-icon");

const items: GnbItem[] = [
  { id: "dashboard", icon: Home, label: "Dashboard" },
  { id: "assets", icon: AssetIcon, label: "Assets" },
  { id: "compass", icon: CompassIcon, label: "Compass" },
  { id: "contents-studio", icon: Blocks, label: "Contents Studio" },
  { id: "know-thyself", icon: UserSearch, label: "Know Thyself" },
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

  it("shows the notification dot only when unreadCount > 0", () => {
    const { rerender } = render(
      <Gnb
        expanded={false}
        items={items}
        activeId="dashboard"
        unreadCount={0}
      />,
    );
    expect(
      screen.queryByTestId("menu-notification-dot"),
    ).not.toBeInTheDocument();

    rerender(
      <Gnb
        expanded={false}
        items={items}
        activeId="dashboard"
        unreadCount={3}
      />,
    );
    expect(screen.getByTestId("menu-notification-dot")).toBeInTheDocument();
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
});
