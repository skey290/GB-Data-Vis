import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Figma "Badge" (node-id 73:3479) — `type` variant → `variant` prop, `size` variant
// → `size` prop (Figma 프로퍼티 값 "20"/"28" 그대로 사용).
const badgeVariants = cva(
  cn(
    "inline-flex w-fit shrink-0 items-center justify-center gap-[var(--spacing-1)] whitespace-nowrap",
    "rounded-[var(--radius-scale-full)]",
    "py-[var(--spacing-0-5)]",
  ),
  {
    variants: {
      variant: {
        default: "bg-[var(--background-bold)] text-[var(--text-invert)]",
        // 실제 border 대신 inset box-shadow 사용: 레이아웃 공간을 차지하지 않아(Figma
        // inside stroke와 동일 효과) 다른 variant와 높이가 완전히 동일하게 유지됨
        reverse:
          "bg-[var(--background-default)] text-[var(--text-default)] shadow-[inset_0_0_0_var(--border-1)_var(--border-bolder)]",
        outline:
          "bg-transparent text-[var(--text-subtle)] shadow-[inset_0_0_0_var(--border-1)_var(--border-muted)]",
        disabled:
          "bg-[var(--background-disabled)] text-[var(--text-static-gray)] shadow-[inset_0_0_0_var(--border-1)_var(--border-overlay)]",
        alarm:
          "bg-transparent text-[var(--text-warning)] shadow-[inset_0_0_0_var(--border-1)_var(--border-warning)]",
        // Figma "Detail view"(❄️ GB_Compass, node-id 8003:12444)의 "+0.2pp" 증가
        // 델타 뱃지 — alarm(경고 빨강)과 동일한 형태(투명 배경 + inset border)로
        // success 색상(--text-success/--border-success)만 다르게 매핑 (2026-09-28 추가)
        success:
          "bg-transparent text-[var(--text-success)] shadow-[inset_0_0_0_var(--border-1)_var(--border-success)]",
        destructive:
          "bg-[var(--background-error-default)] text-[var(--text-default)]",
      },
      size: {
        // 20px/28px: Figma 스펙 확정값
        "20": "h-[20px] px-[var(--spacing-1-5)] text-xs-medium",
        "28": "h-[28px] px-[var(--spacing-3)] text-sm-medium",
      },
    },
    compoundVariants: [
      // destructive만 semibold, 나머지 5개 variant는 medium (Figma 스펙)
      { variant: "destructive", size: "20", className: "text-xs-semi-bold" },
      { variant: "destructive", size: "28", className: "text-sm-semi-bold" },
    ],
    defaultVariants: {
      variant: "outline",
      size: "20",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  /**
   * 라벨 앞에 렌더링되는 아이콘 슬롯 (Figma의 `leadingIcon`/`leadingIcon1`에 대응).
   * Figma엔 size=20에서만 정의되어 있지만, 두 사이즈 모두에서 허용하도록 일반화함.
   */
  icon?: React.ReactNode;
}

export function Badge({
  className,
  variant,
  size,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {icon && (
        <span className="shrink-0 size-[10px]" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
