"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const avatarVariants = cva(
  cn(
    "relative inline-flex shrink-0 items-center justify-center overflow-hidden",
    // 32px: 컴포넌트 자체 크기라 --spacing-*가 아닌 --scale-*를 참조 (Figma 스펙 확정값, Style 축과 무관하게 고정)
    "size-[calc(var(--scale-32)*1px)]",
  ),
  {
    variants: {
      // Figma `Type=Image`: 배경/보더 없이 이미지가 컨테이너를 꽉 채움
      // Figma `Type=Initial`, `Type=Icon`: 배경(--background-default) + 1px 보더(--border-subtle)의 플레이스홀더
      variant: {
        image: "",
        initial:
          "border-[length:var(--border-1)] border-[var(--border-subtle)] bg-[var(--background-default)]",
        icon: "border-[length:var(--border-1)] border-[var(--border-subtle)] bg-[var(--background-default)]",
      },
      // Figma `Style=rounded/rectangle/circle`
      shape: {
        rounded: "rounded-[var(--radius-scale-md)]",
        rectangle: "rounded-[var(--radius-scale-none)]",
        circle: "rounded-[var(--radius-scale-full)]",
      },
    },
    defaultVariants: {
      variant: "icon",
      shape: "circle",
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
 * 사용자를 나타내는 아바타.
 *
 * Figma `Type` variant(Image/Initial/Icon)를 `variant` prop으로,
 * `Style` variant(Rounded/Rectangle/Circle)를 `shape` prop으로 매핑했습니다
 * (Figma의 "Style"이라는 이름은 React의 `style`(인라인 스타일) prop과 겹치므로
 * `shape`로 이름을 바꿨습니다). 3×3 = 9개 조합 모두 32px 고정 크기입니다.
 *
 * `variant="image"`인데 `src`가 없거나 이미지 로드에 실패하면 `initials`로,
 * `initials`도 없으면 기본 아이콘(Figma `Type=Icon`)으로 자동 폴백합니다
 * (Figma에는 명시되지 않은, 실제 서비스에서 흔한 이미지 로드 실패 대응을 위한
 * 확장 — 새 variant를 추가하지 않고 기존 3개 Type으로만 귀결됩니다).
 */
export function Avatar({
  variant = "icon",
  shape = "circle",
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
      className={cn(
        avatarVariants({ variant: resolvedVariant, shape }),
        className,
      )}
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
        <span
          aria-hidden="true"
          className="text-sm-semi-bold text-[var(--text-default)]"
        >
          {initials}
        </span>
      )}
      {resolvedVariant === "icon" && (
        <svg
          aria-hidden="true"
          // 18px: Figma의 아이콘 컨테이너 크기(--scale-18) 그대로
          className="size-[calc(var(--scale-18)*1px)] text-[var(--icon-default)]"
        >
          <use href="/icons.svg#user-filled-icon" />
        </svg>
      )}
    </div>
  );
}
