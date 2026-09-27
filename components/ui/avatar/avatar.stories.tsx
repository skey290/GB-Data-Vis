import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, within } from "storybook/test";

import { Avatar } from "./avatar";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/GB_Design-System--Atom?node-id=3073-4051";

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
    shape: "circle",
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

// --- Type=Icon (Style=circle/rounded/rectangle) ---

export const Icon: Story = {
  args: {
    variant: "icon",
    shape: "circle",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole("img");

    await expect(avatar).toBeInTheDocument();
    await expect(avatar.className).toContain("border-[var(--border-subtle)]");
  },
};

export const IconRounded: Story = {
  args: {
    variant: "icon",
    shape: "rounded",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole("img");

    await expect(avatar.className).toContain(
      "rounded-[var(--radius-scale-md)]",
    );
  },
};

export const IconRectangle: Story = {
  args: {
    variant: "icon",
    shape: "rectangle",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole("img");

    await expect(avatar.className).toContain(
      "rounded-[var(--radius-scale-none)]",
    );
  },
};

// --- Type=Initial (Style=circle/rounded/rectangle) ---

export const Initial: Story = {
  args: {
    variant: "initial",
    shape: "circle",
    initials: "S",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("S")).toBeInTheDocument();
  },
};

export const InitialRounded: Story = {
  args: {
    variant: "initial",
    shape: "rounded",
    initials: "S",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole("img");

    await expect(avatar.className).toContain(
      "rounded-[var(--radius-scale-md)]",
    );
  },
};

export const InitialRectangle: Story = {
  args: {
    variant: "initial",
    shape: "rectangle",
    initials: "S",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole("img");

    await expect(avatar.className).toContain(
      "rounded-[var(--radius-scale-none)]",
    );
  },
};

// --- Type=Image (Style=circle/rounded/rectangle) ---

export const Image: Story = {
  args: {
    variant: "image",
    shape: "circle",
    src: "/images/personas/self-default.jpg",
    alt: "사용자 프로필 사진",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const image = canvas.getByAltText("사용자 프로필 사진");

    await expect(image).toBeInTheDocument();
    await expect(image.tagName).toBe("IMG");
  },
};

export const ImageRounded: Story = {
  args: {
    variant: "image",
    shape: "rounded",
    src: "/images/personas/self-default.jpg",
    alt: "사용자 프로필 사진",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const image = canvas.getByAltText("사용자 프로필 사진");

    await expect(image.parentElement?.className).toContain(
      "rounded-[var(--radius-scale-md)]",
    );
  },
};

export const ImageRectangle: Story = {
  args: {
    variant: "image",
    shape: "rectangle",
    src: "/images/personas/self-default.jpg",
    alt: "사용자 프로필 사진",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const image = canvas.getByAltText("사용자 프로필 사진");

    await expect(image.parentElement?.className).toContain(
      "rounded-[var(--radius-scale-none)]",
    );
  },
};

// --- 폴백 동작 (Figma에 없는, 실제 서비스 대응용 확장) ---

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
