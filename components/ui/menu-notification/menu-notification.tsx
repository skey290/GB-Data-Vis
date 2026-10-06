"use client";

import * as React from "react";
import { Bell } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Figma "MenuNotification" (node-id 3555:8113) — GNB의 알림벨 트리거 원자.
 * `Type` variant(icon/text) → `type` prop, `Status` variant(default/active/
 * diabled) → `status` prop(오타는 disabled로 정규화).
 *
 * default/active 상태에는 우측 상단에 4px 빨간 dot(`--background-warning-default`)이
 * 표시되고, disabled에는 표시되지 않습니다(`showDot`으로도 개별 제어 가능).
 *
 * GNB Expand 토글 시 라벨이 트랜지션 없이 팝인/팝아웃하던 문제(2026-09-29)를
 * MenuButton과 동일한 grid-template-columns 트릭으로 해결 — 상세 사유는
 * `menu-button.tsx` 주석 참고.
 */
export interface MenuNotificationProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "disabled"
> {
  /** Figma `Type` variant */
  type?: "icon" | "text";
  /** Figma `Status` variant. disabled 상태는 여기 하나로만 표현 — 네이티브 `disabled` prop은 따로 받지 않음. */
  status?: "default" | "active" | "disabled";
  /** `type="text"`에서 렌더링할 라벨 */
  label?: string;
  /** 읽지 않은 알림 dot 표시 여부 (기본값: status가 disabled가 아니면 true) */
  showDot?: boolean;
}

export const MenuNotification = React.forwardRef<
  HTMLButtonElement,
  MenuNotificationProps
>(function MenuNotification(
  {
    type = "icon",
    status = "default",
    label = "Notification",
    showDot = true,
    className,
    "aria-label": ariaLabel,
    ...props
  },
  ref,
) {
  const isActive = status === "active";
  const isDisabled = status === "disabled";
  const displayDot = showDot && !isDisabled;

  return (
    <button
      ref={ref}
      type="button"
      disabled={isDisabled}
      aria-current={isActive ? "true" : undefined}
      // type="icon"에는 시각적 라벨이 없으므로 접근성 이름을 보장하기 위해
      // label을 기본 aria-label로 사용 (호출부에서 명시적으로 덮어쓸 수 있음)
      aria-label={ariaLabel ?? (type === "icon" ? label : undefined)}
      className={cn(
        "inline-flex items-center outline-none transition-colors",
        "focus-visible:shadow-[var(--gb-shadow-focus-ring)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed",
        type === "text" && "gap-[var(--gb-spacing-3)]",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center",
          "size-[var(--gb-spacing-8)] rounded-[var(--gb-radius-scale-md)]",
          isActive && "bg-[var(--gb-background-static-gray)]",
        )}
      >
        <Bell
          aria-hidden="true"
          className={cn(
            "size-[var(--gb-spacing-4)]",
            isDisabled
              ? "text-[var(--gb-icon-static-gray)]"
              : isActive
                ? "text-[var(--gb-icon-static-white)]"
                : "text-[var(--gb-icon-subtle)]",
          )}
        />
        {displayDot ? (
          <span
            aria-hidden="true"
            data-testid="menu-notification-dot"
            className={cn(
              "absolute top-[var(--gb-spacing-2-5)] right-[var(--gb-spacing-2-5)]",
              "size-[var(--gb-spacing-1)] rounded-[var(--gb-radius-scale-full)]",
              "bg-[var(--gb-background-warning-default)]",
            )}
          />
        ) : null}
      </span>
      {/* GNB Expand 토글 시 type이 icon ↔ text로 바뀌는데, 라벨을 조건부 렌더하면
          트랜지션이 불가능해 항상 마운트해두고 grid-template-columns(0fr↔1fr)로
          폭+opacity를 함께 접고 펼칩니다 (MenuButton과 동일 패턴). */}
      {label ? (
        <span
          aria-hidden={type === "text" ? undefined : "true"}
          className="grid transition-[grid-template-columns] duration-200 ease-linear"
          style={{ gridTemplateColumns: type === "text" ? "1fr" : "0fr" }}
        >
          <span className="min-w-0 overflow-hidden">
            <span
              className={cn(
                "block truncate whitespace-nowrap transition-opacity duration-200 ease-linear",
                type === "text" ? "opacity-100" : "opacity-0",
                isDisabled
                  ? "text-base-medium text-[var(--gb-text-static-gray)]"
                  : isActive
                    ? "text-base-semi-bold text-[var(--gb-text-bold)]"
                    : "text-base-medium text-[var(--gb-text-subtle)]",
              )}
            >
              {label}
            </span>
          </span>
        </span>
      ) : null}
    </button>
  );
});
