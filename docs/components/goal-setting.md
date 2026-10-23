# GoalSetting

- Code: `components/app/goal-setting/goal-setting.tsx` (`goal-setting.stories.tsx`, `goal-setting.test.tsx`, `index.ts`)
- Figma: [📌 GB_UXUI](https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8428-155255) `goal` node `8428:155255`

## Overview

The "My goal" card shared by Know Thyself's "Edit Goal" and Content Studio's "My goal". It has two sections, each independently editable:

- **Known for Now** — a single statement.
- **Known for Next** — a statement plus a settings sentence ("I post `{frequency}`, aiming for `{followers}` followers, within `{timeframe}`.") whose three values are editable through inline chip panels.

Each section toggles between a read view (a single clickable box; click it or its pencil button to edit) and an edit view (`Textarea` + `Cancel`/`Save`). Each section also has a collapsible "Gabrielle suggests N actions" accordion listing suggested actions with a `Run` button, shown only when actions are provided.

## When to use

- Identically in Know Thyself's "Edit Goal" modal and Content Studio's "My goal" modal.

## How to use

```tsx
<GoalSetting
  defaultNow="I'm known for financial modeling and data analysis in early-stage startups."
  defaultGoal="I'm known for Finance-Fluent Modeling Partner for early-stage SaaS founders."
  defaultPostingCount={3}
  defaultPostingFrequency="Day"
  defaultTargetedFollowersIndex={1}
  defaultTimeframe="1 year"
  nowActions={[
    {
      id: "a1",
      category: "Content Studio",
      label: "Draft 3 posts",
      onRun: runDraft,
    },
  ]}
  goalActions={[
    {
      id: "a2",
      category: "Assets",
      label: "Create a pitch deck in Assets",
      onRun: runDeck,
    },
  ]}
  onClose={close}
/>
```

## Props

Controlled/uncontrolled pairs are listed as `value` / `defaultValue`. Passing nothing is uncontrolled; passing only `defaultX` sets the initial uncontrolled value; passing `x` makes it fully controlled.

| Prop                                                       | Type                                                | Default    | Description                                                                         |
| ---------------------------------------------------------- | --------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------- |
| `now` / `defaultNow`                                       | `string`                                            | `""`       | "Known for Now" statement. Empty renders a fixed guidance sentence in its place     |
| `onNowChange`                                              | `(value: string) => void`                           | —          | Called when the Now edit is saved                                                   |
| `nowActions`                                               | `GoalSettingAction[]`                               | `[]`       | Suggested actions for Now's Gabrielle accordion. Empty hides the accordion entirely |
| `goal` / `defaultGoal`                                     | `string`                                            | `""`       | "Known for Next" statement                                                          |
| `onGoalChange`                                             | `(value: string) => void`                           | —          | Called when the Goal edit is saved                                                  |
| `goalActions`                                              | `GoalSettingAction[]`                               | `[]`       | Suggested actions for Goal's Gabrielle accordion                                    |
| `postingCount` / `defaultPostingCount`                     | `number`                                            | `3`        | Posting Frequency stepper value                                                     |
| `postingFrequency` / `defaultPostingFrequency`             | `"Day" \| "Week" \| "Month"`                        | `"Day"`    | Posting Frequency toggle                                                            |
| `targetedFollowersIndex` / `defaultTargetedFollowersIndex` | `number` (0–5)                                      | `1`        | Index into `TARGETED_FOLLOWERS_LABELS`                                              |
| `timeframe` / `defaultTimeframe`                           | `"1 month" \| "3 months" \| "6 months" \| "1 year"` | `"1 year"` |                                                                                     |
| `onClose`                                                  | `() => void`                                        | —          | Card's close (X) button                                                             |

`GoalSettingAction`: `{ id: string; category: string; label: string; onRun?: () => void }`. `category` is the text shown in the leading Badge (e.g. `"Assets"`, `"Content Studio"`).

## Structure

- Each section's read-mode box (the statement) and the pencil button both open the same edit mode — the box itself is a clickable element (`role="button"`), matching Figma's "(clickable)" naming on that layer.
- Editing is a buffered transaction: entering edit mode snapshots the current value(s) into local draft state; `Save` commits the draft through the `onXChange` callbacks (or internal state when uncontrolled); `Cancel` discards the draft and exits without calling anything.
- The settings sentence (`I post {chip}, aiming for {chip} followers, within {chip}.`) only renders once `goal` is non-empty — matches Figma, which has no divider/sentence at all in the empty-goal mockups. Its three chips are always `Chips variant="outline"`, in both read and edit mode. The chip matching whichever settings panel is currently open (`frequency`/`followers`/`timeframe`) gets `selected`; the other two stay unselected (border only, no fill). In read mode no panel is ever open, so none of the three chips are ever selected there.
- Clicking a settings chip opens the matching inline panel (`Posting Frequency` stepper + Day/Week/Month toggle, `Targeted Followers` `Slider`, or `Timeframe` toggle list) inside the same statement box, dashed-border/`radius-3xl`/`shadow-lg`. Clicking the same chip again closes it; clicking a different chip switches panels. Panel edits live in the same Goal draft buffer and are only committed on `Save`.
- `Button`, `Badge`, `Chips`, `Slider`, and `Textarea` are reused unmodified — no new CSS or new general-purpose components were added. `Badge variant="alarm"` is the "Needs approval" badge; `Badge variant="outline"` is the action row's category badge; the `Run` button and the Cancel/Posting-Frequency-toggle/Timeframe-toggle buttons are all `Button variant="outline"` (selected ones add `isSelected`); `Save` is `Button variant="primary"`.
- Targeted Followers' bottom scale labels use the same percent-of-thumb-range formula as the `Slider` thumb rather than Figma's static evenly-spaced layout — inherited from the previous implementation's user-confirmed decision that a working slider's labels should track the thumb's value range. Flag if literal Figma spacing is preferred instead.
- The "Gabrielle suggests N actions" accordion renders at most 3 action rows plus a "+ N more" line when there are more.

## States and behaviors

- `now`/`goal` empty render a fixed guidance sentence (not a placeholder attribute) in the statement's own text color.
- Only one section can be in edit mode at a time; opening edit on the other section switches away from (and discards) any unsaved draft in the first.
- `nowActions`/`goalActions`, `postingCount`, `postingFrequency`, `targetedFollowersIndex`, and `timeframe` all support the controlled/uncontrolled pair, so the component works immediately in Storybook Controls or a minimally wired consumer.
