import * as React from "react";
import {
  type LucideIcon,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  CircleDashed,
  CircleHelp,
  CircleX,
  CreditCard,
  Ellipsis,
  EllipsisVertical,
  Eraser,
  Expand,
  FilePen,
  Globe,
  Goal,
  History,
  ImageOff,
  Maximize,
  Minus,
  PanelLeftClose,
  PanelLeftOpen,
  Pen,
  Plus,
  Redo2,
  RotateCcw,
  Search,
  SearchX,
  ServerOff,
  Settings,
  Share2,
  Shield,
  Trash2,
  Undo2,
  UserRound,
  Wand,
  X,
} from "lucide-react";

/**
 * `/public/icons.svg` 심볼을 `LucideIcon`과 동일한 방식(className/aria-hidden 등
 * SVG props를 그대로 전달)으로 렌더링하는 컴포넌트로 감쌉니다. `MenuButton`,
 * `Pagination`처럼 `icon: LucideIcon` 형태로 아이콘을 컴포넌트로 넘기는 곳에
 * Figma 아이콘 스프라이트를 그대로 꽂기 위한 어댑터입니다.
 */
export function createSpriteIcon(symbolId: string): LucideIcon {
  function SpriteIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg {...props}>
        <use href={`/icons.svg#${symbolId}`} />
      </svg>
    );
  }
  SpriteIcon.displayName = `SpriteIcon(${symbolId})`;
  return SpriteIcon as unknown as LucideIcon;
}

/**
 * 스프라이트 심볼 id → `lucide-react` 컴포넌트 매핑. 2026-10-02 픽셀 단위
 * 래스터 대조(공식 Figma 원본과 0% 또는 육안 무차이)로 검증된 범용 아이콘만
 * 포함합니다. 소셜 로고(google/linkedin 등)와 Gabrielle 전용 컨셉 아이콘
 * (asset/compass/reach/engagement/goal 등 일부)은 lucide에 대응 디자인이
 * 없거나 달라 여기 포함하지 않고 `/public/icons.svg` 스프라이트를 그대로
 * 유지합니다 — `Button`처럼 `icon: string` prop으로 임의 심볼 id를 받는
 * 컴포넌트가 이 맵에 없는 id는 스프라이트로 폴백하기 위한 테이블입니다.
 */
/**
 * `/public/icons.svg`에만 존재하고 `LUCIDE_SPRITE_MAP`에는 없는 심볼 id
 * (브랜드 로고, Gabrielle 전용 컨셉 아이콘). `icon?: string` 대신 리터럴
 * 유니온을 쓰기 위한 목록으로, icons.svg에 심볼을 추가/삭제하면 이 배열도
 * 함께 갱신합니다.
 */
export const SPRITE_ONLY_ICON_IDS = [
  "archive-icon",
  "asset-icon",
  "bar-chart-big-icon",
  "blocks-icon",
  "bookmark-active-icon",
  "bookmark-default-icon",
  "calendar-check-icon",
  "calendar-icon",
  "circle-arrow-in-down-left-icon",
  "circle-arrow-out-up-right-icon",
  "circle-check2-icon",
  "close-icon",
  "compass-icon",
  "crown-icon",
  "dashboard-icon",
  "engagement-icon",
  "equal-icon",
  "expand-close-icon",
  "facebook-icon",
  "file-text-icon",
  "google-icon",
  "handle-icon",
  "heart-icon",
  "home-icon",
  "hook-icon",
  "images-icon",
  "instagram-icon",
  "linkedin-icon",
  "megaphone-icon",
  "menu-icon",
  "message-circle-heart-icon",
  "message-circle-question-icon",
  "messages-square-icon",
  "no-file-pen-icon",
  "number-1-icon",
  "number-2-icon",
  "number-3-icon",
  "number-4-icon",
  "number-5-icon",
  "number-6-icon",
  "number-7-icon",
  "pinterest-icon",
  "play-icon",
  "reach-and-engagement-icon",
  "reach-icon",
  "replace-icon",
  "save-icon",
  "settings-2-icon",
  "skip-back-icon",
  "skip-forward-icon",
  "smile-icon",
  "socialx-icon",
  "sparkles-icon",
  "thread-icon",
  "tiktok-icon",
  "triangle-alert-icon",
  "user-filled-icon",
  "user-search-icon",
  "volume-2-icon",
  "youtube-icon",
] as const;

export type SpriteOnlyIconId = (typeof SPRITE_ONLY_ICON_IDS)[number];

export const LUCIDE_SPRITE_MAP = {
  "arrow-left-icon": ArrowLeft,
  "arrow-right-icon": ArrowRight,
  "arrow-up-right-icon": ArrowUpRight,
  "bell-icon": Bell,
  "check-icon": Check,
  "chevron-down-icon": ChevronDown,
  "chevron-left-icon": ChevronLeft,
  "chevron-right-icon": ChevronRight,
  "chevron-up-icon": ChevronUp,
  "circle-check-icon": CircleCheck,
  "circle-dashed-icon": CircleDashed,
  "circle-help-icon": CircleHelp,
  "circle-x-icon": CircleX,
  "credit-card-icon": CreditCard,
  "ellipsis-icon": Ellipsis,
  "ellipsis-vertical-icon": EllipsisVertical,
  "eraser-icon": Eraser,
  "expand-icon": Expand,
  "file-pen-icon": FilePen,
  "globe-icon": Globe,
  "goal-icon": Goal,
  "history-icon": History,
  "image-off-icon": ImageOff,
  "maximize-icon": Maximize,
  "minus-icon": Minus,
  "panel-left-close-icon": PanelLeftClose,
  "panel-left-open-icon": PanelLeftOpen,
  "pen-icon": Pen,
  "plus-icon": Plus,
  "redo-2-icon": Redo2,
  "rotate-ccw-icon": RotateCcw,
  "search-icon": Search,
  "search-x-icon": SearchX,
  "server-off-icon": ServerOff,
  "settings-icon": Settings,
  "share-2-icon": Share2,
  "shield-icon": Shield,
  "trash-2-icon": Trash2,
  "undo-2-icon": Undo2,
  "user-round-icon": UserRound,
  "wand-icon": Wand,
  "x-icon": X,
} satisfies Record<string, LucideIcon>;

export type LucideIconId = keyof typeof LUCIDE_SPRITE_MAP;

/** Button 등 `icon` prop이 받을 수 있는 전체 아이콘 id (lucide 매핑 + sprite 전용). */
export type IconId = LucideIconId | SpriteOnlyIconId;

export const ICON_IDS: readonly IconId[] = [
  ...(Object.keys(LUCIDE_SPRITE_MAP) as LucideIconId[]),
  ...SPRITE_ONLY_ICON_IDS,
];
