# NotiDropdown

- Code: `components/app/noti-dropdown/noti-dropdown.tsx` (`noti-dropdown.stories.tsx`, `noti-dropdown.test.tsx`, `index.ts`)
- Figma: [📌 GB_UXUI](https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8163-93051) `Notification slot` node `8163:93051`

## Overview

The dropdown panel that opens when the GNB notification bell (`MenuButton`) is clicked. It has a header with All/Unread tabs and a Settings button, and below that a notification list reusing `NotiItem`. It always renders dark, following the shared GNB pattern.

## When to use

- As the content of a Radix `Popover` anchored to the GNB bell trigger. `components/app/gnb/gnb.tsx` is the live example.

## How to use

```tsx
<NotiDropdown
  items={notificationItems}
  selectedTab={tab}
  onSelectedTabChange={setTab}
  onSettingsClick={handleSettings}
/>
```

## Props

| Prop                  | Type                               | Default    | Description                                     |
| --------------------- | ---------------------------------- | ---------- | ----------------------------------------------- |
| `items`               | `NotiDropdownItem[]`               | (required) | `{ id, label, unread? }[]`                      |
| `selectedTab`         | `"all" \| "unread"`                | `"all"`    | Fully controlled                                |
| `onSelectedTabChange` | `(tab: "all" \| "unread") => void` | —          | Called when the tab changes                     |
| `onSettingsClick`     | `() => void`                       | —          | Called when the header settings icon is clicked |
| `onItemClick`         | `(id: string) => void`             | —          | Called when a notification row is clicked       |
| `className`           | `string`                           | —          | Merged onto the root                            |

## Structure

- Header: `Tabs` (All / Unread, each with a count badge) plus a `Button` (`variant="icon-ghost"`, `icon={<Icon id="settings-icon" />}`) — the settings control reuses the shared `components/ui/button` instance from Figma (node `8470:19834`) rather than a raw `<button>`. `icon-ghost` matches the other standalone icon buttons sitting in a panel header (e.g. `FloatingProfile`'s close button); the alternative `icon-rounded` is reserved for paired stepper controls (e.g. `GoalSetting`'s count +/-).
- List: `NotiItem` rows (`components/app/noti-item`) wrapped in `<li>` inside a `<ul>`. **The list is always fixed to a six-row height and scrolls past six items**, using the same track/thumb approach as `DropdownList` and `Select`. The height limit is applied through an inline `style` rather than a Tailwind arbitrary-value class — in `calc()`, a `+` or `-` without surrounding whitespace invalidates the whole declaration and is silently dropped.
- `unread` items show `NotiItem`'s dot, and the "Unread" tab filters to `unread === true`.
- `NotiItem` is a `<button>`, so list rows are clickable too. They are treated as the same entry point as the header Settings icon — `Gnb` wires both to one handler that opens the Notification section of the Settings panel.

## States and behaviors

- The background is `--gb-background-overlay`, which renders as a light card. The root `dark` class exists to resolve the descendant semantic tokens; it does not darken the background itself.
