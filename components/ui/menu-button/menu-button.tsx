"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Figma "MenuButton" (node-id 3436:812) — GNB 내비게이션 항목 원자.
 * `Type` variant → `type` prop, `Status` variant → `status` prop.
 *
 * 라벨은 `type`과 무관하게 항상 DOM에 마운트해두고 `grid-template-columns:
 * 0fr↔1fr` + `padding-left`로 폭/간격/opacity를 함께 트랜지션한다 — 조건부
 * 렌더링은 GNB Expand 토글 시 트랜지션 없이 라벨이 팝인/팝아웃하는 문제가 있었음.
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
    // Figma에 hover가 없어 active를 그대로 따름 — 시각 전용 플래그(aria-current는
    // 실제 선택 여부인 isActive를 그대로 써야 하므로 별도 유지)
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
          "inline-flex items-center outline-none transition-colors",
          "focus-visible:shadow-[var(--gb-shadow-focus-ring)]",
          "disabled:pointer-events-none disabled:cursor-not-allowed",
          isTextOnly &&
            cn(
              "h-[var(--gb-spacing-8)] gap-[var(--gb-spacing-2)] rounded-[var(--gb-radius-scale-md)] px-[var(--gb-spacing-2)]",
              showActiveStyle && "bg-[var(--gb-background-static-gray)]",
            ),
          className,
        )}
        {...props}
      >
        {showIcon ? (
          <span
            className={cn(
              "inline-flex shrink-0 items-center justify-center transition-colors",
              "size-[var(--gb-spacing-8)] rounded-[var(--gb-radius-scale-md)]",
              showActiveStyle && "bg-[var(--gb-background-static-gray)]",
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
                    : "text-[var(--gb-icon-subtle)]",
              )}
            />
          </span>
        ) : null}
        {isTextOnly ? (
          hasLabel && (
            <span className={cn("truncate", labelTextClass)}>{label}</span>
          )
        ) : hasLabel ? (
          // `type`이 icon ↔ icon-with-text로 바뀌어도 라벨은 항상 마운트해두고
          // grid-template-columns(0fr↔1fr)로 폭을, padding-left로 아이콘과의 간격을,
          // opacity로 텍스트를 함께 트랜지션 — 조건부 렌더로는 CSS 트랜지션이
          // 불가능해서 쓰는 트릭. 간격을 padding-left로 주는 이유는 위 주석 참고.
          <span
            aria-hidden={isExpanded ? undefined : "true"}
            className="grid transition-[grid-template-columns,padding-left] duration-200 ease-linear"
            style={{
              gridTemplateColumns: isExpanded ? "1fr" : "0fr",
              paddingLeft: isExpanded ? "var(--gb-spacing-3)" : "0px",
            }}
          >
            <span className="min-w-0 overflow-hidden">
              <span
                className={cn(
                  "block truncate whitespace-nowrap transition-opacity duration-200 ease-linear",
                  isExpanded ? "opacity-100" : "opacity-0",
                  labelTextClass,
                )}
              >
                {label}
              </span>
            </span>
          </span>
        ) : null}
      </button>
    );
  },
);
