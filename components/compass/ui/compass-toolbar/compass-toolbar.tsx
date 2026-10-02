"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Select, type SelectOption } from "@/components/ui/select";

/**
 * Figma "Compass"/"Contents Studio" 사이드바 예시(GNB `Style=compass-home`,
 * node-id 5266:11096)에 등장하는, 사이드바 옆에 뜨는 툴바 조합 —
 * "toggle select"(node 5274:11821, `Home`/`Analysis` 또는 `Analysis`/`Content`)
 * + "select"(node 5274:12001, `type="self" style="mute"`) 두 인스턴스로 구성됩니다.
 *
 * 재사용 조사 결과:
 * - 아래쪽 드롭다운은 기존 `Select`(`type="self" style="mute"`)와 토큰까지
 *   완전히 동일해 그대로 재사용했습니다.
 * - 위쪽 세그먼트 토글은 기존 `components/ui/toggle-select`(AM/PM 전용,
 *   `bg-muted`/`bg-background`/`shadow-sm` 등 다른 토큰 세트로 하드코딩됨)와
 *   라벨·토큰이 모두 달라(`background-selected`/`background-static-gray`/
 *   `drop-shadow` 등) 그대로 재사용할 수 없었습니다. 기존 컴포넌트를 건드리지
 *   않기 위해, 이 파일 내부에 동일한 2-옵션 세그먼트 토글을 최소 구현으로
 *   새로 두었습니다(별도 컴포넌트로 분리하지 않고 이 wrapper에 한정).
 *
 * `selectOptions`(2026-09-29, optional로 변경): Analysis 모드 스크린샷 4개
 * (growth-potential/reach/engagement/ranking, node 8052:33420 등) 전부
 * 아래쪽 "All 'Self'" Select가 없었다 — Home 모드에서만 쓰인다. 안 넘기면
 * Select 자체를 렌더링하지 않도록 optional로 바꿨다(Home 모드 기존 호출부는
 * 그대로 하위호환).
 */
export interface CompassToolbarToggleOption {
  value: string;
  label: string;
}

export interface CompassToolbarProps {
  /** 세그먼트 토글의 두 옵션 (예: Home/Analysis 또는 Analysis/Content) */
  toggleOptions: readonly [
    CompassToolbarToggleOption,
    CompassToolbarToggleOption,
  ];
  toggleValue: string;
  onToggleValueChange?: (value: string) => void;
  /**
   * 아래쪽 `Select`(`type="self" style="mute"`)에 전달할 옵션 목록. 전달하지
   * 않으면 Select 자체를 렌더링하지 않는다(Figma Analysis 모드 실측 결과).
   */
  selectOptions?: SelectOption[];
  selectValue?: string;
  onSelectValueChange?: (value: string) => void;
  className?: string;
}

export function CompassToolbar({
  toggleOptions,
  toggleValue,
  onToggleValueChange,
  selectOptions,
  selectValue,
  onSelectValueChange,
  className,
}: CompassToolbarProps) {
  return (
    <div className={cn("dark flex flex-col gap-[var(--spacing-3)]", className)}>
      <div
        role="radiogroup"
        className={cn(
          "inline-flex h-[calc(var(--scale-36)*1px)] w-fit items-center",
          "rounded-[var(--radius-scale-lg)] border-[length:var(--border-1)] border-[var(--border-default)] border-solid",
          "bg-[var(--background-selected)] p-[var(--spacing-0-5)]",
        )}
      >
        {toggleOptions.map((option) => {
          const isSelected = option.value === toggleValue;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => {
                if (!isSelected) onToggleValueChange?.(option.value);
              }}
              className={cn(
                "inline-flex h-full items-center justify-center whitespace-nowrap",
                "rounded-[var(--radius-scale-md)] px-[var(--spacing-2)] py-[var(--spacing-1)]",
                "text-sm-medium outline-none transition-colors",
                "focus-visible:shadow-[var(--shadow-focus-ring)]",
                isSelected
                  ? "bg-[var(--background-static-gray)] text-[var(--text-static-white)] shadow-[var(--shadow-sm)]"
                  : "text-[var(--text-default)]",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {selectOptions && (
        <Select
          type="self"
          style="mute"
          options={selectOptions}
          value={selectValue}
          onValueChange={onSelectValueChange}
        />
      )}
    </div>
  );
}
