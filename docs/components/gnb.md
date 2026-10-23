# Gnb

- Code: `components/app/gnb/gnb.tsx` (`gnb.stories.tsx`, `gnb.test.tsx`, `index.ts`)
- Figma: [📌 GB_UXUI](https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8163-93080) `GNB` node `8163:93080` (Type × Expand × Notification, 8 variants)

## Overview

The main sidebar. The Expand and Notification axes are reduced to an `expanded` boolean plus `activeId` / `disabledIds`. The toggle, bell, settings, and navigation rows are all composed from a single `MenuButton` — in Figma these are the same kind of row following the same pattern (collapsed: a shared `Button` instance; expanded: a `Part/GNB` instance), and the bell is not a separate component. The sidebar toggle itself is always a `Button` instance regardless of expansion, since it is a fixed icon button with no label.

## How to use

```tsx
<Gnb
  expanded={expanded}
  onExpandedChange={setExpanded}
  items={[{ id: "dashboard", icon: Home, label: "Dashboard" }, ...]}
  activeId={activeId}
  onItemSelect={setActiveId}
  unreadCount={2}
  notificationItems={notificationItems}
  onSettingsClick={handleSettings}
/>
```

## Props

| Prop                          | Type                                   | Default    | Description                                                                                                                                                        |
| ----------------------------- | -------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `expanded`                    | `boolean`                              | (required) | Figma `Expand`                                                                                                                                                     |
| `onExpandedChange`            | `(expanded: boolean) => void`          | —          | Called when the collapse/expand toggle is clicked                                                                                                                  |
| `items`                       | `GnbItem[]`                            | (required) | `{ id, icon: LucideIcon, label }[]`                                                                                                                                |
| `activeId`                    | `string`                               | (required) | Currently active item id                                                                                                                                           |
| `disabledIds`                 | `string[]`                             | `[]`       | Individually disabled item ids (Figma `Style=disabled`)                                                                                                            |
| `onItemSelect`                | `(id: string) => void`                 | —          |                                                                                                                                                                    |
| `unreadCount`                 | `number`                               | `0`        | Decides whether the bell dot shows (hidden at 0)                                                                                                                   |
| `notificationItems`           | `NotiDropdownItem[]`                   | `[]`       | Passed to `NotiDropdown`                                                                                                                                           |
| `onNotificationSettingsClick` | `() => void`                           | —          | Called when the notification dropdown's gear is clicked — always fired alongside closing the dropdown and activating the Notification section of the Setting panel |
| `onSettingsClick`             | `() => void`                           | —          | Called when the Settings menu is clicked (always fired alongside the Setting panel toggle)                                                                         |
| `workHistoryItems`            | `GnbHistoryItem[]`                     | `[]`       | Passed to the Work History drawer                                                                                                                                  |
| `selfArchiveItems`            | `GnbHistoryItem[]`                     | `[]`       | Passed to the Self Archive drawer                                                                                                                                  |
| `onSettingSectionSelect`      | `(section: GnbSettingSection) => void` | —          | Called when one of the six Setting panel menu rows is clicked                                                                                                      |
| `settingSearchValue`          | `string`                               | —          | Controlled value for the Setting panel search field (delegated to `InputSearch`)                                                                                   |
| `defaultSettingSearchValue`   | `string`                               | —          | Uncontrolled initial value for that search field                                                                                                                   |
| `onSettingSearchChange`       | `(value: string) => void`              | —          | Called as the Setting panel search field changes                                                                                                                   |

## Structure

- **Collapsed** (`expanded=false`): the toggle, bell, settings, and navigation rows are all `MenuButton` with `type="icon"` — reproducing the values of Figma's shared `Button` instance in the icon rail. The component itself cannot be embedded because a `<button>` cannot nest inside a `<button>`.
- **Expanded** (`expanded=true`): bell, settings, and navigation rows become `MenuButton` with `type="icon-with-text"` (Figma `Part/GNB`). Only the toggle stays `type="icon"` either way.
- The logo is `/public/images/logo.png`, with the fixed Figma widths of 250px expanded and 48px collapsed. When collapsed it is hidden with `opacity: 0` — its layout width is not preserved, and the toggle button carries `shrink-0` so the logo cannot squash it. Width animation is left entirely to the root's single `transition-[width]`; individual rows only use `overflow: hidden` plus label opacity.
- **The notification bell**: when unread, a composed icon (`DotBellIcon`) layers a 4px dot (`--gb-background-warning-default`) over `Bell`; otherwise a plain `Bell` is passed as `MenuButton`'s `icon`. Figma's `dot-bell-icon` is a flattened fill asset whose weight differs from every other lucide icon (all 2px stroke), so composing it keeps the weight consistent. The dropdown is a Radix `Popover` (`NotiDropdown`) anchored to this bell.
- The GNB family (including `MenuButton` and `NotiDropdown`) always renders dark by measurement — the root carries a `.dark` scope class, the same approach as `Popover` and `Chatbox`.
- Buttons whose label is a fixed string (toggle, bell, settings) must always carry `className="w-full"`, collapsed or not. Dropping it when collapsed leaves the invisible label still occupying width, pushing the centered icon off-screen.

## Work History / Self Archive drawers

The Figma `GNB` component set itself has `Type=work history` (node `8163:93431`) and `Type=self archive` (node `8163:93776`) variants. Unlike `Notification`, these two instantiate no separate component — they are drawn directly inside GNB from shared atoms (Button, Badge, icons). So rather than extracting them like `NotiDropdown`, they stay as the private `GnbHistoryPanel` inside `gnb.tsx`. The panel attaches as a flex sibling of the GNB body (not an absolutely positioned overlay), so opening it widens the whole assembly. Measured in Figma, the gap between rail and panel is 0px — completely flush with no border — and they are distinguished only by background color (`--gb-background-subtlest` vs `--gb-background-subtler`).

The trigger is a two-segment `Toggle` (`components/ui/toggle`, history/archive icons) floating independently to the right of the GNB panel. `gnb.tsx` drives opening, switching, and click-to-close through its own `activeDrawer` state (all closed initially; clicking opens one, clicking the same one again closes it). Neither of `Toggle`'s built-in `selectionMode` values supports that exact combination of mutual exclusivity plus click-to-deselect. The `Toggle` stays above the open panel at `z-20` so switching and closing remain possible — except while the Setting panel is open, where Figma does not include the toggle at all and it is not rendered.

The toggle's position splits across two CSS properties for two different axes. The rail-width axis (`expanded`) uses `left: railWidth(48|250) + 20px`; the drawer-width axis (`activeDrawer`) uses `transform: translateX(drawerWidth)` (0 closed, 407 for Work History / Self Archive — Setting does not render the toggle). `left` carries the same `transition duration-200 ease-linear` as the rail's own `transition-[width]`, so the toggle travels with the rail as it collapses and expands rather than arriving early. `transform` has no transition, so it snaps when a drawer opens or closes — the drawer is conditionally rendered and appears instantly, and animating only the toggle would look worse. Folding both axes into a single `left` value could not satisfy these two different timing requirements at once.

## Setting panel

The Figma `GNB` set's `Type=setting` variant (`Expand=false` node `8163:93129` / `Expand=true` node `8163:93253`). Unlike Work History / Self Archive it has no title and no close (X) button, and it is always a **fixed 250px wide** regardless of rail width — the same character as those two always being 407px. Top to bottom it contains a search field (`InputSearch` reused, shrunk to 234×32) followed by six menu rows (`MenuButton type="icon-with-text"`). Its trigger, mutual exclusivity, and click-to-close share exactly the same `activeDrawer` / `toggleDrawer` mechanism (clicking Settings toggles `activeDrawer` to `"setting"`, and `onSettingsClick` always fires alongside).

The six rows map 1:1 onto `GnbSettingSection` (`notification` / `general` / `account` / `privacy` / `billing` / `usage`), with lucide `Bell` / `Settings` / `UserRound` / `Shield` / `CreditCard` / `BarChartBig`. `Gnb` tracks the selected section in internal state (`activeSettingSection`) and marks only that row `status="active"`, the same pattern as the main navigation's `activeId`. It activates only on a row click or the bell shortcut below, and resets when the panel is reopened from the Settings button (no section is preselected). While the Setting panel is open, the main navigation's current-page indicator is switched off — Setting counts as a page transition of its own, and two "you are here" markers must not show at once.

**Jumping from the notification dropdown to Setting's Notification section**: clicking either the gear icon (`onSettingsClick`) or any notification row (`onItemClick`) in `NotiDropdown` closes the dropdown, opens the Setting panel, and activates the `Notification` row — the natural reading of "go to notification settings". Both `onSettingSectionSelect("notification")` and the existing `onNotificationSettingsClick` fire.

The menu list stacks from the top inside a left vertical rule (`--gb-border-selected`). `Notification` (the first row) carries a 60px top margin so the list starts one step below the search field rather than immediately under it; `General` through `Usage` then follow at normal spacing. The result is that `General`'s start Y lines up exactly with the rail navigation list (where `Dashboard` begins). The 60px matches the fixed height of the rail header (logo, bell, settings, divider), and since both lists stack from the top, the alignment holds as the lists grow. The panel background is **`--gb-background-subtlest`** — the same token as the rail — rather than Work History / Self Archive's `--gb-background-subtler`; measurement confirms they differ.

## Self Archive has no selected emphasis

All five sample rows of Figma's `Type=self archive` look identical, with no background. No selected state exists in the design, so `GnbHistoryItem` carries no such prop.

## Deletion goes through a confirmation

The Trash button on a Self Archive row does not call `item.onDelete` directly. It first opens the shared `Popover` (`type="warning"`) asking whether to delete. Figma has no design for this dialog — only the trash icon, with no specified follow-up — but deletion is irreversible, so the confirmation is a code-side decision to prevent mistakes. `onDelete` fires only after Delete is confirmed.

## Icon mapping (as used in `gnb.stories.tsx` and `app/compass/page.tsx`)

| Item            | Icon                                                  |
| --------------- | ----------------------------------------------------- |
| Dashboard       | lucide `Home`                                         |
| Assets          | the `asset-icon` custom sprite in `/public/icons.svg` |
| Compass         | lucide `Compass`                                      |
| Contents Studio | lucide `Blocks`                                       |
| Know Thyself    | lucide `UserRoundSearch`                              |

Only Assets uses a sprite, because it is a custom glyph (a person inside viewfinder brackets) with no lucide equivalent in Figma. The rest are the standard lucide icons Figma uses directly. Re-check these against the current Figma file each time rather than trusting a previous audit — the design can change.
