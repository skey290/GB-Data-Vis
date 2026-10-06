import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { LUCIDE_SPRITE_MAP, type IconId } from "@/lib/sprite-icon";

/** Figma "Button General" (node-id 73:3681). */
const buttonVariants = cva(
  cn(
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap",
    "text-sm-medium",
    "outline-none transition-colors",
    "focus-visible:shadow-[var(--gb-shadow-focus-ring)]",
    "disabled:pointer-events-none disabled:cursor-not-allowed",
  ),
  {
    variants: {
      variant: {
        primary: cn(
          "h-[36px] rounded-[var(--gb-radius-scale-lg)] px-[var(--gb-spacing-4)]",
          "bg-primary text-primary-foreground",
          "hover:bg-[var(--gb-background-static-gray)] hover:text-[var(--gb-text-static-white)] hover:opacity-[var(--gb-opacity-90)]",
          "disabled:border disabled:border-[var(--gb-border-overlay)] disabled:bg-[var(--gb-background-disabled)] disabled:text-[var(--gb-text-static-gray)]",
        ),
        mute: cn(
          "h-[36px] rounded-[var(--gb-radius-scale-lg)] px-[var(--gb-spacing-4)]",
          "bg-[var(--gb-background-subtler)] text-[var(--gb-text-default)]",
          "hover:bg-[var(--gb-background-static-gray)] hover:text-[var(--gb-text-static-white)] hover:opacity-[var(--gb-opacity-90)]",
          "disabled:border disabled:border-[var(--gb-border-overlay)] disabled:bg-[var(--gb-background-disabled)] disabled:text-[var(--gb-text-static-gray)]",
        ),
        outline: cn(
          "h-[36px] rounded-[var(--gb-radius-scale-lg)] px-[var(--gb-spacing-4)]",
          "border-[length:var(--gb-border-1)] border-border border-solid",
          "bg-background text-foreground",
          "hover:bg-[var(--gb-background-static-gray)] hover:border-transparent hover:text-[var(--gb-text-static-white)]",
          "disabled:border-[var(--gb-border-overlay)] disabled:bg-[var(--gb-background-disabled)] disabled:text-[var(--gb-text-static-gray)]",
        ),
        link: cn(
          "h-[20px] bg-transparent underline",
          "text-[var(--gb-text-bold)]",
          "hover:text-[var(--gb-text-subtle)] hover:decoration-[var(--gb-border-mute-subtle)]",
          "disabled:text-[var(--gb-text-static-gray)]",
        ),
        icon: cn(
          "size-[36px] rounded-[var(--gb-radius-scale-lg)]",
          "border-[length:var(--gb-border-1)] border-border border-solid",
          "bg-background text-foreground",
          "hover:bg-[var(--gb-background-static-gray)] hover:border-transparent hover:text-[var(--gb-icon-static-white)]",
          "disabled:border-[var(--gb-border-overlay)] disabled:bg-[var(--gb-background-disabled)] disabled:text-[var(--gb-icon-subtlest)]",
        ),
        ghost: cn(
          "size-[36px] rounded-[var(--gb-radius-scale-full)]",
          "bg-transparent text-foreground",
          "hover:rounded-[var(--gb-radius-scale-md)] hover:text-[var(--gb-icon-subtlest)]",
          "disabled:border disabled:border-[var(--gb-border-overlay)] disabled:bg-[var(--gb-background-disabled)] disabled:text-[var(--gb-icon-subtlest)]",
        ),
        "icon-rounded": cn(
          "size-[36px] rounded-[var(--gb-radius-scale-full)]",
          "border-[length:var(--gb-border-1)] border-border border-solid",
          "bg-background text-foreground",
          "hover:bg-[var(--gb-background-static-gray)] hover:border-transparent hover:text-[var(--gb-icon-static-white)]",
          "disabled:border-[var(--gb-border-overlay)] disabled:bg-[var(--gb-background-disabled)] disabled:text-[var(--gb-icon-default)]",
        ),
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

const ICON_ONLY_VARIANTS = ["icon", "ghost", "icon-rounded"] as const;

export interface ButtonProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    VariantProps<typeof buttonVariants> {
  /** 버튼 라벨 텍스트 (primary/mute/outline/link variant에서 사용) */
  children?: React.ReactNode;
  /** icon/icon-rounded/ghost variant에서 렌더링할 아이콘 id */
  icon?: IconId;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant,
      children,
      icon = "circle-dashed-icon",
      disabled,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) {
    const isIconOnly = ICON_ONLY_VARIANTS.includes(
      (variant ?? "primary") as (typeof ICON_ONLY_VARIANTS)[number],
    );
    const LucideIconComponent = (
      LUCIDE_SPRITE_MAP as Record<
        string,
        React.ComponentType<React.SVGProps<SVGSVGElement>> | undefined
      >
    )[icon];

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel ?? (isIconOnly ? icon : undefined)}
        className={cn(buttonVariants({ variant }), className)}
        {...props}
      >
        {isIconOnly ? (
          LucideIconComponent ? (
            <LucideIconComponent
              className="h-[var(--gb-spacing-4)] w-[var(--gb-spacing-4)]"
              aria-hidden="true"
            />
          ) : (
            <svg
              className="h-[var(--gb-spacing-4)] w-[var(--gb-spacing-4)]"
              aria-hidden="true"
            >
              <use href={`/icons.svg#${icon}`} />
            </svg>
          )
        ) : (
          children
        )}
      </button>
    );
  },
);
