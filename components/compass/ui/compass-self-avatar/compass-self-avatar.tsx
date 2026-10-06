import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Figma "Part/persona" (❄️ GB_Compass, C34HOpbSASmThFA1iYFm8D) node-id 8003:10251.
 *
 * 컴퍼스 다이얼에 배치될 "셀프 1명"을 표현하는 원자 컴포넌트. 원형 배치(각도/반지름
 * 계산)는 상위 조립 컴포넌트의 몫이며, 이 파일은 정사각 프레임 안에 셀프 콘텐츠
 * (이미지 / 미배정 슬롯 / 가이드 링) 하나만 그린다.
 *
 * Figma variant → props 매핑:
 * - `Style=impact` → `variant="guide"`, `Style=empty` → `variant="empty"`,
 *   나머지(페르소나 예시들) → `variant="self"`(고정 enum 대신 임의 유저 이미지를
 *   받는 범용 구조 — 실제 다이얼의 셀프는 유저가 만든 사람이라 enum이 안 맞음).
 * - `Size`는 `guide`에서만 의미 있다(100~300px, 리터럴 고정).
 * - `Status=default/active`는 `self`/`empty`에서만 유효.
 * - `Error=true`는 `self` && `status="default"`에서만 유효(Figma 조합 규칙).
 *
 * `status="active"`와 별개로 마우스 hover 시에도 동일한 active 모습이 나타난다
 * (`isActive = status==="active" || hover`). border/overlay/blur 전환 모두에
 * `duration-150`을 명시해 속도를 동기화했다 — `transition-[filter]`처럼
 * arbitrary-property 트랜지션은 Tailwind 프리셋과 달리 duration이 자동으로
 * 붙지 않는다.
 */

export type CompassSelfAvatarVariant = "self" | "empty" | "guide";
export type CompassSelfAvatarStatus = "default" | "active";
export type CompassSelfAvatarGuideSize = 100 | 150 | 200 | 250 | 300;

export interface CompassSelfAvatarProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** 셀프 콘텐츠 종류 */
  variant?: CompassSelfAvatarVariant;
  /** variant="guide" 전용 사이즈(px). 그 외 variant는 항상 100px 고정(Figma 스펙) */
  guideSize?: CompassSelfAvatarGuideSize;
  /** variant="self"|"empty" 전용 상태 */
  status?: CompassSelfAvatarStatus;
  /** variant="self" && status="default"에서만 유효(Figma 조합 규칙) */
  error?: boolean;
  /** variant="self"일 때 표시할 유저 이미지 URL */
  image?: string;
  /** 이미지 대체 텍스트(유저 이름 등) */
  imageAlt?: string;
  /** status="active" 오버레이 텍스트. 미지정 시 variant별 기본값 사용 */
  label?: string;
  /** error 상태 하단 설명 텍스트. 미지정 시 기본값 사용 */
  description?: string;
}

/** Figma `Size` 축(px), 전부 리터럴 유지 */
const GUIDE_SIZE_PX: Record<CompassSelfAvatarGuideSize, number> = {
  100: 100,
  150: 150,
  200: 200,
  250: 250,
  300: 300,
};

const DEFAULT_ACTIVE_LABEL: Record<"self" | "empty", string> = {
  self: "Go to\nContent Studio",
  empty: "Go to\nAssets",
};

const DEFAULT_EMPTY_LABEL = "No\nSelf Yet";

const DEFAULT_ERROR_DESCRIPTION = "(No experience data)";

function MultilineText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={className}>
      {text.split("\n").map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </span>
  );
}

export function CompassSelfAvatar({
  variant = "self",
  guideSize = 100,
  status = "default",
  error = false,
  image,
  imageAlt = "",
  label,
  description,
  className,
  onMouseEnter,
  onMouseLeave,
  ...props
}: CompassSelfAvatarProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  if (variant === "guide") {
    const size = GUIDE_SIZE_PX[guideSize];
    return (
      <div
        className={cn(
          "shrink-0 rounded-[var(--radius-scale-full)] border-[length:var(--border-1)] border-dashed border-[var(--border-muted)]",
          className,
        )}
        style={{ width: size, height: size }}
        {...props}
      />
    );
  }

  const isActive = status === "active" || isHovered;
  const showError = variant === "self" && !isActive && error;
  const hoverHandlers = {
    onMouseEnter: (event: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(true);
      onMouseEnter?.(event);
    },
    onMouseLeave: (event: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(false);
      onMouseLeave?.(event);
    },
  };

  if (variant === "empty") {
    return (
      <div
        className={cn(
          "relative flex size-[100px] shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-scale-full)] text-center transition-colors duration-150",
          isActive
            ? "border-[length:var(--border-2)] border-[var(--border-static-white)] bg-[var(--background-sheer)]"
            : "border-[length:var(--border-1)] border-dashed border-[var(--border-muted)]",
          className,
        )}
        {...props}
        {...hoverHandlers}
      >
        <MultilineText
          text={
            label ??
            (isActive ? DEFAULT_ACTIVE_LABEL.empty : DEFAULT_EMPTY_LABEL)
          }
          className={cn(
            "transition-colors duration-150",
            isActive
              ? "text-xs-semi-bold text-[var(--text-default)]"
              : "text-xs-regular text-[var(--text-subtle)]",
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative size-[100px] shrink-0 cursor-pointer overflow-hidden rounded-[var(--radius-scale-full)] transition-colors duration-150",
        isActive &&
          "border-[length:var(--border-2)] border-[var(--border-static-white)]",
        className,
      )}
      {...props}
      {...hoverHandlers}
    >
      {image && (
        <img
          src={image}
          alt={imageAlt}
          className={cn(
            "size-full object-cover transition-[filter] duration-150 ease-out",
            (isActive || showError) && "blur-[4px]",
          )}
        />
      )}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center p-[var(--spacing-2)] transition-opacity duration-150",
          isActive || showError
            ? "opacity-100"
            : "pointer-events-none opacity-0",
        )}
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--color-black) 50%, transparent)",
        }}
      >
        {isActive && (
          <MultilineText
            text={label ?? DEFAULT_ACTIVE_LABEL.self}
            className="text-xs-semi-bold text-center text-[var(--text-default)]"
          />
        )}
        {showError && (
          <span className="text-center text-[var(--text-default)]">
            <span className="text-xs-semi-bold">Estimate</span>
            <br />
            <span className="text-xs-regular">
              {description ?? DEFAULT_ERROR_DESCRIPTION}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
