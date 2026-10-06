import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import { Select, type SelectOption, type SelectProps } from "./select";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%E2%9D%84%EF%B8%8F-GB_Design-System-%E2%80%94-Atom?node-id=614-2466";

type SelectType = SelectProps["type"];

// Figma 목업(node 3466:274) 확정 6개 항목 — 국가명은 Figma 그대로, 국번은 실제 정확한 국제전화 코드로 교정
const COUNTRY_NUMBER_OPTIONS: SelectOption[] = [
  { value: "kr", label: "South Korea", code: "+82" },
  { value: "ru", label: "Russia", code: "+7" },
  { value: "gr", label: "Greece", code: "+30" },
  { value: "nl", label: "Netherlands", code: "+31" },
  { value: "be", label: "Belgium", code: "+32" },
  { value: "fr", label: "France", code: "+33" },
];

const SOCIAL_MEDIA_OPTIONS: SelectOption[] = [
  { value: "instagram", label: "Instagram" },
  { value: "threads", label: "Threads" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
];

const MBTI_OPTIONS: SelectOption[] = [
  { value: "istj", label: "ISTJ" },
  { value: "isfj", label: "ISFJ" },
  { value: "infj", label: "INFJ" },
  { value: "intj", label: "INTJ" },
  { value: "istp", label: "ISTP" },
  { value: "isfp", label: "ISFP" },
];

const SELF_OPTIONS: SelectOption[] = [
  { value: "saas-expert", label: "SaaS Expert" },
  { value: "morning-jogger", label: "Morning Jogger" },
  { value: "workflow-sculptor", label: "Workflow Sculptor" },
  { value: "sunday-baker", label: "Sunday Baker" },
  { value: "vintage-curator", label: "Vintage Curator" },
  { value: "brooklyn-observer", label: "Brooklyn Observer" },
];

const FREQUENCY_OPTIONS: SelectOption[] = [
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" },
];

// type별 기본(Figma 그대로) 옵션 — Controls 패널에서 "type"을 바꾸면 그 타입에 맞는
// 실제 텍스트로 전환되도록 ControlledSelect가 참조하는 매핑
const OPTIONS_BY_TYPE: Record<SelectType, SelectOption[]> = {
  "country-number": COUNTRY_NUMBER_OPTIONS,
  "social-media": SOCIAL_MEDIA_OPTIONS,
  mbti: MBTI_OPTIONS,
  self: SELF_OPTIONS,
  frequency: FREQUENCY_OPTIONS,
};

interface ControlledSelectProps {
  type: SelectType;
  style?: SelectProps["style"];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

// 실제 사용 화면과 동일하게 "옵션 클릭 → 리스트 닫힘 + 트리거 라벨 갱신"이 되도록 값을 들고 있고,
// Controls 패널에서 "type"을 바꾸면 그 타입에 맞는 실제 옵션 목록으로 전환되도록 재계산함
function ControlledSelect({
  type,
  value: initialValue,
  onValueChange,
  ...rest
}: ControlledSelectProps) {
  const options = OPTIONS_BY_TYPE[type];
  const [value, setValue] = React.useState(initialValue ?? options[0]?.value);
  const prevType = React.useRef(type);

  React.useEffect(() => {
    if (prevType.current !== type) {
      setValue(OPTIONS_BY_TYPE[type][0]?.value);
      prevType.current = type;
    }
  }, [type]);

  return (
    <Select
      {...rest}
      type={type}
      options={options}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onValueChange?.(next);
      }}
    />
  );
}

const meta = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: FIGMA_URL,
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["country-number", "social-media", "mbti", "self", "frequency"],
    },
    style: {
      control: "select",
      options: ["primary", "reverse", "mute", "icon"],
      description:
        "type에 따라 의미가 다름 (self: primary/reverse/mute, social-media: primary/icon)",
    },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    placeholder: { control: "text" },
  },
  args: {
    type: "social-media",
    options: SOCIAL_MEDIA_OPTIONS,
    placeholder: "Select social media...",
    disabled: false,
    error: false,
    onValueChange: fn(),
  },
  render: (args) => <ControlledSelect {...args} />,
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
