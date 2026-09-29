import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Figma "Google CTA" (node-id 3490:8023, `type=Google-login`) — 소셜 로그인 전용 버튼.
 * `state=hover` → CSS `:hover`, `state=Disabled` → `disabled` prop.
 * 2026-09-27 재조사: hover/disabled 색상을 Button과 동일한 static-gray/static-white
 * 패턴으로 갱신(실측 확인).
 *
 * 높이값(36px)은 Figma 스펙 확정값입니다. `--spacing-*`는 간격(gap/padding) 전용
 * 토큰이라 컴포넌트 자체 치수에는 맞지 않아, 범용 숫자 풀인 `--scale-*`를
 * `calc(var(--scale-N)*1px)` 형태로 참조합니다 (avatar.tsx와 동일 관례).
 */
const googleButtonClassName = cn(
  "inline-flex shrink-0 items-center justify-center gap-[var(--spacing-1-5)]",
  "h-[calc(var(--scale-36)*1px)] rounded-[var(--radius-scale-lg)] px-[var(--spacing-4)]",
  "border-[length:var(--border-1)] border-solid",
  "text-sm-medium whitespace-nowrap",
  "outline-none transition-colors",
  "focus-visible:shadow-[var(--shadow-focus-ring)]",
  "disabled:pointer-events-none disabled:cursor-not-allowed",
  "bg-foreground text-primary-foreground border-muted-foreground",
  "hover:bg-[var(--background-static-gray)] hover:text-[var(--text-static-white)] hover:border-transparent",
  "disabled:border-[var(--border-overlay)] disabled:bg-[var(--background-disabled)] disabled:text-[var(--text-static-gray)]",
);

export interface GoogleButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  /** 버튼 라벨 텍스트 (기본값: "Continue with Google") */
  label?: string;
}

export function GoogleButton({
  className,
  label = "Continue with Google",
  disabled,
  ...props
}: GoogleButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(googleButtonClassName, className)}
      {...props}
    >
      <svg
        className="h-[var(--spacing-4)] w-[var(--spacing-4)] shrink-0"
        aria-hidden="true"
      >
        <use href="/icons.svg#google-icon" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
