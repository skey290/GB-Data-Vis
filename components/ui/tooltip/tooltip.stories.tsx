import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, fn, userEvent, within } from "storybook/test";

import { Tooltip } from "./tooltip";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%E2%9D%84%EF%B8%8F-GB_Design-System-%E2%80%94-Atom?node-id=79-11350";

const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  args: {
    title: "Title",
    description: "Tool tip text",
    // 실 서비스에서는 기본 700ms 지연이지만, 스토리/테스트에서는 즉시 열리도록 0으로 고정
    delayDuration: 0,
    children: <button type="button">Hover me</button>,
  },
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Hover me" });

    await userEvent.hover(trigger);

    const body = within(document.body);
    const title = await body.findByText("Title");
    const description = await body.findByText("Tool tip text");

    await expect(title).toBeInTheDocument();
    await expect(title.className).toContain("text-sm-semi-bold");
    await expect(description).toBeInTheDocument();

    const content = title.closest('[role="tooltip"]');
    await expect(content?.className).toContain("bg-primary");
  },
};

export const Inversed: Story = {
  args: {
    variant: "inversed",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Hover me" });

    await userEvent.hover(trigger);

    const body = within(document.body);
    const title = await body.findByText("Title");
    const contentRoot = title.closest('[role="tooltip"]');

    // Figma 확정값(node 79:11350): Inversed는 --background-bold의 다크모드 리터럴로
    // 고정된 전용 토큰(--tooltip-inversed-bg)을 쓰지, Shadcn 시맨틱 --background와는 무관
    await expect(contentRoot?.className).toContain("--tooltip-inversed-bg");
  },
};

export const TitleOnly: Story = {
  args: {
    variant: "default",
    title: "Title only",
    description: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Hover me" });

    await userEvent.hover(trigger);

    const body = within(document.body);
    await expect(await body.findByText("Title only")).toBeInTheDocument();
  },
};

export const DescriptionOnly: Story = {
  args: {
    variant: "default",
    title: undefined,
    description: "Description only",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Hover me" });

    await userEvent.hover(trigger);

    const body = within(document.body);
    await expect(await body.findByText("Description only")).toBeInTheDocument();
  },
};

export const WithCloseButton: Story = {
  args: {
    variant: "default",
    onClose: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Hover me" });

    await userEvent.hover(trigger);

    const body = within(document.body);
    const closeButton = await body.findByRole("button", {
      name: "Close tooltip",
    });
    await userEvent.click(closeButton);

    await expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

export const BottomStart: Story = {
  name: "Direction: Below/Left",
  args: {
    variant: "default",
    side: "bottom",
    align: "start",
    open: true,
  },
};
