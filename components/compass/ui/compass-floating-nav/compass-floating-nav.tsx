"use client";

import * as React from "react";
import { Home } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Figma Design System "Atom" 파일의 `Floating pill`(node-id 601:467) —
 * Compass 캔버스 상단에 모든 시나리오 공통으로 떠 있는 4버튼 nav입니다
 * (2026-09-29 사용자 확인: "플로팅필은 모든 화면에 존재하는거야").
 *
 * Figma 원본은 가변 아이템 배열이 아니라 "Home(아이콘 전용 원형 버튼) +
 * Assets/Compass/Content Studio(텍스트 버튼) 3개"로 고정된 비대칭 구조라
 * (2026-09-29 서브에이전트 조사, 레이어/코드/스크린샷 3중 확인) props도 이
 * 4개 슬롯 고정 형태로 둡니다. Home 아이콘은 GNB의 "Dashboard" 항목과 동일한
 * lucide `Home`을 재사용합니다(Figma 레이어명 `lucide/home`, 사용자 확인).
 *
 * `Status` variant(default/dashboard/assets/compass/contents studio/disabled) →
 * `activeId`(선택된 하나) + `disabled`(전체 비활성, Figma엔 개별 아이템별
 * disabled가 없어 컴포넌트 전체 단위로만 존재).
 */
export type CompassFloatingNavItemId =
  "home" | "assets" | "compass" | "content-studio";

export interface CompassFloatingNavProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  activeId: CompassFloatingNavItemId;
  onItemSelect?: (id: CompassFloatingNavItemId) => void;
  /** Figma `Status=disabled` — 전체 비활성, 선택 하이라이트 없이 회색조 고정 */
  disabled?: boolean;
}

const TEXT_ITEMS: { id: CompassFloatingNavItemId; label: string }[] = [
  { id: "assets", label: "Assets" },
  { id: "compass", label: "Compass" },
  { id: "content-studio", label: "Content Studio" },
];

export function CompassFloatingNav({
  activeId,
  onItemSelect,
  disabled = false,
  className,
  ...props
}: CompassFloatingNavProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "dark inline-flex items-center gap-[var(--spacing-3)]",
        // 53px: Figma "Floating pill" 프레임 자체의 확정 높이(--scale-*와 매칭되지 않는 기하 상수)
        "h-[53px] w-fit",
        "rounded-[var(--radius-scale-full)] border-[length:var(--border-1)] border-[var(--border-default)] border-solid",
        "bg-[var(--background-sheer)] px-[var(--spacing-2-5)] py-[var(--spacing-2)]",
        "backdrop-blur-[var(--backdrop-blur-8)]",
        className,
      )}
      {...props}
    >
      {(() => {
        const isActive = !disabled && activeId === "home";

        return (
          <button
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label="Home"
            disabled={disabled}
            onClick={() => onItemSelect?.("home")}
            className={cn(
              "inline-flex size-[calc(var(--scale-36)*1px)] shrink-0 items-center justify-center",
              "rounded-[var(--radius-scale-full)] outline-none transition-colors",
              "focus-visible:shadow-[var(--shadow-focus-ring)]",
              "disabled:pointer-events-none disabled:cursor-not-allowed",
              isActive && "bg-[var(--background-static-gray)]",
            )}
          >
            <Home
              aria-hidden="true"
              className={cn(
                "size-[var(--spacing-4)]",
                disabled
                  ? "text-[var(--icon-static-gray)]"
                  : isActive
                    ? "text-[var(--icon-static-white)]"
                    : "text-[var(--icon-subtle)]",
              )}
            />
          </button>
        );
      })()}

      {TEXT_ITEMS.map((item) => {
        const isActive = !disabled && item.id === activeId;

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onItemSelect?.(item.id)}
            className={cn(
              "inline-flex h-full shrink-0 items-center justify-center whitespace-nowrap",
              "rounded-[var(--radius-scale-full)] px-[var(--spacing-4)] py-[var(--spacing-2)]",
              "outline-none transition-colors",
              "focus-visible:shadow-[var(--shadow-focus-ring)]",
              "disabled:pointer-events-none disabled:cursor-not-allowed",
              disabled
                ? "text-sm-medium text-[var(--text-static-gray)]"
                : isActive
                  ? "bg-[var(--background-static-gray)] text-sm-semi-bold text-[var(--text-static-white)]"
                  : "text-sm-medium text-[var(--text-default)]",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
