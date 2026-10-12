import * as React from "react";
import {
  type LucideIcon,
  Archive,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Blocks,
  Bookmark,
  Calendar,
  CalendarCheck,
  ChartColumnBig,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleArrowOutUpRight,
  CircleCheck,
  CircleCheckBig,
  CircleDashed,
  CircleHelp,
  CircleX,
  CreditCard,
  Download,
  Ellipsis,
  EllipsisVertical,
  Equal,
  Eraser,
  FilePen,
  Globe,
  Goal,
  HeartHandshake,
  History,
  House,
  ImageOff,
  Images,
  Maximize,
  Megaphone,
  Menu,
  MessageCircleHeart,
  MessageCircleQuestionMark,
  MessagesSquare,
  Minus,
  PanelLeftClose,
  PanelLeftOpen,
  Pen,
  Play,
  Plus,
  Redo2,
  Replace,
  RotateCcw,
  Save,
  Search,
  SearchX,
  ServerOff,
  Settings,
  Settings2,
  Share2,
  Shield,
  Shrink,
  SkipBack,
  SkipForward,
  Smile,
  Sparkles,
  Trash2,
  TriangleAlert,
  Undo2,
  UserRound,
  UserRoundSearch,
  Volume2,
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
 * `/public/icons.svg`가 보유하는 심볼 id — Figma `Customized Icons` 프레임에
 * 대응합니다. 브랜드 로고와 Gabrielle 전용 컨셉 아이콘처럼 lucide에 같은
 * 디자인이 없는 것만 둡니다. `icon?: string` 대신 리터럴 유니온을 쓰기 위한
 * 목록이라, icons.svg에 심볼을 추가/삭제하면 이 배열도 함께 갱신합니다.
 */
export const SPRITE_ONLY_ICON_IDS = [
  "asset-icon",
  "compass-icon",
  "crown-icon",
  "dot-bell-icon",
  "engagement-icon",
  "expand-close-icon",
  "expand-icon",
  "facebook-icon",
  "file-text-icon",
  "google-icon",
  "handle-icon",
  "hook-icon",
  "instagram-icon",
  "linkedin-icon",
  "linkedinset-comment-icon",
  "linkedinset-like-icon",
  "linkedinset-public-icon",
  "linkedinset-repost-icon",
  "linkedinset-send-icon",
  "meta-badge-icon",
  "meta-bookmark-icon",
  "meta-comment-icon",
  "meta-like-icon",
  "meta-more-icon",
  "meta-repost-icon",
  "meta-repost2-icon",
  "meta-share-icon",
  "meta-share2-icon",
  "no-file-pen-icon",
  "reach-and-engagement-icon",
  "reach-icon",
  "thread-icon",
  "tiktok-icon",
  "user-filled-icon",
  "xtwitter-icon",
  "xtwitterset-badge-icon",
  "xtwitterset-comment-icon",
  "xtwitterset-like-icon",
  "xtwitterset-retweet-icon",
  "xtwitterset-share-icon",
  "xtwitterset-view-icon",
  "youtube-icon",
] as const;

export type SpriteOnlyIconId = (typeof SPRITE_ONLY_ICON_IDS)[number];

/**
 * 심볼 id → `lucide-react` 컴포넌트 매핑 — Figma `Lucide Icons` 프레임에
 * 대응합니다. 여기 있는 id는 `/public/icons.svg`에 두지 않습니다.
 * `Button`처럼 `icon` prop으로 임의 id를 받는 컴포넌트는 이 맵에 없는 id를
 * 스프라이트로 폴백합니다.
 */
export const LUCIDE_SPRITE_MAP = {
  "archive-icon": Archive,
  "arrow-left-icon": ArrowLeft,
  "arrow-right-icon": ArrowRight,
  "arrow-up-right-icon": ArrowUpRight,
  "bar-chart-big-icon": ChartColumnBig,
  "bell-icon": Bell,
  "blocks-icon": Blocks,
  "bookmark-icon": Bookmark,
  "calendar-check-icon": CalendarCheck,
  "calendar-icon": Calendar,
  "check-icon": Check,
  "chevron-down-icon": ChevronDown,
  "chevron-left-icon": ChevronLeft,
  "chevron-right-icon": ChevronRight,
  "chevron-up-icon": ChevronUp,
  "circle-arrow-out-up-right-icon": CircleArrowOutUpRight,
  "circle-check-big-icon": CircleCheckBig,
  "circle-check-icon": CircleCheck,
  "circle-dashed-icon": CircleDashed,
  "circle-help-icon": CircleHelp,
  "circle-x-icon": CircleX,
  "credit-card-icon": CreditCard,
  "download-icon": Download,
  "ellipsis-icon": Ellipsis,
  "ellipsis-vertical-icon": EllipsisVertical,
  "equal-icon": Equal,
  "eraser-icon": Eraser,
  "file-pen-icon": FilePen,
  "globe-icon": Globe,
  "goal-icon": Goal,
  "heart-handshake-icon": HeartHandshake,
  "history-icon": History,
  "home-icon": House,
  "image-off-icon": ImageOff,
  "images-icon": Images,
  "maximize-icon": Maximize,
  "megaphone-icon": Megaphone,
  "menu-icon": Menu,
  "message-circle-heart-icon": MessageCircleHeart,
  "message-circle-question-icon": MessageCircleQuestionMark,
  "messages-square-icon": MessagesSquare,
  "minus-icon": Minus,
  "panel-left-close-icon": PanelLeftClose,
  "panel-left-open-icon": PanelLeftOpen,
  "pen-icon": Pen,
  "play-icon": Play,
  "plus-icon": Plus,
  "redo-2-icon": Redo2,
  "replace-icon": Replace,
  "rotate-ccw-icon": RotateCcw,
  "save-icon": Save,
  "search-icon": Search,
  "search-x-icon": SearchX,
  "server-off-icon": ServerOff,
  "settings-2-icon": Settings2,
  "settings-icon": Settings,
  "share-2-icon": Share2,
  "shield-icon": Shield,
  "shrink-icon": Shrink,
  "skip-back-icon": SkipBack,
  "skip-forward-icon": SkipForward,
  "smile-icon": Smile,
  "sparkles-icon": Sparkles,
  "trash-2-icon": Trash2,
  "triangle-alert-icon": TriangleAlert,
  "undo-2-icon": Undo2,
  "user-round-icon": UserRound,
  "user-search-icon": UserRoundSearch,
  "volume-2-icon": Volume2,
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
