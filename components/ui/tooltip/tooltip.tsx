"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const tooltipContentVariants = cva(
  cn(
    "relative z-50 flex w-fit flex-col",
    "gap-[var(--spacing-1)]",
    "rounded-[var(--radius-scale-md)]",
    // Figma 확정값(node 79:11350, Tootip 24-variant 매트릭스 전수 재확인): 좌우 padding이
    // 비대칭(pl-16/pr-32) — 우측은 좌측 padding(16px) + 닫기 아이콘 너비(16px)만큼 항상
    // 여유 공간을 확보해, 아이콘 유무와 무관하게 긴 텍스트가 아이콘 아래로 밀려 들어가지
    // 않도록 함(이전 구현의 "no reserved right-padding" 트레이드오프를 이 값으로 해소).
    "pl-[var(--spacing-4)] pr-[var(--spacing-8)] py-[var(--spacing-3)]",
    "text-left",
    "shadow-[var(--shadow-sm)]",
    "text-sm-regular",
  ),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        inversed:
          "bg-[var(--tooltip-inversed-bg)] text-[var(--tooltip-inversed-fg)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface TooltipProps extends VariantProps<
  typeof tooltipContentVariants
> {
  /** 툴팁을 트리거하는 요소 (hover/focus 대상) */
  children: React.ReactNode;
  /** 툴팁 제목. 전달하지 않으면(=falsy) 렌더링되지 않음 — Figma `title` 불리언 토글에 대응 */
  title?: React.ReactNode;
  /** 툴팁 설명. 전달하지 않으면(=falsy) 렌더링되지 않음 — Figma `description` 불리언 토글에 대응 */
  description?: React.ReactNode;
  /** Figma Direction 변형(Above/Below) */
  side?: "top" | "right" | "bottom" | "left";
  /** Figma Direction 변형(Left/Center/Right, Top/Center/Bottom) */
  align?: "start" | "center" | "end";
  sideOffset?: number;
  alignOffset?: number;
  /**
   * 뷰포트 경계와 이 거리(px) 이내로는 겹치지 않도록 Radix가 자동으로
   * flip/shift한다. Figma는 정적 목업이라 화면 경계 충돌을 표현하지 않으므로
   * 값 자체는 Figma 실측이 아니라 순수 레이아웃 방어용 기본값이다(사용자 확인,
   * 2026-09-29) — `--spacing-3`(12px)에 대응하는 숫자를 기본값으로 둔다.
   */
  collisionPadding?:
    number | Partial<Record<"top" | "right" | "bottom" | "left", number>>;
  onClose?: () => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 트리거에 포인터가 진입한 뒤 툴팁이 열리기까지의 지연 시간(ms) */
  delayDuration?: number;
  className?: string;
}

export function Tooltip({
  children,
  title,
  description,
  variant,
  side = "top",
  align = "center",
  sideOffset,
  alignOffset,
  collisionPadding = 12,
  onClose,
  open,
  defaultOpen,
  onOpenChange,
  delayDuration,
  className,
}: TooltipProps) {
  const hasBody = Boolean(title) || Boolean(description);

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={sideOffset}
            alignOffset={alignOffset}
            collisionPadding={collisionPadding}
            className={cn(tooltipContentVariants({ variant }), className)}
          >
            {hasBody && (
              <div className="flex flex-col gap-[var(--spacing-1)]">
                {title && <p className="text-sm-semi-bold">{title}</p>}
                {description && (
                  <p className="text-sm-regular">{description}</p>
                )}
              </div>
            )}
            {onClose && (
              <button
                type="button"
                aria-label="Close tooltip"
                onClick={onClose}
                className={cn(
                  "absolute outline-none",
                  // Figma 확정값: right는 padding-x(16px)와 동일해 콘텐츠 우측 끝에 맞닿고,
                  // top(14px)은 padding-y(12px) + 타이틀 라인하이트(20px)와 아이콘(16px) 높이 차의 절반(2px)만큼
                  // 내려와 타이틀 텍스트와 수직 중앙 정렬되도록 계산된 값 — 토큰 스케일에 정확히 대응
                  "top-[var(--spacing-3-5)] right-[var(--spacing-4)]",
                )}
              >
                <svg aria-hidden="true" className="size-[var(--spacing-4)]">
                  <use href="/icons.svg#x-icon" />
                </svg>
              </button>
            )}
            <TooltipPrimitive.Arrow asChild width={10} height={10}>
              <div
                className={cn(
                  "size-[var(--spacing-2-5)] rotate-45",
                  "rounded-[var(--radius-scale-xs)]",
                  variant === "inversed"
                    ? "bg-[var(--tooltip-inversed-bg)]"
                    : "bg-primary",
                )}
              />
            </TooltipPrimitive.Arrow>
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
