import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Figma "Button Group" (node-id 3466:29935) — 컴포넌트셋이 아니라 기존 Button/
 * GoogleButton 인스턴스를 배치한 레이아웃 조합 10종(가로 페어/세로 스택 등)입니다.
 * `orientation`(auto-layout 방향)과 `gap`(관찰된 6/8/10/12px)만 공식 variant로
 * 추출하고, 나머지는 children으로 기존 Button/GoogleButton을 그대로 배치합니다.
 *
 * `disabled` prop(2026-09-27 사용자 확정, Figma에 없는 코드 레벨 편의 기능)은
 * 그룹 내 모든 children(Button/GoogleButton)에 `React.cloneElement`로 `disabled`를
 * 강제 주입합니다 — 그룹을 통째로 비활성화해야 하는 실사용 시나리오(폼 제출 중 등)를
 * 위한 것으로, children 각각에 개별로 disabled를 전달하는 번거로움을 줄입니다.
 */
const buttonGroupVariants = cva("flex", {
  variants: {
    orientation: {
      horizontal: "flex-row items-center",
      vertical: "flex-col items-stretch",
    },
    gap: {
      "1-5": "gap-[var(--spacing-1-5)]",
      "2": "gap-[var(--spacing-2)]",
      "2-5": "gap-[var(--spacing-2-5)]",
      "3": "gap-[var(--spacing-3)]",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    gap: "2",
  },
});

export interface ButtonGroupProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {
  children: React.ReactNode;
  /** 그룹 내 모든 Button/GoogleButton children을 한번에 비활성화합니다. */
  disabled?: boolean;
}

export function ButtonGroup({
  className,
  orientation,
  gap,
  children,
  disabled,
  ...props
}: ButtonGroupProps) {
  return (
    <div
      className={cn(buttonGroupVariants({ orientation, gap }), className)}
      {...props}
    >
      {disabled
        ? React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(
                  child as React.ReactElement<{ disabled?: boolean }>,
                  { disabled: true },
                )
              : child,
          )
        : children}
    </div>
  );
}
