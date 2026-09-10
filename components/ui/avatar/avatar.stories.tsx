import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, within } from "storybook/test";

import { Avatar } from "./avatar";

const FIGMA_URL =
  "https://www.figma.com/design/PrsHuyyra9LzqqrDwmrB5P/%F0%9F%93%8C-GB_Design-System?node-id=3073-4051&t=0Rmc4ocqopcU6G52-4";

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  args: {
    variant: "icon",
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Icon: Story = {
  args: {
    variant: "icon",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole("img");

    await expect(avatar).toBeInTheDocument();
    await expect(avatar.className).toContain("border-muted");
  },
};

export const Initial: Story = {
  args: {
    variant: "initial",
    initials: "S",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("S")).toBeInTheDocument();
  },
};

export const Image: Story = {
  args: {
    variant: "image",
    src: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=128&h=128&fit=crop",
    alt: "사용자 프로필 사진",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const image = canvas.getByAltText("사용자 프로필 사진");

    await expect(image).toBeInTheDocument();
    await expect(image.tagName).toBe("IMG");
  },
};

export const ImageFallbackToInitial: Story = {
  name: "Image (load 실패 → Initial 폴백)",
  args: {
    variant: "image",
    src: "https://broken.invalid/does-not-exist.png",
    initials: "S",
    alt: "사용자 프로필 사진",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("이미지 로드가 실패하면 initials로 폴백한다", async () => {
      const image = canvas.getByAltText("사용자 프로필 사진");
      image.dispatchEvent(new Event("error"));

      await expect(await canvas.findByText("S")).toBeInTheDocument();
    });
  },
};

export const ImageFallbackToIcon: Story = {
  name: "Image (src 없음 → Icon 폴백)",
  args: {
    variant: "image",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole("img");

    await expect(avatar).toBeInTheDocument();
    await expect(avatar.querySelector("svg")).toBeInTheDocument();
  },
};
