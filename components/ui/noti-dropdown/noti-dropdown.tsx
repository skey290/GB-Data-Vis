"use client";

import * as React from "react";
import { Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { Tabs } from "@/components/ui/tabs";

/**
 * Figma "Noti dropdown"(node-id 4979:11016) + 리스트 행 "Part/noti dropdown"
 * (node-id 4978:9853) — GNB 알림벨(`MenuNotification`) 클릭 시 뜨는 드롭다운
 * 패널. `Tabs`/`Badge`를 그대로 재사용합니다(헤더의 All/Unread 탭 + 카운트
 * 배지는 기존 `Tabs`의 렌더링과 토큰까지 완전히 일치).
 *
 * 항상 다크(GNB 계열 공통 — FloatingMenu/Chatbox/Popover와 동일한 패턴).
 */
export interface NotiDropdownItem {
  id: string;
  label: string;
  /** true면 우측에 4px 빨간 dot이 표시되고(Figma `Type=new`), "Unread" 탭에도 노출됩니다 */
  unread?: boolean;
}

export interface NotiDropdownProps {
  items: NotiDropdownItem[];
  /** 현재 선택된 탭 (완전 제어형) */
  selectedTab?: "all" | "unread";
  onSelectedTabChange?: (tab: "all" | "unread") => void;
  onSettingsClick?: () => void;
  className?: string;
}

// Figma 확정값(node 4979:11016): 6개 행 초과 시 스크롤 — 리스트/스크롤바 트랙이
// 공유하는 높이값 (select.tsx와 동일 계산 관례)
const LIST_MAX_HEIGHT_CLASS =
  "max-h-[calc((var(--spacing-8)*6)+(var(--spacing-2)*5)+(var(--spacing-1)*2))]";
const SCROLLBAR_TRACK_HEIGHT_CLASS =
  "h-[calc((var(--spacing-8)*6)+(var(--spacing-2)*5)+(var(--spacing-1)*2))]";

export function NotiDropdown({
  items,
  selectedTab = "all",
  onSelectedTabChange,
  onSettingsClick,
  className,
}: NotiDropdownProps) {
  const [thumb, setThumb] = React.useState({ top: 0, height: 100 });
  const listRef = React.useRef<HTMLUListElement>(null);

  const unreadCount = items.filter((item) => item.unread).length;
  const visibleItems =
    selectedTab === "unread" ? items.filter((item) => item.unread) : items;
  const isScrollable = visibleItems.length > 6;

  const updateThumb = React.useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const { scrollTop, scrollHeight, clientHeight } = list;
    if (scrollHeight <= clientHeight) {
      setThumb({ top: 0, height: 100 });
      return;
    }
    const heightPercent = (clientHeight / scrollHeight) * 100;
    const topPercent =
      (scrollTop / (scrollHeight - clientHeight)) * (100 - heightPercent);
    setThumb({ top: topPercent, height: heightPercent });
  }, []);

  const listCallbackRef = React.useCallback(
    (node: HTMLUListElement | null) => {
      listRef.current = node;
      if (node) updateThumb();
    },
    [updateThumb],
  );

  return (
    <div
      className={cn(
        "dark flex w-[300px] flex-col items-start gap-[var(--spacing-2)]",
        "rounded-[var(--radius-scale-md)] border-[length:var(--border-1)] border-[var(--border-default)] border-solid",
        "bg-[var(--background-overlay)] py-[var(--spacing-1)]",
        // Figma 그림자(0 4px 3px + 0 2px 2px, 10% 블랙)와 정확히 일치하는 토큰이
        // 없어 크기가 가장 가까운 --shadow-md로 근사
        "shadow-[var(--shadow-md)]",
        className,
      )}
    >
      <div className="flex w-full items-center px-[var(--spacing-2)]">
        <Tabs
          items={[
            { label: "All", count: items.length },
            { label: "Unread", count: unreadCount },
          ]}
          selectedIndex={selectedTab === "unread" ? 1 : 0}
          onSelectedIndexChange={(index) =>
            onSelectedTabChange?.(index === 1 ? "unread" : "all")
          }
          className="min-w-0 flex-1 border-b-[color:var(--border-static-gray)] [&>button]:flex-1"
        />
        <button
          type="button"
          aria-label="Notification settings"
          onClick={onSettingsClick}
          className={cn(
            "inline-flex size-[36px] shrink-0 items-center justify-center",
            "rounded-[var(--radius-scale-full)] text-[var(--icon-default)]",
            "outline-none transition-colors",
            "hover:text-[var(--icon-subtlest)] focus-visible:shadow-[var(--shadow-focus-ring)]",
          )}
        >
          <Settings aria-hidden="true" className="size-[var(--spacing-4)]" />
        </button>
      </div>
      <div className="flex w-full items-stretch">
        <ul
          ref={listCallbackRef}
          onScroll={updateThumb}
          className={cn(
            "flex min-w-0 flex-1 flex-col items-start gap-[var(--spacing-2)] overflow-y-auto p-[var(--spacing-1)]",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            LIST_MAX_HEIGHT_CLASS,
          )}
        >
          {visibleItems.map((item) => (
            <li key={item.id} className="w-full shrink-0">
              <div
                className={cn(
                  "flex h-[var(--spacing-8)] w-full items-center gap-[var(--spacing-3)]",
                  "rounded-[var(--radius-scale-sm)] px-[var(--spacing-2)]",
                  "text-[var(--text-default)] transition-colors",
                  "hover:bg-[var(--background-static-gray)] hover:text-[var(--text-static-white)]",
                )}
              >
                <svg
                  aria-hidden="true"
                  className="size-[var(--spacing-3)] shrink-0"
                >
                  <use href="/icons.svg#megaphone-icon" />
                </svg>
                <span className="min-w-0 flex-1 truncate text-xs-regular">
                  {item.label}
                </span>
                {item.unread ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-[var(--spacing-1)] shrink-0 rounded-[var(--radius-scale-full)]",
                      "bg-[var(--background-warning-default)]",
                    )}
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        {isScrollable ? (
          <div
            aria-hidden="true"
            className="shrink-0 py-[var(--spacing-1)] pr-[var(--spacing-1)]"
          >
            <div
              className={cn(
                "relative w-[10px] rounded-[var(--radius-scale-full)] bg-[var(--background-subtler)]",
                SCROLLBAR_TRACK_HEIGHT_CLASS,
              )}
            >
              <div
                className="absolute inset-x-0 rounded-[var(--radius-scale-full)] bg-[var(--background-subtle)]"
                style={{ top: `${thumb.top}%`, height: `${thumb.height}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
