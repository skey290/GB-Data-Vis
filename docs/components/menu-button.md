# MenuButton

- Code: `components/app/menu-button/menu-button.tsx` (`menu-button.stories.tsx`, `menu-button.test.tsx`, `index.ts`)
- Figma: [📌 GB_Design-System (Atom)](https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%F0%9F%93%8C-GB_Design-System--Atom-?node-id=3436-812) node `3436:812` · [📌 GB_UXUI](https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8163-93014) `Part/GNB` node `8163:93014`

## Overview

A single navigation item in the GNB (sidebar). Depending on `type` it renders as icon only, icon plus label, or label only.

Figma's `Part/GNB` is `Type` (`text` / `icon + text`) × `Status` (`default` / `active` / `disabled`), six combinations. The code's `type="icon"` is not a seventh state — it is what `icon + text` looks like once the parent GNB is collapsed (`Expand=false`) and the label is hidden. Figma represents that same state by dropping in a shared `Button` (`variant="icon-ghost"`) instance instead of `Part/GNB`.

## When to use

- For GNB sidebar navigation items, and also for the fixed top rows such as the expand toggle, the notification bell, and settings — Figma treats all of these with the same Button / `Part/GNB` pattern rather than separate components. For the bell, compute `icon` from the unread state and pass either `dot-bell-icon` (a single bell-with-dot asset) or `Bell`; see `components/app/gnb/gnb.tsx`.

## When not to use

- For ordinary buttons outside the GNB, use the shared `Button`. `MenuButton` assumes a GNB expand toggle and a "currently selected item" state.

## How to use

```tsx
<MenuButton type="icon-with-text" icon={Home} label="Dashboard" />
<MenuButton type="text" label="Dashboard" status="active" />
<MenuButton type="icon" icon={Home} aria-label="Dashboard" />
```

## Structure

- The root is a single `<button>` with `overflow: hidden`. For `type="icon"` and `"icon-with-text"` a `<span>` wraps the icon; the label is always mounted in the DOM regardless of `type` and only its `opacity` transitions. Width changes are left entirely to the GNB root's own `transition-[width]`, so the narrowing button naturally clips the overflowing label.
  When using this in a GNB top row (other than the toggle), always pass `className="w-full"` whether collapsed or expanded. Without it, the hidden label still occupies width, pushing the centered icon off-screen.
- Figma has no hover state — hover, press, and select all look identical to `active` — so hovering shows the `active` style (`showActiveStyle = isActive || isHovered`). The custom text utilities in `text-styles.css` cannot be driven by Tailwind's `hover:` variant, so this is handled with `onMouseEnter` / `onMouseLeave` state rather than CSS.

## Props

| Prop     | Type                                   | Default     | Description                                                                                          |
| -------- | -------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `type`   | `"icon" \| "icon-with-text" \| "text"` | `"icon"`    | Figma `Type`. `icon` is the collapsed-GNB appearance (see Overview)                                  |
| `status` | `"default" \| "active" \| "disabled"`  | `"default"` | Figma `Status`. Disabled is expressed only through this — the native `disabled` prop is not accepted |
| `icon`   | `LucideIcon`                           | —           | Icon rendered for `type="icon"` and `"icon-with-text"`                                               |
| `label`  | `string`                               | —           | Label rendered for `type="icon-with-text"` and `"text"`                                              |

## States and behaviors

- **Icon box radius** — `default` and `disabled` are `radius-full` with no background; `active` (selected or hovered) is `radius-lg` (10px) with `background-mute`. That is the same token pairing as the shared `Button`'s `icon-ghost` variant, because `Part/GNB`'s icon box is a `Button(icon-ghost)` instance in Figma. The values are duplicated rather than composed: `MenuButton`'s root is already a `<button>`, and a `<Button>` (also a `<button>`) cannot be nested inside one.
- **disabled** — native `disabled`, no `aria-current`. The label becomes `--gb-text-static-gray`.
- **active** — `aria-current="true"`. The visual flag (`showActiveStyle`) is kept separate from actual selection (`isActive`) so hovering never changes `aria-current`.
