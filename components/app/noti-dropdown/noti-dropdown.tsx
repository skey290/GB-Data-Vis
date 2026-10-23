"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/sprite-icon";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Scrollbar } from "@/components/ui/scrollbar";
import { NotiItem } from "@/components/app/noti-item";

/** 알림벨 클릭 시 뜨는 드롭다운 패널 (docs/components/noti-dropdown.md 참고) */
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
  /** 리스트 안 알림 항목 클릭 시 호출(항목 id 전달) */
  onItemClick?: (id: string) => void;
  className?: string;
}
// 6행 높이로 고정 (docs/components/noti-dropdown.md 참고 — calc() 공백 필수)
const LIST_VISIBLE_HEIGHT =
  "calc((var(--gb-spacing-8) * 6) + (var(--gb-spacing-2) * 5) + (var(--gb-spacing-1) * 2))";

export function NotiDropdown({
  items,
  selectedTab = "all",
  onSelectedTabChange,
  onSettingsClick,
  onItemClick,
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
        "dark flex w-[300px] flex-col items-start gap-[var(--gb-spacing-2)]",
        "rounded-[var(--gb-radius-scale-md)] border-[length:var(--gb-border-1)] border-[var(--gb-border-default)] border-solid",
        "bg-[var(--gb-background-overlay)] py-[var(--gb-spacing-1)]",
        // 디자인 그림자와 정확히 일치하는 토큰이 없어 가장 가까운 값으로 근사한다.
        "shadow-[var(--gb-shadow-md)]",
        className,
      )}
    >
      <div className="flex w-full items-center px-[var(--gb-spacing-2)]">
        <Tabs
          items={[
            { label: "All", count: items.length },
            { label: "Unread", count: unreadCount },
          ]}
          selectedIndex={selectedTab === "unread" ? 1 : 0}
          onSelectedIndexChange={(index) =>
            onSelectedTabChange?.(index === 1 ? "unread" : "all")
          }
          className="min-w-0 flex-1 border-b-[color:var(--gb-border-static-gray)] [&>button]:flex-1"
        />
        <Button
          variant="icon-ghost"
          icon={<Icon id="settings-icon" />}
          aria-label="Notification settings"
          onClick={onSettingsClick}
          className="shrink-0"
        />
      </div>
      <div className="flex w-full items-stretch">
        <ul
          ref={listCallbackRef}
          onScroll={updateThumb}
          style={{ maxHeight: LIST_VISIBLE_HEIGHT }}
          className={cn(
            "flex min-w-0 flex-1 flex-col items-start gap-[var(--gb-spacing-2)] overflow-y-auto p-[var(--gb-spacing-1)]",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {visibleItems.map((item) => (
            <li key={item.id} className="w-full shrink-0">
              <NotiItem
                label={item.label}
                unread={item.unread}
                onClick={() => onItemClick?.(item.id)}
              />
            </li>
          ))}
        </ul>
        {isScrollable ? (
          <Scrollbar
            thumbTop={thumb.top}
            thumbHeight={thumb.height}
            style={{ height: LIST_VISIBLE_HEIGHT }}
          />
        ) : null}
      </div>
    </div>
  );
}
