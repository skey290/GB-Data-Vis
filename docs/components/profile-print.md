# ProfilePrint

- Code: `components/app/profile-print/profile-print.tsx` (`profile-print.module.css`, `profile-print.stories.tsx`, `profile-print.test.tsx`, `index.ts`)
- Figma: [📌 GB_UXUI](https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8163-92698) `Part/print` node `8163:92698`

## Overview

A 542px-wide profile-image "print" card with three states driven by `type`:

- **`process`** — a square shimmer loader with a centered "Processing" spinner badge.
- **`completed`** — the finished square portrait with a bottom-right timestamp. Hovering (or focus) blurs the portrait and shows an "Update this image" edit overlay (Figma `Status=hover`).
- **`upload`** — an empty-state CTA card ("Let's create your brand image!" + "Open your folder") that triggers a hidden file input.

## When to use

- Inside `FloatingProfile`'s photo section (`type="completed"`, wrapped in a `w-full` override).
- Anywhere else a profile/asset image needs this process → completed → upload lifecycle card.

## How to use

```tsx
<ProfilePrint type="process" timestamp="2026.03.24 19:24:06" />
<ProfilePrint type="completed" portraitSrc={src} timestamp={timestamp} onEditImage={openEditor} />
<ProfilePrint type="upload" onFileSelect={handleFile} />
```

## Props

| Prop                                                  | Type                                   | Default                 | Description                                                                                                                            |
| ----------------------------------------------------- | -------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `type`                                                | `"process" \| "completed" \| "upload"` | `"process"`             | Figma `Type`                                                                                                                           |
| `timestamp`                                           | `string`                               | `"2026.03.24 19:24:06"` | Bottom-right timestamp, `process`/`completed` only                                                                                     |
| `portraitSrc` / `portraitAlt`                         | `string`                               | —                       | `completed` only                                                                                                                       |
| `imageHover`                                          | `boolean`                              | `false`                 | Forces the `completed` hover overlay — an escape hatch for Storybook/tests, since the real interaction is CSS `:hover`/`:focus-within` |
| `onEditImage`                                         | `() => void`                           | —                       | Hover overlay's "Edit Asset Image" button                                                                                              |
| `emptyStateBackgroundSrc` / `emptyStateBackgroundAlt` | `string`                               | —                       | Optional image dropped behind the `upload` empty state. Unset renders the plain white-border look (matches Figma)                      |
| `onFileSelect`                                        | `(file: File \| null) => void`         | —                       | `upload` only — fires after the hidden file input's selection                                                                          |

## Structure

- `Skeleton`, `Spinner`, and `Button` (`variant="mute"`/`"outline"`) are reused unmodified — no new general-purpose components.
- The hover overlay is implemented with CSS pseudo-classes in `profile-print.module.css`, gated by `@media (hover: hover)` so touch devices don't get a stuck hover state; `:focus-within` is ungated so keyboard focus can still reach the overlay.
- Figma's `type=upload` background was a flattened "Subtract" shape identical in size to the other states' `bg-white` + padding border, not a real image asset — `emptyStateBackgroundSrc` only exists as a future extension point, not to reproduce something currently in the design.

## States and behaviors

- `process`/`upload` are unchanged from the earlier implementation; `completed`'s hover overlay (blur + "Update this image" + "Edit Asset Image") is the one addition, matching Figma `Status=hover`.
- `onFileSelect` and the hidden file input exist because Figma's `upload` state is a static mockup — the actual file-picking behavior was added in code, following the same pattern as `input-image.tsx`'s sr-only file input.
