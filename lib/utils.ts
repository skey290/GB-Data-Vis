import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// src/tokens/text-styles.css의 커스텀 타이포그래피 유틸리티(.text-xs-medium 등) 목록.
// tailwind-merge는 클래스 이름만 보고 충돌 그룹을 추론하는데, 이 클래스들이 "text-"로
// 시작해 Tailwind의 텍스트 색상 유틸리티(text-primary-foreground 등)와 같은 그룹으로
// 오인되어 둘 중 하나가 삭제되는 문제가 있었다. 별도 그룹으로 등록해 이를 방지한다.
const TYPOGRAPHY_SIZES = [
  "xxs",
  "xs",
  "sm",
  "base",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "5xl",
  "6xl",
  "7xl",
  "8xl",
  "9xl",
];
const TYPOGRAPHY_WEIGHTS = [
  "thin",
  "extra-light",
  "light",
  "regular",
  "medium",
  "semi-bold",
  "bold",
  "extra-bold",
  "black",
];
const TYPOGRAPHY_PRESET_CLASSES = [
  ...TYPOGRAPHY_SIZES.flatMap((size) =>
    TYPOGRAPHY_WEIGHTS.map((weight) => `${size}-${weight}`),
  ),
  "time-stamp",
];

const twMerge = extendTailwindMerge<"gb-text-style">({
  extend: {
    classGroups: {
      "gb-text-style": [{ text: TYPOGRAPHY_PRESET_CLASSES }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
