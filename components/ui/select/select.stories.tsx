import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { Select, type SelectOption, type SelectProps } from "./select";

const FIGMA_URL =
  "https://www.figma.com/design/G9YNa2vjdqDjnML9y5hXJ4/%E2%9D%84%EF%B8%8F-GB_Design-System-%E2%80%94-Atom?node-id=614-2466";

type SelectType = SelectProps["type"];

// Figma 목업(node 3466:274) 확정 6개 항목 — 국가명은 Figma 그대로, 국번은 실제 정확한 국제전화 코드로 교정
// (Figma 원본은 South Korea 행에 +1이 잘못 붙어 있었음; 나머지 5개국 코드는 Figma 값과 실제 코드가 일치)
const COUNTRY_NUMBER_OPTIONS: SelectOption[] = [
  { value: "kr", label: "South Korea", code: "+82" },
  { value: "ru", label: "Russia", code: "+7" },
  { value: "gr", label: "Greece", code: "+30" },
  { value: "nl", label: "Netherlands", code: "+31" },
  { value: "be", label: "Belgium", code: "+32" },
  { value: "fr", label: "France", code: "+33" },
];

// Figma 목업(node 3289:1458) 확정 6개 항목
const SOCIAL_MEDIA_OPTIONS: SelectOption[] = [
  { value: "instagram", label: "Instagram" },
  { value: "threads", label: "Threads" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
];

// Figma 목업(node 3657:8753)에 보이는 6종 — 실제 16종 전체 목록은 InputTest(input-test.tsx)에서 사용
const MBTI_OPTIONS: SelectOption[] = [
  { value: "istj", label: "ISTJ" },
  { value: "isfj", label: "ISFJ" },
  { value: "infj", label: "INFJ" },
  { value: "intj", label: "INTJ" },
  { value: "istp", label: "ISTP" },
  { value: "isfp", label: "ISFP" },
];

// Figma 목업(node 3763:11426 self) 공통 확정 6개 항목
const SELF_OPTIONS: SelectOption[] = [
  { value: "saas-expert", label: "SaaS Expert" },
  { value: "morning-jogger", label: "Morning Jogger" },
  { value: "workflow-sculptor", label: "Workflow Sculptor" },
  { value: "sunday-baker", label: "Sunday Baker" },
  { value: "vintage-curator", label: "Vintage Curator" },
  { value: "brooklyn-observer", label: "Brooklyn Observer" },
];

// Figma 목업(node 5122:13253) — "Days/Weeks/Months" 3종
const FREQUENCY_OPTIONS: SelectOption[] = [
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" },
];

// 타입별 기본(Figma 그대로) 옵션 — Controls 패널에서 "type"을 바꿔도 그 타입에 맞는
// 실제 텍스트로 전환되도록 ControlledSelect가 참조하는 매핑
const OPTIONS_BY_TYPE: Record<SelectType, SelectOption[]> = {
  "country-number": COUNTRY_NUMBER_OPTIONS,
  "social-media": SOCIAL_MEDIA_OPTIONS,
  mbti: MBTI_OPTIONS,
  self: SELF_OPTIONS,
  frequency: FREQUENCY_OPTIONS,
};

// 스크롤바/하단 chevron의 "다음 페이지로 스크롤" 동작을 시각적으로 확인하기 위한 6개 초과 목록.
// Figma는 각 타입에 6개 항목만 정의해뒀지만(7개 이상 스크롤 상태의 목업 자체가 없음), 타입마다
// 서로 다른 실제 콘텐츠로 구별되도록 Figma 6개 + 실제/맥락에 맞는 항목을 추가해 채움.
const SCROLLABLE_COUNTRY_NUMBER_OPTIONS: SelectOption[] = [
  ...COUNTRY_NUMBER_OPTIONS,
  { value: "de", label: "Germany", code: "+49" },
  { value: "it", label: "Italy", code: "+39" },
  { value: "es", label: "Spain", code: "+34" },
  { value: "pt", label: "Portugal", code: "+351" },
];

const SCROLLABLE_SOCIAL_MEDIA_OPTIONS: SelectOption[] = [
  ...SOCIAL_MEDIA_OPTIONS,
  { value: "x", label: "X" },
  { value: "pinterest", label: "Pinterest" },
  { value: "snapchat", label: "Snapchat" },
  { value: "reddit", label: "Reddit" },
];

// 나머지 10종은 실제 MBTI 16유형 분류체계 그대로(input-test.tsx의 DEFAULT_MBTI_OPTIONS와 동일 출처)
const SCROLLABLE_MBTI_OPTIONS: SelectOption[] = [
  ...MBTI_OPTIONS,
  { value: "infp", label: "INFP" },
  { value: "intp", label: "INTP" },
  { value: "estp", label: "ESTP" },
  { value: "esfp", label: "ESFP" },
  { value: "enfp", label: "ENFP" },
  { value: "entp", label: "ENTP" },
  { value: "estj", label: "ESTJ" },
  { value: "esfj", label: "ESFJ" },
  { value: "enfj", label: "ENFJ" },
  { value: "entj", label: "ENTJ" },
];

const SCROLLABLE_SELF_OPTIONS: SelectOption[] = [
  ...SELF_OPTIONS,
  { value: "weekend-photographer", label: "Weekend Photographer" },
  { value: "night-owl-coder", label: "Night Owl Coder" },
  { value: "plant-parent", label: "Plant Parent" },
  { value: "coffee-snob", label: "Coffee Snob" },
];

const SCROLLABLE_OPTIONS_BY_TYPE: Record<SelectType, SelectOption[]> = {
  "country-number": SCROLLABLE_COUNTRY_NUMBER_OPTIONS,
  "social-media": SCROLLABLE_SOCIAL_MEDIA_OPTIONS,
  mbti: SCROLLABLE_MBTI_OPTIONS,
  self: SCROLLABLE_SELF_OPTIONS,
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
  optionsByType: Record<SelectType, SelectOption[]>;
}

// 실제 사용 화면과 동일하게 "옵션 클릭 → 리스트 닫힘 + 트리거 라벨 갱신"이 되도록 값을 들고 있고,
// Controls 패널에서 "type"을 바꾸면 그 타입에 맞는 실제 옵션 목록으로 전환되도록 재계산함
function ControlledSelect({
  type,
  value: initialValue,
  onValueChange,
  optionsByType,
  ...rest
}: ControlledSelectProps) {
  const options = optionsByType[type];
  const [value, setValue] = React.useState(initialValue ?? options[0]?.value);
  const prevType = React.useRef(type);

  React.useEffect(() => {
    if (prevType.current !== type) {
      setValue(optionsByType[type][0]?.value);
      prevType.current = type;
    }
  }, [type, optionsByType]);

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
  args: {
    onValueChange: fn(),
  },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CountryNumber: Story = {
  args: {
    type: "country-number",
    options: COUNTRY_NUMBER_OPTIONS,
    value: "kr",
    placeholder: "Select code...",
  },
  render: (args) => (
    <ControlledSelect {...args} optionsByType={OPTIONS_BY_TYPE} />
  ),
};

export const SocialMedia: Story = {
  args: {
    type: "social-media",
    style: "primary",
    options: SOCIAL_MEDIA_OPTIONS,
    placeholder: "Select social media...",
  },
  render: (args) => (
    <ControlledSelect {...args} optionsByType={OPTIONS_BY_TYPE} />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    const option = await within(document.body).findByText("LinkedIn");
    await userEvent.click(option);

    await expect(args.onValueChange).toHaveBeenCalledWith("linkedin");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveTextContent("LinkedIn");
  },
};

export const SocialMediaIcon: Story = {
  name: "Social Media (icon)",
  args: {
    type: "social-media",
    style: "icon",
    options: SOCIAL_MEDIA_OPTIONS,
  },
  render: (args) => (
    <ControlledSelect {...args} optionsByType={OPTIONS_BY_TYPE} />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    // "+" 아이콘 전용 트리거는 값 텍스트를 표시하지 않음
    await expect(trigger).not.toHaveTextContent("Instagram");

    await userEvent.click(trigger);
    const option = await within(document.body).findByText("Threads");
    await userEvent.click(option);

    await expect(args.onValueChange).toHaveBeenCalledWith("threads");
  },
};

export const Mbti: Story = {
  args: {
    type: "mbti",
    options: MBTI_OPTIONS,
    placeholder: "Select MBTI...",
  },
  render: (args) => (
    <ControlledSelect {...args} optionsByType={OPTIONS_BY_TYPE} />
  ),
};

export const Frequency: Story = {
  args: {
    type: "frequency",
    options: FREQUENCY_OPTIONS,
    value: "days",
  },
  render: (args) => (
    <ControlledSelect {...args} optionsByType={OPTIONS_BY_TYPE} />
  ),
};

export const Scrollable: Story = {
  name: "Scrollable (6개 초과)",
  args: {
    type: "country-number",
    options: SCROLLABLE_COUNTRY_NUMBER_OPTIONS,
    value: "kr",
    placeholder: "Select code...",
  },
  render: (args) => (
    <ControlledSelect {...args} optionsByType={SCROLLABLE_OPTIONS_BY_TYPE} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    await userEvent.click(trigger);
    const listbox = await within(document.body).findByRole("listbox");

    const scrollNextButton = await within(document.body).findByRole("button", {
      name: "Show more options",
    });

    const scrollTopBefore = listbox.scrollTop;
    await userEvent.click(scrollNextButton);
    // scrollBy(behavior: "smooth")는 비동기 애니메이션이라 즉시 값이 반영되지 않으므로 폴링
    await waitFor(() =>
      expect(listbox.scrollTop).toBeGreaterThan(scrollTopBefore),
    );
  },
};

export const SelfPrimary: Story = {
  name: "Self (primary)",
  args: {
    type: "self",
    style: "primary",
    options: SELF_OPTIONS,
    value: "saas-expert",
  },
  render: (args) => (
    <ControlledSelect {...args} optionsByType={OPTIONS_BY_TYPE} />
  ),
};

export const SelfReverse: Story = {
  name: "Self (reverse)",
  args: {
    type: "self",
    style: "reverse",
    options: SELF_OPTIONS,
    value: "saas-expert",
  },
  render: (args) => (
    <ControlledSelect {...args} optionsByType={OPTIONS_BY_TYPE} />
  ),
};

export const SelfMute: Story = {
  name: "Self (mute)",
  args: {
    type: "self",
    style: "mute",
    options: SELF_OPTIONS,
    value: "saas-expert",
  },
  render: (args) => (
    <ControlledSelect {...args} optionsByType={OPTIONS_BY_TYPE} />
  ),
};

export const Disabled: Story = {
  args: {
    type: "social-media",
    options: SOCIAL_MEDIA_OPTIONS,
    placeholder: "Select social media...",
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    await expect(trigger).toBeDisabled();

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const ErrorState: Story = {
  name: "Error",
  args: {
    type: "mbti",
    options: MBTI_OPTIONS,
    placeholder: "Select MBTI...",
    error: true,
  },
  render: (args) => (
    <ControlledSelect {...args} optionsByType={OPTIONS_BY_TYPE} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    await expect(trigger.className).toContain("border-[var(--border-error)]");
  },
};

export const Interactive: Story = {
  args: {
    type: "social-media",
    options: SOCIAL_MEDIA_OPTIONS,
    placeholder: "Select social media...",
  },
  render: (args) => (
    <ControlledSelect {...args} optionsByType={OPTIONS_BY_TYPE} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    await userEvent.click(trigger);
    const option = await within(document.body).findByText("Facebook");
    await userEvent.click(option);

    await expect(trigger).toHaveTextContent("Facebook");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};
