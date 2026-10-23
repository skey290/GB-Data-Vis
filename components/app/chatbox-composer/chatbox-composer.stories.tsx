import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import {
  ChatboxComposer,
  type ChatboxComposerImage,
  type ChatboxComposerProps,
} from "./chatbox-composer";

// Figma's `Type=image` variant is a static example with three thumbnails pinned
// as fixed content — switching to it is itself "three images attached". Storybook
// mirrors that: with no defaultImages given, selecting variant="image" shows
// sample thumbnails.
const SAMPLE_IMAGES: ChatboxComposerImage[] = [
  { src: "/images/personas/entrepreneur.jpg", alt: "Entrepreneur" },
  { src: "/images/personas/novelist.jpg", alt: "Novelist" },
  { src: "/images/personas/yoga-meditator.jpg", alt: "Yoga meditator" },
];

function ComposerPreview(props: ChatboxComposerProps) {
  const defaultImages =
    props.defaultImages ??
    (props.variant === "image" ? SAMPLE_IMAGES : undefined);

  return (
    <ChatboxComposer
      key={props.variant}
      {...props}
      defaultImages={defaultImages}
    />
  );
}

const meta = {
  title: "App/ChatboxComposer",
  component: ChatboxComposer,
  tags: ["autodocs"],
  parameters: {
    // Verbatim text from the Figma component's description field
    docs: {
      description: {
        component:
          "The content that goes into Chatbox's slot — image thumbnails with remove badges, filter chips, or sentence options. Implemented as ChatboxComposer in components/app/chatbox-composer. The three rows of Type=options (sentence-option) centre their labels with no icon and start fully unselected; Figma has no dedicated selected variant, so the highlight after a click reuses Button's Status=active tokens in code.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "image", "chips", "sentence-option"],
    },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    defaultValue: { control: "text" },
    defaultImages: {
      control: "object",
      description:
        "When omitted, three sample thumbnails are shown for variant=image.",
    },
    value: { control: false },
    images: { control: false },
  },
  args: {
    variant: "default",
    disabled: false,
    onValueChange: fn(),
    onAttach: fn(),
    onSend: fn(),
    onRemoveImage: fn(),
  },
  render: (args) => <ComposerPreview {...args} />,
} satisfies Meta<typeof ChatboxComposer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
