import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  cn(
    "inline-flex w-fit shrink-0 items-center justify-center whitespace-nowrap",
    "text-xs-medium",
    "rounded-[var(--radius-scale-full)]",
    "px-[var(--spacing-padding-1-5)] py-[var(--spacing-padding-0-5)]",
    // 20px: 컴포넌트 자체 높이라 간격 전용인 --spacing-*가 아닌 범용 숫자 풀 --scale-*를 참조 (Figma 스펙 확정값)
    "h-[calc(var(--scale-20)*1px)]",
  ),
  {
    variants: {
      variant: {
        // 실제 border 대신 inset box-shadow 사용: 레이아웃 공간을 차지하지 않아(Figma inside stroke와 동일 효과) 다른 variant와 높이가 완전히 동일하게 유지됨
        outline:
          "bg-transparent text-foreground shadow-[inset_0_0_0_var(--border-width-default)_var(--color-border)]",
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-[color:var(--color-rdx-white-12)]",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}
