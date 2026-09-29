import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, within } from "storybook/test";

import { Button } from "../button/button";
import { GoogleButton } from "../google-button/google-button";
import { ButtonGroup } from "./button-group";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%E2%9D%84%EF%B8%8F-GB_Design-System---Atom?node-id=3466-29935";

const meta = {
  title: "UI/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  args: {
    children: null,
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

// 가로 2-버튼 페어(skippable/back and forth/save/confirm/Error)는 Figma auto-layout에서
// 두 버튼 모두 flex-grow:1, flex-shrink:0, flex-basis:0(균등 분배)로 설정되어 있어
// 텍스트 길이와 무관하게 항상 동일한 폭으로 렌더링됩니다.
const EQUAL_WIDTH_CLASS = "flex-[1_0_0]";

// Type=skippable, Disabled=false/true (node-id 3466:29134 / 3800:4854)
export const Skippable: Story = {
  render: () => (
    <ButtonGroup orientation="horizontal" gap="2" className="w-[344px]">
      <Button variant="outline" className={EQUAL_WIDTH_CLASS}>
        Later
      </Button>
      <Button variant="primary" className={EQUAL_WIDTH_CLASS}>
        Go Next
      </Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("button", { name: "Later" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "Go Next" }),
    ).toBeInTheDocument();
  },
};

export const SkippableDisabled: Story = {
  render: () => (
    <ButtonGroup orientation="horizontal" gap="2" className="w-[344px]">
      <Button variant="outline" disabled className={EQUAL_WIDTH_CLASS}>
        Later
      </Button>
      <Button variant="primary" disabled className={EQUAL_WIDTH_CLASS}>
        Go Next
      </Button>
    </ButtonGroup>
  ),
};

// Type=back and forth, Disabled=false/true (node-id 3507:7795 / 3800:4840)
export const BackAndForth: Story = {
  render: () => (
    <ButtonGroup orientation="horizontal" gap="2" className="w-[344px]">
      <Button variant="outline" className={EQUAL_WIDTH_CLASS}>
        Go back
      </Button>
      <Button variant="primary" className={EQUAL_WIDTH_CLASS}>
        Go Next
      </Button>
    </ButtonGroup>
  ),
};

export const BackAndForthDisabled: Story = {
  render: () => (
    <ButtonGroup orientation="horizontal" gap="2" className="w-[344px]">
      <Button variant="outline" disabled className={EQUAL_WIDTH_CLASS}>
        Go back
      </Button>
      <Button variant="primary" disabled className={EQUAL_WIDTH_CLASS}>
        Go Next
      </Button>
    </ButtonGroup>
  ),
};

// Type=save, Disabled=false/true (node-id 3590:7828 / 3800:4886)
export const Save: Story = {
  render: () => (
    <ButtonGroup orientation="horizontal" gap="2" className="w-[344px]">
      <Button variant="outline" className={EQUAL_WIDTH_CLASS}>
        Cancel
      </Button>
      <Button variant="primary" className={EQUAL_WIDTH_CLASS}>
        Save
      </Button>
    </ButtonGroup>
  ),
};

export const SaveDisabled: Story = {
  render: () => (
    <ButtonGroup orientation="horizontal" gap="2" className="w-[344px]">
      <Button variant="outline" disabled className={EQUAL_WIDTH_CLASS}>
        Cancel
      </Button>
      <Button variant="primary" disabled className={EQUAL_WIDTH_CLASS}>
        Save
      </Button>
    </ButtonGroup>
  ),
};

// Type=confirm, Disabled=false/true (node-id 3622:8049 / 3800:4889)
export const Confirm: Story = {
  render: () => (
    <ButtonGroup orientation="horizontal" gap="2" className="w-[344px]">
      <Button variant="outline" className={EQUAL_WIDTH_CLASS}>
        Cancel
      </Button>
      <Button variant="primary" className={EQUAL_WIDTH_CLASS}>
        Confirm
      </Button>
    </ButtonGroup>
  ),
};

export const ConfirmDisabled: Story = {
  render: () => (
    <ButtonGroup orientation="horizontal" gap="2" className="w-[344px]">
      <Button variant="outline" disabled className={EQUAL_WIDTH_CLASS}>
        Cancel
      </Button>
      <Button variant="primary" disabled className={EQUAL_WIDTH_CLASS}>
        Confirm
      </Button>
    </ButtonGroup>
  ),
};

// Type=Error, Disabled=false/true (node-id 3649:12031 / 3800:4892)
export const ErrorGroup: Story = {
  render: () => (
    <ButtonGroup orientation="horizontal" gap="2" className="w-[344px]">
      <Button variant="outline" className={EQUAL_WIDTH_CLASS}>
        Refresh
      </Button>
      <Button variant="primary" className={EQUAL_WIDTH_CLASS}>
        Back to Dashboard
      </Button>
    </ButtonGroup>
  ),
};

export const ErrorGroupDisabled: Story = {
  render: () => (
    <ButtonGroup orientation="horizontal" gap="2" className="w-[344px]">
      <Button variant="outline" disabled className={EQUAL_WIDTH_CLASS}>
        Refresh
      </Button>
      <Button variant="primary" disabled className={EQUAL_WIDTH_CLASS}>
        Back to Dashboard
      </Button>
    </ButtonGroup>
  ),
};

// Type=active account (node-id 3685:370) — disabled 변형이 Figma에 없어 미제공
export const ActiveAccount: Story = {
  render: () => (
    <ButtonGroup
      orientation="vertical"
      gap="2"
      className="w-[calc(var(--scale-200)*1px)]"
    >
      <Button variant="primary">Change Plan</Button>
      <Button variant="link">Pause account</Button>
    </ButtonGroup>
  ),
};

// Type=pause account (node-id 3685:413) — disabled 변형이 Figma에 없어 미제공
export const PauseAccount: Story = {
  render: () => (
    <ButtonGroup
      orientation="vertical"
      gap="2"
      className="w-[calc(var(--scale-200)*1px)]"
    >
      <Button variant="primary">Change Plan</Button>
      <Button variant="link">Resume account</Button>
    </ButtonGroup>
  ),
};

// Type=edit (node-id 3466:29936) — disabled 변형이 Figma에 없어 미제공.
// 아이콘은 Figma 레이어명 `lucide/share-2` 그대로 share-2-icon 사용.
export const Edit: Story = {
  render: () => (
    <ButtonGroup orientation="horizontal" gap="2-5" className="w-[344px]">
      <Button variant="icon" icon="share-2-icon" />
      <Button variant="outline" className={EQUAL_WIDTH_CLASS}>
        Edit Goal
      </Button>
      <Button variant="primary" className={EQUAL_WIDTH_CLASS}>
        Edit Assets
      </Button>
    </ButtonGroup>
  ),
};

// Type=enter (node-id 3523:6856) — disabled 변형이 Figma에 없어 미제공.
// 컨테이너 폭 344px은 매칭되는 --scale-*(320/384만 존재) 토큰이 없는 Figma 확정값이라
// button.tsx의 36px 높이 관례와 동일하게 그대로 사용합니다.
export const Enter: Story = {
  render: () => (
    <ButtonGroup orientation="vertical" gap="3" className="w-[344px]">
      <Button variant="primary">Join for free</Button>
      <Button variant="outline">Log in</Button>
    </ButtonGroup>
  ),
};

// `disabled` prop(Figma에 없는 코드 레벨 편의 기능, 2026-09-27 사용자 확정) —
// 그룹째로 넘기면 children인 두 Button 모두 자동으로 disabled 처리됩니다.
export const GroupDisabledProp: Story = {
  render: () => (
    <ButtonGroup
      orientation="horizontal"
      gap="2"
      disabled
      className="w-[344px]"
    >
      <Button variant="outline" className={EQUAL_WIDTH_CLASS}>
        Cancel
      </Button>
      <Button variant="primary" className={EQUAL_WIDTH_CLASS}>
        Confirm
      </Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("button", { name: "Cancel" })).toBeDisabled();
    await expect(
      canvas.getByRole("button", { name: "Confirm" }),
    ).toBeDisabled();
  },
};

// Type=login (node-id 3490:7964) — GoogleButton + 안내 문구 + 텍스트링크, 이 스토리
// 전용 조합이라 별도 컴포넌트로 추출하지 않고 JSX로 직접 구성. disabled 변형은
// Figma에 없어 미제공.
export const Login: Story = {
  render: () => (
    <ButtonGroup orientation="vertical" gap="3" className="w-[344px]">
      <GoogleButton />
      <div className="flex items-center justify-center gap-[var(--spacing-1-5)]">
        <span className="text-sm-regular text-foreground">
          Don&apos;t have an account?
        </span>
        <Button variant="link">Sign up</Button>
      </div>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("button", { name: "Continue with Google" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "Sign up" }),
    ).toBeInTheDocument();
  },
};
