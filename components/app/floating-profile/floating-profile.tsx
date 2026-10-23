import * as React from "react";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProfilePrint } from "@/components/app/profile-print";
import {
  SettingsSentence,
  STATEMENT_BOX_CLASS,
  type GoalPostingFrequency,
  type GoalTimeframe,
} from "@/components/app/goal-setting";
import { Icon } from "@/lib/sprite-icon";

/**
 * 프로필 플로팅 패널. 열림 여부는 `open` prop으로 제어하고, 프로필 이미지가
 * 없는 경우(`Type=no profile`)는 `avatarSrc`를 생략하는 것으로 표현합니다.
 * 카드 폭(620px)과 아바타 기준 오프셋(right-52px)은 Figma 확정 px 값을 그대로
 * 사용합니다(반응형이 아닌 고정폭 플로팅 카드).
 */
export interface FloatingProfileProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  /** 카드가 펼쳐진 상태인지 여부 */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  /** 아바타 버블 이미지. 미지정 시 "no profile" 상태(아이콘 폴백, 클릭 비활성) */
  avatarSrc?: string;
  avatarAlt?: string;
  /** 역할명 탭 헤더 */
  title: string;

  /** 폴라로이드 인물 사진 — `ProfilePrint`로 위임 */
  portraitSrc: string;
  portraitAlt?: string;
  timestamp: string;
  /** `ProfilePrint`의 "Update this image" 호버 오버레이를 강제로 표시 */
  imageHover?: boolean;
  onEditImage?: () => void;

  /** "Known for Now" 본문 */
  now: string;
  /** "Known for Next" 본문 */
  goal: string;
  postingCount?: number;
  postingFrequency?: GoalPostingFrequency;
  targetedFollowersIndex?: number;
  timeframe?: GoalTimeframe;
  /** 연필 버튼 클릭 — Now+Next 통합 편집 플로우를 연다 */
  onEditGoal?: () => void;

  /** 미지정 시 "Create a post" 사용 */
  ctaLabel?: string;
  onCtaClick?: () => void;
}

/** 폴라로이드 사진 모서리의 뷰파인더형 장식 브라켓. Figma에서 Variable에 바인딩되지 않은
 * 리터럴 색(#FAFAFA=neutral-50, 라이트/다크 공통 고정)이라 `--color-neutral-50` primitive를 사용합니다. */
function PolaroidCorner({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 51 51"
      className={cn(
        "pointer-events-none absolute size-[50px] text-[var(--gb-color-neutral-50)]",
        className,
      )}
    >
      <path
        d="M51 1H27C12.6406 1 1 12.6406 1 27V51"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

export function FloatingProfile({
  open: openProp = true,
  onOpenChange,
  avatarSrc,
  avatarAlt = "",
  title,
  portraitSrc,
  portraitAlt = "",
  timestamp,
  imageHover = false,
  onEditImage,
  now,
  goal,
  postingCount = 3,
  postingFrequency = "Day",
  targetedFollowersIndex = 1,
  timeframe = "1 year",
  onEditGoal,
  ctaLabel,
  onCtaClick,
  className,
  ...props
}: FloatingProfileProps) {
  // 순수 제어형이 아니다 — 부모가 `open`을 갱신하지 않는 사용처(스토리 args 고정 등)
  // 에서도 클릭이 즉시 반응해야 해서 prop을 초깃값으로 받아 내부 상태로도 관리하고,
  // 부모가 `open`을 실제로 바꾸면 그 값으로 다시 동기화한다.
  const [internalOpen, setInternalOpen] = React.useState(openProp);
  React.useEffect(() => {
    setInternalOpen(openProp);
  }, [openProp]);
  const open = internalOpen;

  // `animate-out`이 끝난 뒤에 언마운트하기 위한 상태 — 바로 언마운트하면
  // exit 애니메이션이 재생되지 않는다.
  const [mounted, setMounted] = React.useState(open);
  React.useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  const resolvedCtaLabel = ctaLabel ?? "Create a post";
  // 프로필 이미지가 없으면 펼칠 카드 디자인이 없어 클릭 자체를 막는다.
  const hasAvatar = Boolean(avatarSrc);

  const setOpen = (next: boolean) => {
    setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <div
      className={cn(
        "relative isolate inline-flex flex-col items-center",
        className,
      )}
      {...props}
    >
      {/* 아바타 버블 — Figma엔 "Button"이 아닌 "Avatar" 인스턴스라 디자인 시스템
          Button을 억지로 씌우지 않고, 접근성을 위한 순수 클릭 래퍼(reset된 네이티브
          button)로 감쌌습니다. */}
      <button
        type="button"
        onClick={hasAvatar ? () => setOpen(!open) : undefined}
        disabled={!hasAvatar}
        aria-expanded={hasAvatar ? open : undefined}
        aria-label={
          hasAvatar
            ? open
              ? `${title} 프로필 닫기`
              : `${title} 프로필 열기`
            : title
        }
        className={cn(
          "relative z-[2] inline-flex shrink-0 items-center justify-center rounded-[var(--gb-radius-scale-full)] bg-transparent p-0 outline-none disabled:cursor-default",
          // 실제 border는 레이아웃 공간을 차지해서 켜고 끌 때마다 아바타
          // 이미지가 1px씩 밀려 보인다 — box-shadow로 바깥쪽에 겹쳐 그려서
          // 레이아웃에 영향 없이 링만 토글한다.
          open && "shadow-[0_0_0_var(--gb-border-1)_var(--gb-border-bolder)]",
        )}
      >
        <Avatar
          variant="image"
          shape="circle"
          src={avatarSrc}
          alt={avatarAlt || title}
        />
      </button>

      {mounted && (
        <div
          data-state={open ? "open" : "closed"}
          onAnimationEnd={() => {
            if (!open) setMounted(false);
          }}
          className={cn(
            "absolute right-[52px] top-0 z-[1] flex w-[620px] origin-top-right flex-col items-center",
            "gap-[var(--gb-spacing-8)] rounded-[var(--gb-radius-scale-4xl)]",
            "border border-[var(--gb-border-selected)] bg-[var(--gb-background-subtlest)]",
            "px-[var(--gb-spacing-12)] pb-[var(--gb-spacing-8)] pt-[var(--gb-spacing-4)]",
            "shadow-[var(--gb-shadow-md)]",
            // 아바타 버블이 페이지상 같은 자리에 고정되어야 해서, 페이지를
            // 스크롤하는 대신 카드 높이를 뷰포트 기준으로 제한하고 내부에서만
            // 스크롤한다. 아래 여백은 페이지의 top 오프셋과 대칭으로 맞춘다.
            "max-h-[calc(100vh-var(--gb-spacing-6)*2)] overflow-y-auto overscroll-contain",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            // fill-mode-forwards 필수: 기본값(none)이면 exit 애니메이션이 끝나는
            // 순간 opacity가 애니메이션 미적용 상태(1)로 스냅백했다가 그 직후
            // 언마운트되어 "깜빡"하는 프레임이 생김(closed 상태를 그대로 유지).
            "duration-150 fill-mode-forwards data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          )}
        >
          {/* 닫기 버튼 — Figma상 위치는 카드 우측 패딩(48px) 경계에 맞춰짐 */}
          <Button
            variant="icon-ghost"
            icon={<Icon id="x-icon" />}
            onClick={() => setOpen(false)}
            aria-label="닫기"
            className="absolute right-[var(--gb-spacing-12)] top-[22px] z-[1]"
          />

          {/* 역할명 탭 헤더 */}
          <div className="flex h-[48px] w-full shrink-0 items-center border-b-[length:var(--gb-border-1)] border-[var(--gb-border-mute)]">
            <div className="flex h-full items-center gap-[var(--gb-spacing-2)] border-b-[length:var(--gb-border-1)] border-[var(--gb-border-bolder)] px-[var(--gb-spacing-3)]">
              <p className="text-sm-semi-bold whitespace-nowrap text-[var(--gb-text-default)]">
                {title}
              </p>
            </div>
          </div>

          {/* Print container — 사진 브라켓 4개는 ProfilePrint 박스의 네 꼭짓점에 걸린다 */}
          <div className="relative flex w-full shrink-0 flex-col items-center justify-center gap-[var(--gb-spacing-5)] rounded-[var(--gb-radius-scale-3xl)] bg-[var(--gb-background-subtlest)] p-[var(--gb-spacing-5)]">
            <PolaroidCorner className="left-0 top-0" />
            <PolaroidCorner className="right-0 top-0 -scale-x-100" />
            <PolaroidCorner className="bottom-0 left-0 -scale-y-100" />
            <PolaroidCorner className="bottom-0 right-0 rotate-180" />
            <ProfilePrint
              type="completed"
              portraitSrc={portraitSrc}
              portraitAlt={portraitAlt}
              timestamp={timestamp}
              imageHover={imageHover}
              onEditImage={onEditImage}
              className="w-full"
            />
          </div>

          {/* Before → After */}
          <div className="flex w-full shrink-0 flex-col items-center gap-[var(--gb-spacing-4)]">
            <div className="flex w-full flex-col items-start gap-[var(--gb-spacing-2)]">
              <div className="flex w-full items-center justify-between">
                <p className="flex-1 text-base-bold text-[var(--gb-text-default)]">
                  Known for Now
                </p>
                <Button
                  variant="icon-ghost"
                  icon={<Icon id="pen-icon" />}
                  aria-label="Known for Now 편집"
                  onClick={onEditGoal}
                />
              </div>
              <div className={cn(STATEMENT_BOX_CLASS, "w-full")}>
                <p className="text-base-regular text-[var(--gb-text-default)]">
                  {now}
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col items-start gap-[var(--gb-spacing-2)]">
              <p className="w-full text-base-bold text-[var(--gb-text-default)]">
                Known for Next
              </p>
              <div
                className={cn(
                  STATEMENT_BOX_CLASS,
                  "flex w-full flex-col items-start gap-[var(--gb-spacing-4)]",
                )}
              >
                <p className="w-full text-base-regular text-[var(--gb-text-default)]">
                  {goal}
                </p>
                <div
                  aria-hidden="true"
                  className="h-[var(--gb-border-1)] w-full bg-[var(--gb-border-subtler)]"
                />
                <SettingsSentence
                  postingCount={postingCount}
                  postingFrequency={postingFrequency}
                  targetedFollowersIndex={targetedFollowersIndex}
                  timeframe={timeframe}
                />
              </div>
            </div>
          </div>

          <Button variant="primary" onClick={onCtaClick} className="w-full">
            {resolvedCtaLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
