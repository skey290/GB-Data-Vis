import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface TabItem {
  /** 탭에 표시할 라벨 텍스트 */
  label: string;
  /** 라벨 옆에 표시할 카운트. 없으면 배지를 렌더링하지 않습니다 */
  count?: number;
  /** 비활성화 여부. true면 클릭 불가하며 카운트가 있어도 배지를 렌더링하지 않습니다 (Figma "disabled" state) */
  disabled?: boolean;
}

export interface TabsProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  /** 탭 목록 */
  items: TabItem[];
  /** 현재 선택된 탭의 인덱스 */
  selectedIndex: number;
  /** 탭 선택이 변경될 때 호출됩니다 */
  onSelectedIndexChange?: (index: number) => void;
}

export function Tabs({
  items,
  selectedIndex,
  onSelectedIndexChange,
  className,
  ...props
}: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex flex-row",
        "border-b-[length:var(--border-1)] border-b-[color:var(--border-static-gray)]",
        className,
      )}
      {...props}
    >
      {items.map((item, index) => {
        const selected = index === selectedIndex;

        return (
          <button
            key={`${item.label}-${index}`}
            type="button"
            role="tab"
            aria-selected={selected}
            disabled={item.disabled}
            onClick={() => onSelectedIndexChange?.(index)}
            className={cn(
              "inline-flex shrink-0 items-center justify-center whitespace-nowrap",
              "gap-[var(--spacing-2)] px-[var(--spacing-3)]",
              // 48px: 컴포넌트 자체 높이라 Figma 스펙 확정값
              "h-[48px]",
              "border-b-[length:var(--border-1)] border-b-transparent",
              "outline-none transition-colors",
              // focus-visible ring: outline-offset -3px는 토큰 스케일에 일치값이 없어 예외적으로 하드코딩 (Figma 스펙 확정값)
              "focus-visible:[outline:var(--border-2)_solid_var(--ring)] focus-visible:[outline-offset:-3px] focus-visible:rounded-[var(--radius-scale-lg)]",
              selected
                ? "border-b-[color:var(--border-bolder)] text-sm-semi-bold text-[var(--text-default)]"
                : "text-sm-medium text-[var(--text-subtle)] hover:text-[var(--text-emphasis)]",
              "disabled:pointer-events-none disabled:cursor-not-allowed disabled:text-[var(--text-static-gray)]",
            )}
          >
            <span>{item.label}</span>
            {typeof item.count === "number" && !item.disabled ? (
              <Badge variant={selected ? "default" : "outline"}>
                {item.count}
              </Badge>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
