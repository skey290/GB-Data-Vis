"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Select, type SelectOption } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";

/**
 * Figma "Compass"/"Contents Studio" 사이드바 예시(GNB `Style=compass-home`,
 * node-id 5266:11096)에 등장하는, 사이드바 옆에 뜨는 툴바 조합 —
 * "toggle select"(node 5274:11821, `Home`/`Analysis` 또는 `Analysis`/`Content`)
 * + "select"(node 5274:12001, `variant="mute"`) 두 인스턴스로 구성됩니다.
 *
 * 위쪽 세그먼트 토글은 `Toggle`(`type="text"`), 아래쪽 드롭다운은
 * `Select`(`variant="mute"`)를 그대로 재사용합니다.
 *
 * `selectOptions`(optional로 변경): Analysis 모드 스크린샷 4개
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
   * 아래쪽 `Select`(`variant="mute"`)에 전달할 옵션 목록. 전달하지
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
      <Toggle
        type="text"
        selectionMode="single"
        items={toggleOptions.map((option) => ({
          text: option.label,
          pressed: option.value === toggleValue,
          onPressedChange: () => onToggleValueChange?.(option.value),
        }))}
      />
      {selectOptions && (
        <Select
          variant="mute"
          options={selectOptions}
          value={selectValue}
          onValueChange={onSelectValueChange}
        />
      )}
    </div>
  );
}
