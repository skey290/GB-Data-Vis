"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Icon } from "@/lib/sprite-icon";

import styles from "./profile-print.module.css";

/**
 * 프로필 이미지 출력 카드. `type`은 process/completed/upload 세 종류입니다.
 *
 * - `process`: 정사각 시머 로더(`Skeleton` 재사용) + 중앙 "Processing" 배지(`Spinner
 *   variant="primary"` 재사용 — 배지의 bg/text 색상·치수가 Figma 스펙과 정확히 일치:
 *   `--background-bold`/`--text-invert`는 Shadcn `--primary`/`--primary-foreground`에
 *   alias되어 있음).
 * - `completed`: 정사각 인물 사진(object-cover) + 하단 우측 타임스탬프. 마우스를
 *   올리면(Figma `Status=hover`) 이미지가 흐려지고 "Update this image" 편집 오버레이가
 *   뜹니다 — `:hover`/`:focus-within` CSS로 처리하고(`profile-print.module.css`),
 *   `imageHover` prop은 Storybook/테스트에서 같은 모습을 강제로 미리보기 위한
 *   escape hatch입니다. 오버레이 버튼은 `Button variant="mute"`를 재사용합니다.
 * - `upload`: 빈 상태 CTA 카드. "Open your folder" 버튼은 `Button variant="outline"`을
 *   재사용하고, 숨겨진 `<input type="file">`을 트리거해 `onFileSelect` 콜백으로 선택
 *   결과를 전달합니다(Figma는 정적 디자인이라 실제 파일 선택 동작을 표현할 수 없어
 *   기능적으로 추가 — `input-image.tsx`의 sr-only 파일 인풋 패턴과 동일).
 *
 * 컨테이너 폭 542px(및 upload 상태 높이 642px)은 Figma 원본 px 값을 그대로 씁니다.
 *
 * Figma의 `type=upload` variant에는 컨테이너 전체를 덮는 장식용 SVG(`imgTypeUpload`)가
 * 있었지만, 다운로드해 대조한 결과 다른 두 variant가 `bg-white + padding`으로 만드는
 * 흰 테두리와 치수까지 완전히 동일한 "Subtract" 프레임 도형이라 실제 이미지 애셋이
 * 아니었습니다. 그래서 기본값은 동일한 `bg-white + padding`으로 재현하되, 추후 실제
 * 이미지 애셋(텍스처/워터마크 등)이 필요해지면 바로 끼워넣을 수 있도록
 * `emptyStateBackgroundSrc` prop으로 교체 지점을 열어뒀습니다(미지정 시 아무 것도
 * 렌더링하지 않아 현재 디자인과 동일).
 */
export interface ProfilePrintProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Figma `type` — 기본값도 Figma와 동일하게 "process" */
  type?: "process" | "completed" | "upload";
  /** `process`/`completed` 상태 우하단 타임스탬프 (Figma 예시: "2026.03.24 19:24:06") */
  timestamp?: string;
  /** `completed` 상태 인물 사진 */
  portraitSrc?: string;
  portraitAlt?: string;
  /**
   * `completed` 상태의 "Update this image" 편집 오버레이를 강제로 표시합니다
   * (Figma `Status=hover`). 실제 상호작용은 CSS `:hover`/`:focus-within`로 이미
   * 동작하므로, 이 prop은 Storybook Controls나 테스트처럼 마우스 호버를 재현할
   * 수 없는 환경에서만 사용합니다. 기본값 false.
   */
  imageHover?: boolean;
  /** `completed` 상태 호버 오버레이의 "Edit Asset Image" 버튼 클릭 콜백 */
  onEditImage?: () => void;
  /**
   * `upload` 상태 배경에 끼워 넣을 이미지(텍스처/워터마크 등). 미지정 시 기본
   * `bg-white + padding` 흰 테두리 그대로 렌더링됩니다(Figma 원본과 동일한 결과).
   */
  emptyStateBackgroundSrc?: string;
  emptyStateBackgroundAlt?: string;
  /** `upload` 상태 "Open your folder" 클릭 → 파일 선택 결과 콜백 */
  onFileSelect?: (file: File | null) => void;
}

export function ProfilePrint({
  type = "process",
  timestamp = "2026.03.24 19:24:06",
  portraitSrc,
  portraitAlt = "",
  imageHover = false,
  onEditImage,
  emptyStateBackgroundSrc,
  emptyStateBackgroundAlt = "",
  onFileSelect,
  className,
  ...props
}: ProfilePrintProps) {
  const isCompleted = type === "completed";
  const isProcess = type === "process";
  const isUpload = type === "upload";
  const fileInputId = React.useId();

  return (
    <div
      className={cn(
        "relative flex w-[542px] flex-col items-center justify-center overflow-clip",
        "bg-[var(--gb-background-static-white)]",
        "px-[var(--gb-spacing-4)] pt-[var(--gb-spacing-9)] pb-[var(--gb-spacing-24)]",
        isUpload && "h-[642px]",
        className,
      )}
      {...props}
    >
      {emptyStateBackgroundSrc && isUpload && (
        <img
          src={emptyStateBackgroundSrc}
          alt={emptyStateBackgroundAlt}
          aria-hidden={emptyStateBackgroundAlt === ""}
          className="absolute inset-0 size-full object-cover"
        />
      )}

      {isCompleted && (
        <>
          <div
            className={cn(
              "relative aspect-square w-full shrink-0 overflow-hidden",
              styles.portrait,
            )}
            data-image-hover={imageHover || undefined}
          >
            <img
              src={portraitSrc}
              alt={portraitAlt}
              className={cn(
                "absolute inset-0 size-full object-cover",
                styles.portraitImage,
              )}
            />
            <div
              className={cn(
                "dark absolute inset-0 flex flex-col items-center justify-center gap-[var(--gb-spacing-9)]",
                styles.portraitOverlay,
              )}
            >
              <div className="flex w-[510px] flex-col items-center gap-[var(--gb-spacing-2)] text-center">
                <p className="text-lg-medium w-full text-[var(--gb-text-popover)]">
                  Update this image
                </p>
                <p className="text-sm-regular w-full text-[var(--gb-text-selected)]">
                  Make a quick change to keep it current and sharp.
                </p>
              </div>
              <Button
                variant="mute"
                icon={<Icon id="eraser-icon" />}
                onClick={onEditImage}
              >
                Edit Asset Image
              </Button>
            </div>
          </div>
          <p className="text-time-stamp absolute bottom-[18px] right-[13px] text-[var(--gb-text-subtle)]">
            {timestamp}
          </p>
        </>
      )}

      {isProcess && (
        <>
          <div className="relative w-full shrink-0">
            <Skeleton
              type="rectangle"
              className="aspect-square h-auto rounded-none"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner type="primary" label="Processing" />
            </div>
          </div>
          <p className="text-time-stamp absolute bottom-[18px] right-[13px] text-[var(--gb-text-subtle)]">
            {timestamp}
          </p>
        </>
      )}

      {isUpload && (
        <>
          <div
            className={cn(
              "dark relative flex size-[510px] shrink-0 flex-col items-center justify-center",
              "gap-[var(--gb-spacing-6)] opacity-[var(--gb-opacity-85)]",
              "border-[length:var(--gb-border-2)] border-dashed border-[var(--gb-border-muted)]",
              "bg-[var(--gb-background-bolder)] backdrop-blur-[var(--gb-backdrop-blur-md)]",
            )}
          >
            <div className="flex w-full shrink-0 flex-col items-center gap-[var(--gb-spacing-2)]">
              <div className="flex size-[40px] shrink-0 items-center justify-center rounded-[var(--gb-radius-scale-lg)] bg-[var(--gb-background-subtler)]">
                {/* 아이콘 색은 Figma에서 --border-bolder에 바인딩돼 있다 — 이름은
                    "border"지만 이 인스턴스에서는 아이콘 stroke 색으로 쓰인다. */}
                <svg
                  className="size-[24px] text-[var(--gb-border-bolder)]"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#asset-icon" />
                </svg>
              </div>
              <p className="text-lg-medium w-full min-w-full text-center text-[var(--gb-text-popover)]">
                {`Let's create your brand image!`}
              </p>
              <p className="text-sm-regular w-full min-w-full whitespace-pre-wrap text-center text-[var(--gb-text-selected)]">
                {`We'll craft an image that fits your personal brand.`}
                <br aria-hidden="true" />
                {` Upload a photo to get started.`}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => document.getElementById(fileInputId)?.click()}
            >
              Open your folder
            </Button>
            <input
              id={fileInputId}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) =>
                onFileSelect?.(event.target.files?.[0] ?? null)
              }
            />
          </div>
          <p className="text-time-stamp absolute bottom-[18px] right-[13px] text-[var(--gb-text-subtle)]">
            Gabrielle.ai
          </p>
        </>
      )}
    </div>
  );
}
