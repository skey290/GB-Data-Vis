"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const avatarVariants = cva(
  cn(
    "relative inline-flex shrink-0 items-center justify-center overflow-hidden",
    "size-[var(--spacing-8)]",
    "rounded-[var(--radius-scale-full)]",
    "bg-background",
  ),
  {
    variants: {
      variant: {
        // Figma `Type=Image`: 배경/보더 없이 이미지가 원형을 꽉 채움
        image: "",
        // Figma `Type=Initial`, `Type=Icon`: 배경 + 1px 보더(muted)의 플레이스홀더 원
        initial: "border-[length:var(--border-1)] border-muted",
        icon: "border-[length:var(--border-1)] border-muted",
      },
    },
    defaultVariants: {
      variant: "icon",
    },
  },
);

export interface AvatarProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof avatarVariants> {
  /** variant="image"일 때 표시할 이미지 URL */
  src?: string;
  /** 이미지의 대체 텍스트이자, 폴백(초성/아이콘) 상태의 접근성 라벨로도 사용됩니다 */
  alt?: string;
  /** variant="initial"일 때 표시할 이니셜 텍스트 (Figma 예시: "S") */
  initials?: string;
}

/**
 * 사용자를 나타내는 원형 아바타.
 *
 * Figma `Type` variant(Image/Initial/Icon)를 `variant` prop으로 매핑했습니다.
 * `variant="image"`인데 `src`가 없거나 이미지 로드에 실패하면 `initials`로,
 * `initials`도 없으면 기본 아이콘(Figma `Type=Icon`)으로 자동 폴백합니다
 * (Figma에는 명시되지 않은, 실제 서비스에서 흔한 이미지 로드 실패 대응을 위한
 * 확장 — 새 variant를 추가하지 않고 기존 3개 상태로만 귀결됩니다).
 */
export function Avatar({
  variant = "icon",
  src,
  alt = "",
  initials,
  className,
  ...props
}: AvatarProps) {
  const [imageFailed, setImageFailed] = React.useState(false);

  let resolvedVariant: NonNullable<AvatarProps["variant"]> = variant ?? "icon";
  if (resolvedVariant === "image" && (!src || imageFailed)) {
    resolvedVariant = initials ? "initial" : "icon";
  }
  if (resolvedVariant === "initial" && !initials) {
    resolvedVariant = "icon";
  }

  const isImage = resolvedVariant === "image";

  return (
    <div
      className={cn(avatarVariants({ variant: resolvedVariant }), className)}
      role={isImage ? undefined : "img"}
      aria-label={isImage ? undefined : alt || initials || "avatar"}
      {...props}
    >
      {isImage && (
        <img
          src={src}
          alt={alt}
          className="size-full object-cover"
          onError={() => setImageFailed(true)}
        />
      )}
      {resolvedVariant === "initial" && (
        <span aria-hidden="true" className="text-sm-semi-bold text-foreground">
          {initials}
        </span>
      )}
      {resolvedVariant === "icon" && (
        <svg
          aria-hidden="true"
          // Figma 스펙(12.8px)보다 크게 조정 — 컨테이너(32px, --spacing-8)의 50%.
          // --spacing-*(간격 전용 토큰)이 아닌 의미상 중립적인 --scale-*(raw
          // 원시값) 토큰을 사용.
          className="size-[calc(var(--scale-16)*1px)] text-muted-foreground"
        >
          <use href="/icons.svg#user-round-icon" />
        </svg>
      )}
    </div>
  );
}
