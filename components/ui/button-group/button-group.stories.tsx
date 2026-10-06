import type { Meta, StoryObj } from "@storybook/nextjs";

import { Button } from "../button/button";
import { ButtonGroup } from "./button-group";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%E2%9D%84%EF%B8%8F-GB_Design-System---Atom?node-id=3466-29935";

// Figma auto-layout에서 가로 2-버튼 페어는 flex-grow:1/shrink:0/basis:0(균등 분배)로
// 설정되어 있어 텍스트 길이와 무관하게 항상 동일한 폭으로 렌더링됩니다.
const EQUAL_WIDTH_CLASS = "flex-[1_0_0]";

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
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    gap: {
      control: "select",
      options: ["1-5", "2", "2-5", "3"],
    },
    disabled: {
      control: "boolean",
      description:
        "그룹 내 모든 Button/GoogleButton children을 한번에 비활성화 (Figma에 없는 코드 레벨 편의 기능)",
    },
  },
  args: {
    orientation: "horizontal",
    gap: "2",
    disabled: false,
    children: null,
  },
  render: (args) => (
    <ButtonGroup {...args} className="w-[344px]">
      <Button variant="outline" className={EQUAL_WIDTH_CLASS}>
        Cancel
      </Button>
      <Button variant="primary" className={EQUAL_WIDTH_CLASS}>
        Confirm
      </Button>
    </ButtonGroup>
  ),
} satisfies Meta<typeof ButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
