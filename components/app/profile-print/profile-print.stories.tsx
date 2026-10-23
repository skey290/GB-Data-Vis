import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import { ProfilePrint } from "./profile-print";

const FIGMA_FILE =
  "https://www.figma.com/design/Wp6AZNGqC4qf2Sz5zQ2PzQ/%F0%9F%93%8C-GB_UXUI--261002-";

const PORTRAIT_SRC = "/images/personas/self-default.jpg";

const meta = {
  title: "App/ProfilePrint",
  component: ProfilePrint,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: `${FIGMA_FILE}?node-id=8163-92698`,
    },
    // Verbatim text from the Figma component's description field
    docs: {
      description: {
        component:
          "A card that prints a profile image. `type` carries three states: process (the in-progress loader), completed (the finished portrait with a timestamp), and upload (the empty state with a file-upload CTA). Implemented as ProfilePrint in components/app/profile-print.",
      },
    },
  },
  argTypes: {
    type: {
      control: "radio",
      options: ["process", "completed", "upload"],
    },
    timestamp: { control: "text" },
    imageHover: {
      control: "boolean",
      description:
        "`completed` 상태의 'Update this image' 호버 오버레이(Figma Status=hover)를 강제로 표시합니다. 실제 사용 시에는 CSS :hover/:focus-within로 자동 동작합니다.",
    },
  },
  args: {
    type: "process",
    timestamp: "2026.03.24 19:24:06",
    portraitSrc: PORTRAIT_SRC,
    imageHover: false,
    onFileSelect: fn(),
    onEditImage: fn(),
  },
} satisfies Meta<typeof ProfilePrint>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
