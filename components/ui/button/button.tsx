import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Figma "Button General" (node-id 73:3681) — `type` variant → `variant` prop,
 * `state=active` → CSS `:hover`(마우스오버 시 색 변화), `state=disabled` → `disabled` prop.
 *
 * 높이값(36px / link 20px)은 Figma 스펙 확정값입니다. `--spacing-*`는 간격(gap/padding)
 * 전용 토큰이라 컴포넌트 자체 치수에는 맞지 않아, 범용 숫자 풀인 `--scale-*`를
 * `calc(var(--scale-N)*1px)` 형태로 참조합니다 (avatar.tsx와 동일 관례).
 *
 * 2026-09-27 새 Figma 파일 기준으로 `type=mute`(신규) 추가 + 전체 active/disabled
 * 색상을 재조사해 갱신. `link` variant의 active 밑줄(underline decoration) 색은
 * 텍스트 색(`--text-subtle`)과 별개로 `--border-mute-subtle`에 바인딩되어 있어
 * (Figma 실측 확인, node 73:3557 텍스트 vs 73:3558 Line 각각 다른 변수) `decoration-*`
 * 유틸로 분리했습니다 — default/disabled 상태는 텍스트/밑줄 값이 항상 같아(각각
 * --text-bold/--icon-bold, --text-static-gray/--border-static-gray 페어) 별도
 * decoration 지정 없이 `underline`의 기본 currentColor 상속을 그대로 씁니다.
 */
const buttonVariants = cva(
  cn(
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap",
    "text-sm-medium",
    "outline-none transition-colors",
    "focus-visible:shadow-[var(--shadow-focus-ring)]",
    "disabled:pointer-events-none disabled:cursor-not-allowed",
  ),
  {
    variants: {
      variant: {
        primary: cn(
          "h-[calc(var(--scale-36)*1px)] rounded-[var(--radius-scale-lg)] px-[var(--spacing-4)]",
          "bg-primary text-primary-foreground",
          "hover:bg-[var(--background-static-gray)] hover:text-[var(--text-static-white)] hover:opacity-[var(--opacity-90)]",
          "disabled:border disabled:border-[var(--border-overlay)] disabled:bg-[var(--background-disabled)] disabled:text-[var(--text-static-gray)]",
        ),
        mute: cn(
          "h-[calc(var(--scale-36)*1px)] rounded-[var(--radius-scale-lg)] px-[var(--spacing-4)]",
          "bg-[var(--background-subtler)] text-[var(--text-default)]",
          "hover:bg-[var(--background-static-gray)] hover:text-[var(--text-static-white)] hover:opacity-[var(--opacity-90)]",
          "disabled:border disabled:border-[var(--border-overlay)] disabled:bg-[var(--background-disabled)] disabled:text-[var(--text-static-gray)]",
        ),
        outline: cn(
          "h-[calc(var(--scale-36)*1px)] rounded-[var(--radius-scale-lg)] px-[var(--spacing-4)]",
          "border-[length:var(--border-1)] border-border border-solid",
          "bg-background text-foreground",
          "hover:bg-[var(--background-static-gray)] hover:border-transparent hover:text-[var(--text-static-white)]",
          "disabled:border-[var(--border-overlay)] disabled:bg-[var(--background-disabled)] disabled:text-[var(--text-static-gray)]",
        ),
        link: cn(
          "h-[calc(var(--scale-20)*1px)] bg-transparent underline",
          "text-[var(--text-bold)]",
          "hover:text-[var(--text-subtle)] hover:decoration-[var(--border-mute-subtle)]",
          "disabled:text-[var(--text-static-gray)]",
        ),
        icon: cn(
          "size-[calc(var(--scale-36)*1px)] rounded-[var(--radius-scale-lg)]",
          "border-[length:var(--border-1)] border-border border-solid",
          "bg-background text-foreground",
          "hover:bg-[var(--background-static-gray)] hover:border-transparent hover:text-[var(--icon-static-white)]",
          "disabled:border-[var(--border-overlay)] disabled:bg-[var(--background-disabled)] disabled:text-[var(--icon-subtlest)]",
        ),
        ghost: cn(
          "size-[calc(var(--scale-36)*1px)] rounded-[var(--radius-scale-full)]",
          "bg-transparent text-foreground",
          "hover:rounded-[var(--radius-scale-md)] hover:text-[var(--icon-subtlest)]",
          "disabled:border disabled:border-[var(--border-overlay)] disabled:bg-[var(--background-disabled)] disabled:text-[var(--icon-subtlest)]",
        ),
        "icon-rounded": cn(
          "size-[calc(var(--scale-36)*1px)] rounded-[var(--radius-scale-full)]",
          "border-[length:var(--border-1)] border-border border-solid",
          "bg-background text-foreground",
          "hover:bg-[var(--background-static-gray)] hover:border-transparent hover:text-[var(--icon-static-white)]",
          "disabled:border-[var(--border-overlay)] disabled:bg-[var(--background-disabled)] disabled:text-[var(--icon-default)]",
        ),
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

/** icon/icon-rounded/ghost variant는 텍스트 대신 /icons.svg 스프라이트 아이콘을 렌더링합니다. */
const ICON_ONLY_VARIANTS = ["icon", "ghost", "icon-rounded"] as const;

export interface ButtonProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    VariantProps<typeof buttonVariants> {
  /** 버튼 라벨 텍스트 (primary/outline/link variant에서 사용) */
  children?: React.ReactNode;
  /**
   * `/icons.svg` 스프라이트의 아이콘 id (icon/icon-rounded/ghost variant에서 사용).
   * Figma 기본 placeholder 아이콘과 동일하게 `circle-dashed-icon`을 기본값으로 사용합니다.
   */
  icon?: string;
}

export function Button({
  className,
  variant,
  children,
  icon = "circle-dashed-icon",
  disabled,
  "aria-label": ariaLabel,
  ...props
}: ButtonProps) {
  const isIconOnly = ICON_ONLY_VARIANTS.includes(
    (variant ?? "primary") as (typeof ICON_ONLY_VARIANTS)[number],
  );

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel ?? (isIconOnly ? icon : undefined)}
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    >
      {isIconOnly ? (
        <svg
          className="h-[var(--spacing-4)] w-[var(--spacing-4)]"
          aria-hidden="true"
        >
          <use href={`/icons.svg#${icon}`} />
        </svg>
      ) : (
        children
      )}
    </button>
  );
}
