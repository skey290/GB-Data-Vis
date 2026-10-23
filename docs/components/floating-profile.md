# FloatingProfile

- Code: `components/app/floating-profile/floating-profile.tsx` (`floating-profile.stories.tsx`, `floating-profile.test.tsx`, `index.ts`)
- Figma: [📌 GB_UXUI](https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8163-92774) `Floating profile` node `8163:92774`

## Overview

A profile avatar bubble that expands into a floating card on click, showing a role-name tab header, a `ProfilePrint` portrait, and a "Known for Now / Known for Next" summary reused from `GoalSetting`'s data model. Ends with a single full-width CTA button (default "Create a post").

If `avatarSrc` is omitted the bubble renders Figma's "no profile" fallback (`Avatar`'s icon state) and the click target is disabled — there is no card to expand without a photo.

## When to use

- Anywhere a user's avatar bubble should expand into a read-only "Known for Now/Next" summary plus a photo and a CTA — currently `app/assets/page.tsx` and `app/compass/page.tsx`.

## How to use

```tsx
<FloatingProfile
  avatarSrc={avatarSrc}
  title="Modeling Partner"
  portraitSrc={portraitSrc}
  timestamp="2026.03.24 19:24:06"
  now="I'm known for financial modeling and data analysis in early-stage startups."
  goal="I'm known for Finance-Fluent Modeling Partner for early-stage SaaS founders."
  postingCount={3}
  postingFrequency="Day"
  targetedFollowersIndex={1}
  timeframe="1 year"
  onEditGoal={openGoalEditor}
  onCtaClick={createPost}
/>
```

## Props

| Prop                                                                         | Type                                  | Default                          | Description                                                                                                                                                    |
| ---------------------------------------------------------------------------- | ------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open` / `onOpenChange`                                                      | `boolean` / `(open: boolean) => void` | `true`                           | Card expanded state                                                                                                                                            |
| `avatarSrc` / `avatarAlt`                                                    | `string`                              | —                                | Avatar bubble image. Omitted ⇒ Figma "no profile" fallback, click disabled                                                                                     |
| `title`                                                                      | `string`                              | —                                | Role-name tab header (required)                                                                                                                                |
| `portraitSrc` / `portraitAlt`                                                | `string`                              | —                                | Passed straight through to `ProfilePrint`                                                                                                                      |
| `timestamp`                                                                  | `string`                              | —                                | Passed straight through to `ProfilePrint`                                                                                                                      |
| `imageHover`                                                                 | `boolean`                             | `false`                          | Forces `ProfilePrint`'s hover overlay — same escape hatch as `ProfilePrint` itself                                                                             |
| `onEditImage`                                                                | `() => void`                          | —                                | Relayed to `ProfilePrint`'s "Edit Asset Image" button                                                                                                          |
| `now`                                                                        | `string`                              | —                                | "Known for Now" statement (required)                                                                                                                           |
| `goal`                                                                       | `string`                              | —                                | "Known for Next" statement (required)                                                                                                                          |
| `postingCount` / `postingFrequency` / `targetedFollowersIndex` / `timeframe` | see `GoalSetting`                     | `3` / `"Day"` / `1` / `"1 year"` | Feed the shared `SettingsSentence` ("I post `{frequency}`, aiming for `{followers}` followers, within `{timeframe}`.")                                         |
| `onEditGoal`                                                                 | `() => void`                          | —                                | The single pencil button next to "Known for Now" — opens a combined Now+Next edit flow (Figma only draws the pencil once; one entry point edits both sections) |
| `ctaLabel`                                                                   | `string`                              | `"Create a post"`                | Bottom full-width button label                                                                                                                                 |
| `onCtaClick`                                                                 | `() => void`                          | —                                | Bottom full-width button click                                                                                                                                 |

## Structure

- The photo section (portrait + timestamp + hover-to-edit overlay) is not reimplemented here — it delegates to `ProfilePrint type="completed"` with `className="w-full"` overriding its fixed 542px width. The four corner brackets are FloatingProfile's own decoration around that `ProfilePrint` box, matching Figma's "Print container" framing.
- "Known for Now"/"Known for Next" reuse `STATEMENT_BOX_CLASS` and `SettingsSentence` exported from `components/app/goal-setting` rather than duplicating GoalSetting's box styling or settings-sentence chip logic — both components summarize the same "My goal" data, just at different levels of detail (FloatingProfile: read-only summary; GoalSetting: full edit UI).
- The avatar bubble is a plain reset `<button>`, not the design-system `Button` — Figma's layer here is an `Avatar` instance, not a `Button` instance.
- `tagline`/`bio`/`onShare`/`onEditAssets` from the previous implementation were removed entirely — Figma no longer has UI for any of them after its "Known for Now/Next" redesign.

## States and behaviors

- `open` is accepted as an initial value but also tracked internally, so clicking the avatar reacts immediately even when a caller never updates the `open` prop (e.g. fixed Storybook args).
- The card unmounts only after its exit animation finishes (`onAnimationEnd`), so it doesn't disappear mid-animation.
