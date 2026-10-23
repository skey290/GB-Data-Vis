"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * GNB 내비게이션 항목 하나.
 *
 * 라벨은 `type`과 무관하게 항상 DOM에 마운트해두고 `opacity`만 트랜지션한다 —
 * 폭 변화는 GNB 루트의 `transition-[width]` 하나에 맡기고, 버튼 자체는
 * `overflow-hidden`으로 넘치는 라벨을 자연스럽게 가린다(별도 grid/padding
 * 애니메이션 없음).
 *
 * Figma에 hover 상태가 없어(hover/press/select가 전부 active와 동일) 마우스
 * 오버 시 active와 동일한 스타일을 보여준다(`showActiveStyle`). text-styles.css의
 * 커스텀 텍스트 유틸리티는 Tailwind `hover:` variant를 못 타서 CSS 대신
 * onMouseEnter/onMouseLeave state로 처리한다.
 */
export interface MenuButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "disabled"
> {
  /** Figma `Type` variant */
  type?: "icon" | "icon-with-text" | "text";
  /** Figma `Status` variant (원본의 "diabled" 오타는 disabled로 정규화). disabled 상태는 여기 하나로만 표현 — 네이티브 `disabled` prop은 따로 받지 않음. */
  status?: "default" | "active" | "disabled";
  /** `type="icon" | "icon-with-text"`에서 렌더링할 아이콘 */
  icon?: LucideIcon;
  /** `type="icon-with-text" | "text"`에서 렌더링할 라벨 텍스트 */
  label?: string;
}

export const MenuButton = React.forwardRef<HTMLButtonElement, MenuButtonProps>(
  function MenuButton(
    {
      type = "icon",
      status = "default",
      icon: Icon,
      label,
      className,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref,
  ) {
    const [isHovered, setIsHovered] = React.useState(false);
    const isActive = status === "active";
    const isDisabled = status === "disabled";
    // 시각 전용 플래그 — `aria-current`에는 쓰지 않는다(실제 선택 여부는 `isActive`).
    const showActiveStyle = isActive || isHovered;
    const isTextOnly = type === "text";
    const isExpanded = type === "icon-with-text";
    const showIcon = !isTextOnly && Icon;
    const hasLabel = Boolean(label);

    const labelTextClass = isDisabled
      ? "text-base-medium text-[var(--gb-text-static-gray)]"
      : showActiveStyle
        ? "text-base-semi-bold text-[var(--gb-text-bold)]"
        : "text-base-medium text-[var(--gb-text-subtle)]";

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        aria-current={isActive ? "true" : undefined}
        onMouseEnter={(event) => {
          setIsHovered(true);
          onMouseEnter?.(event);
        }}
        onMouseLeave={(event) => {
          setIsHovered(false);
          onMouseLeave?.(event);
        }}
        className={cn(
          "inline-flex items-center overflow-hidden outline-none transition-colors",
          "focus-visible:shadow-[var(--gb-shadow-focus-ring)]",
          "disabled:pointer-events-none disabled:cursor-not-allowed",
          !isTextOnly && hasLabel && "gap-[var(--gb-spacing-3)]",
          isTextOnly &&
            cn(
              "h-[var(--gb-spacing-8)] gap-[var(--gb-spacing-2)] rounded-[var(--gb-radius-scale-md)] px-[var(--gb-spacing-2)]",
              showActiveStyle && "bg-[var(--gb-background-mute)]",
            ),
          className,
        )}
        {...props}
      >
        {showIcon ? (
          <span
            className={cn(
              "inline-flex shrink-0 items-center justify-center transition-colors",
              "size-[var(--gb-spacing-9)]",
              showActiveStyle
                ? "rounded-[var(--gb-radius-scale-lg)] bg-[var(--gb-background-mute)]"
                : "rounded-[var(--gb-radius-scale-full)]",
            )}
          >
            <Icon
              aria-hidden="true"
              className={cn(
                "size-[var(--gb-spacing-4)]",
                isDisabled
                  ? "text-[var(--gb-icon-static-gray)]"
                  : showActiveStyle
                    ? "text-[var(--gb-icon-static-white)]"
                    : "text-[var(--gb-icon-default)]",
              )}
            />
          </span>
        ) : null}
        {isTextOnly ? (
          hasLabel && (
            <span className={cn("truncate", labelTextClass)}>{label}</span>
          )
        ) : hasLabel ? (
          // 라벨은 항상 마운트해두고 opacity만 트랜지션한다 — 폭은 GNB 루트의
          // width 트랜지션을 따라 버튼 자체가 줄어들면서 overflow-hidden으로
          // 자연스럽게 가린다.
          <span
            aria-hidden={isExpanded ? undefined : "true"}
            className={cn(
              "min-w-0 truncate whitespace-nowrap transition-opacity duration-150 ease-out",
              isExpanded ? "opacity-100" : "opacity-0",
              labelTextClass,
            )}
          >
            {label}
          </span>
        ) : null}
      </button>
    );
  },
);
