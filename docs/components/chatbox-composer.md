# ChatboxComposer

- Code: `components/app/chatbox-composer/chatbox-composer.tsx` (`chatbox-composer.stories.tsx`, `chatbox-composer.test.tsx`, `index.ts`)
- Figma: [📌 GB_UXUI](https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-?node-id=8158-31088) `Chatbox slot` node `8158:31088`

## Overview

A composite bundling the three kinds of content that go into the `children` slot of `Chatbox` (`components/ui/chatbox`, Figma `-> Slot`): an image thumbnail row, a filter chips row, and a sentence-option row. When `Chatbox` turns its slot on, this is what fills it.

## When to use

- When an attachment preview, a filter chips row, or a list of options must appear above the prompt input.

## When not to use

- If no slot content is needed, use `components/ui/chatbox` directly.

## How to use

```tsx
<ChatboxComposer onSend={handleSend} />
<ChatboxComposer images={images} onRemoveImage={handleRemove} onSend={handleSend} />
<ChatboxComposer variant="chips" selectedChip={filter} onChipChange={setFilter} />
<ChatboxComposer variant="sentence-option" selectedSentenceOption={i} onSentenceOptionChange={setI} />
```

## Props

| Prop                                                                                  | Type                                                   | Default                   | Description                                                                                             |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------- |
| `variant`                                                                             | `"default" \| "image" \| "chips" \| "sentence-option"` | `"default"`               | Which content to show in the slot                                                                       |
| `images` / `defaultImages`                                                            | `{ src: string; alt?: string }[]`                      | —                         | Controlled / uncontrolled attachment list. When present the thumbnail row shows regardless of `variant` |
| `onRemoveImage`                                                                       | `(index: number) => void`                              | —                         | Called when an image's remove badge is clicked                                                          |
| `onAttach`                                                                            | `() => void`                                           | —                         | Called when the attach button is clicked                                                                |
| `selectedChip` / `defaultSelectedChip` / `onChipChange`                               | `number`                                               | `0`                       | `variant="chips"` only                                                                                  |
| `selectedSentenceOption` / `defaultSelectedSentenceOption` / `onSentenceOptionChange` | `number \| null`                                       | `null` (nothing selected) | `variant="sentence-option"` only                                                                        |

Everything else is inherited from `Chatbox` (`value`, `onValueChange`, `disabled`, `onSend`, …), except `children`, `onAttachFiles`, `accept`, and `multiple`.

## Structure

- **Image row** — 81px square thumbnails (`object-cover`) with a remove badge pinned to the top-right corner. The badge stays light even though the whole Chatbox is dark; it is the only exception.
- **Chips row** — reuses `Chips` (`variant="secondary"`) with the labels `All` / `Image` / `Text`, toggled through `selected`. There is no remove (X) badge: these are filter choices, not deletable items.
- **Sentence-option row** — not `Chips` but a dedicated `<button>`: full width at 36px tall, label centered with no icon, and `background-mute` + `text-static-white` when selected. Nothing is selected initially (`null`).
- Attachments arrive through `Chatbox`'s `onAttachFiles`, become blob-URL thumbnails, and are cleaned up with `URL.revokeObjectURL` on removal (managed automatically in uncontrolled mode only).

## States and behaviors

- **`variant` and `images` are independent.** When `images` is present, the image row shows even for `variant="chips"` or `"sentence-option"` — each row has its own toggle. Figma's `Type=image` variant pins three images as static content, so the Storybook Playground shows three sample thumbnails when `variant="image"` is selected and no `images` prop is given. That is story-only demo logic, not component behavior.
- **The selected look for sentence options has no Figma design.** All three rows of Figma's `Type=options` are drawn unselected (white background), and the shared `Button` component those rows use has no persistent "selected" variant — only `Status=active` for hover and press, and its description explicitly says not to use Button for persistent state. The `isSelected` highlight in code (`background-mute` + `text-static-white`) reuses the `Status=active` token pairing, a decision made in code because the user has to see which option they picked.
