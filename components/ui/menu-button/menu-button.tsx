"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Figma "MenuButton" (node-id 3436:812) — GNB(사이드바) 내비게이션 항목 원자.
 * `Type` variant(icon/icon with text/text) → `type` prop, `Status`
 * variant(default/active/disabled) → `status` prop.
 *
 * - `type="icon"`: 아이콘 칩(32px, `size-8 rounded-md`)만 보임. `active`면 칩
 *   배경이 `--background-static-gray`로 채워짐 (Expand=false 축소 사이드바).
 * - `type="icon-with-text"`: 같은 아이콘 칩 + 라벨. `active`면 칩만 배경으로
 *   채워지고 바깥 행 전체는 배경 없음 (Expand=true 확장 사이드바).
 * - `type="text"`: 아이콘 없이 라벨만, `active`일 때 버튼 전체(=칩)가
 *   배경으로 채워짐.
 *
 * GNB가 Expand 토글 시 같은 버튼 인스턴스의 `type`을 `icon` ↔ `icon-with-text`로
 * 바꾸는데, 예전엔 라벨을 조건부 렌더링해서(`type !== "icon" && label`) 트랜지션
 * 없이 라벨이 즉시 나타났다 사라졌습니다(2026-09-29 사용자 리포트: "GNB 열고 닫을
 * 때 딱딱 끊겨보임"). 아이콘 칩이 `icon`/`icon-with-text` 두 타입에서 항상 동일한
 * 32px 크기라는 점을 이용해 칩 마크업을 하나로 통일하고, 라벨은 항상 DOM에 두되
 * `grid-template-columns: 0fr ↔ 1fr`(폭을 `auto`로 트랜지션할 수 없어 쓰는 표준 CSS
 * 트릭, Shadcn Sidebar 컨벤션과 동일)로 폭+opacity를 함께 접고 펼칩니다. `type="text"`
 * 는 GNB Expand 토글 대상이 아니라(항상 라벨만 보임) 기존 방식 그대로 둡니다.
 *
 * 아이콘-라벨 간격은 버튼의 flex `gap`이 아니라 라벨 래퍼 자신의 `padding-left`로
 * 줍니다 — flex gap으로 뒀더니 라벨이 0폭으로 접혀도 형제 요소 사이의 gap 자체는
 * 그대로 남아 collapsed(`type="icon"`) 상태의 버튼 폭이 아이콘 칩(32px)보다 커져서,
 * GNB 축소 시 Settings 아이콘이 살짝 왼쪽으로 밀려 보이는 정렬 버그가 있었습니다
 * (2026-09-29). padding-left를 `grid-template-columns`와 같은 트랜지션에 묶어 폭
 * 축소와 함께 0으로 수렴시켜, collapsed일 때 라벨 래퍼가 정확히 0px를 차지하게
 * 고쳤습니다.
 *
 * Figma에는 별도의 hover 상태가 없습니다 — Figma상 hover/press/select가 전부
 * active와 시각적으로 동일해서 active 하나만 정의된 것입니다. 따라서 이 컴포넌트는
 * "Figma에 hover가 없으면 hover는 반드시 active를 따른다" 원칙에 따라, 마우스를
 * 올렸을 때(비활성 상태 제외) active와 완전히 동일한 배경/아이콘색/텍스트 스타일을
 * 보여줍니다(`showActiveStyle = isActive || isHovered`). 커스텀 텍스트 유틸리티
 * (text-base-semi-bold 등)는 Tailwind가 인식하는 유틸리티가 아니라(text-styles.css의
 * 순수 CSS 클래스) `hover:` variant를 붙여도 동작하지 않아, CSS 대신 실제
 * onMouseEnter/onMouseLeave 상태로 처리합니다.
 */
export interface MenuButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> {
  /** Figma `Type` variant */
  type?: "icon" | "icon-with-text" | "text";
  /** Figma `Status` variant (원본의 "diabled" 오타는 disabled로 정규화) */
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
      disabled,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref,
  ) {
    const [isHovered, setIsHovered] = React.useState(false);
    const isActive = status === "active";
    const isDisabled = status === "disabled" || disabled;
    // Figma에 hover가 없어 active를 그대로 따름 — 시각 전용 플래그(aria-current는
    // 실제 선택 여부인 isActive를 그대로 써야 하므로 별도 유지)
    const showActiveStyle = isActive || isHovered;
    const isTextOnly = type === "text";
    const isExpanded = type === "icon-with-text";
    const showIcon = !isTextOnly && Icon;
    const hasLabel = Boolean(label);

    const labelTextClass = isDisabled
      ? "text-base-medium text-[var(--text-static-gray)]"
      : showActiveStyle
        ? "text-base-semi-bold text-[var(--text-bold)]"
        : "text-base-medium text-[var(--text-subtle)]";

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
          "focus-visible:shadow-[var(--shadow-focus-ring)]",
          "disabled:pointer-events-none disabled:cursor-not-allowed",
          isTextOnly &&
            cn(
              "h-[var(--spacing-8)] gap-[var(--spacing-2)] rounded-[var(--radius-scale-md)] px-[var(--spacing-2)]",
              showActiveStyle && "bg-[var(--background-static-gray)]",
            ),
          className,
        )}
        {...props}
      >
        {showIcon ? (
          <span
            className={cn(
              "inline-flex shrink-0 items-center justify-center transition-colors",
              "size-[var(--spacing-8)] rounded-[var(--radius-scale-md)]",
              showActiveStyle && "bg-[var(--background-static-gray)]",
            )}
          >
            <Icon
              aria-hidden="true"
              className={cn(
                "size-[var(--spacing-4)]",
                isDisabled
                  ? "text-[var(--icon-static-gray)]"
                  : showActiveStyle
                    ? "text-[var(--icon-static-white)]"
                    : "text-[var(--icon-subtle)]",
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
              paddingLeft: isExpanded ? "var(--spacing-3)" : "0px",
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
