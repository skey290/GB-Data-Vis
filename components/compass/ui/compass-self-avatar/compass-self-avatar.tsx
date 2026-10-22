import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";

export type CompassSelfAvatarVariant = "self" | "empty" | "potential";
export type CompassSelfAvatarStatus = "default" | "active";
export type CompassSelfAvatarPosition =
  0 | 45 | 90 | 135 | 180 | 225 | 270 | 315;

export interface CompassSelfAvatarCoachmark {
  title: string;
  description?: string;
  onDismiss?: () => void;
}

export interface CompassSelfAvatarProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** 셀프 콘텐츠 종류 */
  variant?: CompassSelfAvatarVariant;
  /** variant="self"|"empty"|"potential" 전용 상태 */
  status?: CompassSelfAvatarStatus;
  /** variant="self" && status="default"에서만 유효 */
  error?: boolean;
  /** variant="self"|"potential"일 때 표시할 유저 이미지 URL */
  image?: string;
  /** 이미지 대체 텍스트(유저 이름 등) */
  imageAlt?: string;
  /** status="active" 오버레이 텍스트. 미지정 시 variant별 기본값 사용 */
  label?: string;
  /** error(또는 potential의 데이터 부족) 상태 하단 설명 텍스트. 미지정 시 기본값 사용 */
  description?: string;
  /** variant="potential"일 때 0~100 성장 값 */
  growth?: number;
  /** variant="potential"일 때 다이얼 중심 기준 배치 각도(0=북쪽, 시계방향) */
  position?: CompassSelfAvatarPosition;
  /** variant="potential"일 때 데이터 수집 여부. false면 배지가 경고색으로 바뀌고 Estimate 안내가 겹친다 */
  isDataCollected?: boolean;
  /** variant="potential"일 때 퍼센트 배지에 붙는 온보딩 코치마크 */
  coachmark?: CompassSelfAvatarCoachmark;
}

const DEFAULT_ACTIVE_LABEL: Record<"self" | "empty", string> = {
  self: "Go to\nContent Studio",
  empty: "Go to\nAssets",
};

const DEFAULT_EMPTY_LABEL = "No\nSelf Yet";

const DEFAULT_ERROR_DESCRIPTION: Record<"self" | "potential", string> = {
  self: "(No experience data)",
  potential: "(Lack of Data)",
};

/** 아바타 반지름(px) */
const AVATAR_RADIUS = 50;
/** 배지 중심 ≈ 링 반지름 + 이 값(px) */
const BADGE_RADIAL_GAP = 31;

function getRingRadius(growth: number): number {
  return AVATAR_RADIUS + growth * 1.25;
}

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
  status = "default",
  error = false,
  image,
  imageAlt = "",
  label,
  description,
  growth = 0,
  position = 0,
  isDataCollected = true,
  coachmark,
  className,
  onMouseEnter,
  onMouseLeave,
  ...props
}: CompassSelfAvatarProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const isPotential = variant === "potential";
  const isActive = status === "active" || isHovered;
  const effectiveError = isPotential ? !isDataCollected : error;
  const showError = variant !== "empty" && !isActive && effectiveError;
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

  const avatar = (
    <div
      className={cn(
        "relative size-[100px] shrink-0 cursor-pointer overflow-hidden rounded-[var(--radius-scale-full)] transition-colors duration-150",
        isActive &&
          "border-[length:var(--border-2)] border-[var(--border-static-white)]",
        !isPotential && className,
      )}
      {...(!isPotential ? props : {})}
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
              {description ??
                DEFAULT_ERROR_DESCRIPTION[isPotential ? "potential" : "self"]}
            </span>
          </span>
        )}
      </div>
    </div>
  );

  if (!isPotential) {
    return avatar;
  }

  const ringRadius = getRingRadius(growth);
  const bearing = position;
  const showEstimateStyling = !isDataCollected;

  return (
    <div className={cn("relative isolate size-[100px]", className)} {...props}>
      {avatar}

      <div
        className="absolute top-1/2 left-1/2 z-[-1] rounded-[var(--radius-scale-full)] border-[length:var(--border-1)] border-dashed border-[var(--border-muted)]"
        style={{
          width: ringRadius * 2,
          height: ringRadius * 2,
          transform: "translate(-50%, -50%)",
        }}
        aria-hidden="true"
      />

      <div
        className="absolute top-1/2 left-1/2 z-[-1] h-0 w-0"
        style={{ transform: `rotate(${bearing}deg)` }}
        aria-hidden="true"
      >
        <div
          className="absolute left-1/2 w-px -translate-x-1/2 bg-[var(--border-muted)]"
          style={{ top: -ringRadius, height: ringRadius - AVATAR_RADIUS }}
        />
      </div>

      {(() => {
        const badge = (
          <div style={{ transform: `rotate(${-bearing}deg)` }}>
            <Badge
              variant={showEstimateStyling ? "alarm" : "reverse"}
              size="20"
            >
              {Math.round(growth)}%
            </Badge>
          </div>
        );

        return (
          <div
            className="absolute top-1/2 left-1/2 h-0 w-0"
            style={{ transform: `rotate(${bearing}deg)` }}
          >
            <div
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ top: -(ringRadius + BADGE_RADIAL_GAP) }}
            >
              {coachmark ? (
                <Tooltip
                  variant="reversed"
                  open
                  side="right"
                  align="start"
                  title={coachmark.title}
                  description={coachmark.description}
                  onClose={coachmark.onDismiss}
                >
                  {badge}
                </Tooltip>
              ) : (
                badge
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
