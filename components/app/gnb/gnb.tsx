"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import {
  type LucideIcon,
  Archive,
  BarChartBig,
  Bell,
  CreditCard,
  History,
  RotateCcw,
  Shield,
  Trash2,
  UserRound,
  X,
  PanelLeftClose as PanelLeftCloseIcon,
  PanelLeftOpen as PanelLeftOpenIcon,
  Settings as SettingsIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { MenuButton } from "@/components/app/menu-button";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";
import { Popover } from "@/components/ui/popover";
import { InputSearch } from "@/components/ui/input-search";
import {
  NotiDropdown,
  type NotiDropdownItem,
} from "@/components/app/noti-dropdown";

/** 읽지 않은 알림 벨 — `Bell` 위에 점을 겹친 합성 아이콘 (docs/components/gnb.md 참고) */
const DotBellIcon = function DotBellIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex", className)}>
      <Bell aria-hidden="true" className="size-full" />
      <span
        aria-hidden="true"
        data-testid="unread-dot"
        className="absolute -top-0.5 -right-0.5 size-[var(--gb-spacing-1)] rounded-[var(--gb-radius-scale-full)] bg-[var(--gb-background-warning-default)]"
      />
    </span>
  );
} as unknown as LucideIcon;

/** Work History/Self Archive 드로어 리스트 항목 하나 */
export interface GnbHistoryItem {
  label: string;
  /** 있으면 Work History 스타일 행(배지+라벨+타임스탬프)으로 렌더링됩니다 */
  badge?: string;
  /** 있으면 Work History 스타일 행으로 렌더링됩니다 */
  timestamp?: string;
  onRestore?: () => void;
  /** Self Archive 스타일 행에서만 사용(Work History에는 삭제 버튼이 없음) */
  onDelete?: () => void;
}

const historyIconButtonClass = cn(
  "inline-flex shrink-0 items-center justify-center rounded-[var(--gb-radius-scale-full)]",
  "text-[var(--gb-icon-default)] outline-none transition-colors",
  "hover:text-[var(--gb-icon-subtlest)] focus-visible:shadow-[var(--gb-shadow-focus-ring)]",
);

/**
 * Work History/Self Archive 패널 — Figma상 GNB 컴포넌트셋 자신의 `Type` variant로,
 * `Notfication`(알림)과 달리 별도 컴포넌트를 인스턴싱하지 않고 범용 atom(Button/
 * Badge/아이콘)만으로 GNB 안에 직접 그려진다. 그래서 `NotiDropdown`과 달리
 * 독립 컴포넌트로 분리하지 않고 `Gnb` 내부에 그대로 둔다.
 */
function GnbHistoryPanel({
  title,
  items,
  onClose,
}: {
  title: string;
  items: GnbHistoryItem[];
  onClose: () => void;
}) {
  // 삭제 확인창 (docs/components/gnb.md 참고)
  const [pendingDeleteIndex, setPendingDeleteIndex] = React.useState<
    number | null
  >(null);
  const pendingDeleteItem =
    pendingDeleteIndex !== null ? items[pendingDeleteIndex] : null;

  return (
    <div
      className={cn(
        "dark flex h-full flex-col items-start gap-[var(--gb-spacing-4)]",
        "w-[407px] bg-[var(--gb-background-subtler)]",
        "py-[var(--gb-spacing-6)] pr-[var(--gb-spacing-2)] pl-[var(--gb-spacing-7)]",
      )}
    >
      <div className="flex w-full items-center justify-between pr-[var(--gb-spacing-6)]">
        <h2 className="truncate text-base-semi-bold text-[var(--gb-text-bold)]">
          {title}
        </h2>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className={cn(historyIconButtonClass, "size-[28px]")}
        >
          <X aria-hidden="true" className="size-[var(--gb-spacing-4)]" />
        </button>
      </div>
      <ul className="flex w-full flex-1 flex-col items-start gap-[var(--gb-spacing-2)] overflow-y-auto pr-[var(--gb-spacing-5)]">
        {items.map((item, index) => {
          const isHistoryStyle =
            item.badge !== undefined || item.timestamp !== undefined;

          return (
            <li key={`${item.label}-${index}`} className="w-full shrink-0">
              {isHistoryStyle ? (
                <div className="flex w-full items-center gap-[var(--gb-spacing-2)] rounded-[var(--gb-radius-scale-2xl)]">
                  {item.badge ? (
                    <Badge variant="outline">{item.badge}</Badge>
                  ) : null}
                  <span className="min-w-0 flex-1 truncate text-xs-medium text-[var(--gb-text-bold)]">
                    {item.label}
                  </span>
                  {item.timestamp ? (
                    <span className="shrink-0 text-xs-medium whitespace-nowrap text-[var(--gb-text-subtle)]">
                      {item.timestamp}
                    </span>
                  ) : null}
                  {item.onRestore ? (
                    <button
                      type="button"
                      aria-label="Restore"
                      onClick={item.onRestore}
                      className={cn(historyIconButtonClass, "size-[36px]")}
                    >
                      <History
                        aria-hidden="true"
                        className="size-[var(--gb-spacing-4)]"
                      />
                    </button>
                  ) : null}
                </div>
              ) : (
                <div
                  className={cn(
                    "flex h-[var(--gb-spacing-8)] w-full items-center gap-[var(--gb-spacing-1)]",
                    "rounded-[var(--gb-radius-scale-sm)] pr-[var(--gb-spacing-1)] pl-[var(--gb-spacing-2)]",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate text-sm-regular text-[var(--gb-text-default)]">
                    {item.label}
                  </span>
                  {item.onRestore ? (
                    <button
                      type="button"
                      aria-label="Restore"
                      onClick={item.onRestore}
                      className={cn(historyIconButtonClass, "size-[28px]")}
                    >
                      <RotateCcw
                        aria-hidden="true"
                        className="size-[var(--gb-spacing-4)]"
                      />
                    </button>
                  ) : null}
                  {item.onDelete ? (
                    <button
                      type="button"
                      aria-label="Delete"
                      onClick={() => setPendingDeleteIndex(index)}
                      className={cn(historyIconButtonClass, "size-[28px]")}
                    >
                      <Trash2
                        aria-hidden="true"
                        className="size-[var(--gb-spacing-4)]"
                      />
                    </button>
                  ) : null}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <Popover
        type="warning"
        open={pendingDeleteIndex !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteIndex(null);
        }}
        title="삭제할까요?"
        description={
          pendingDeleteItem
            ? `"${pendingDeleteItem.label}"을(를) 삭제하면 되돌릴 수 없습니다.`
            : undefined
        }
        confirmLabel="Delete"
        onConfirm={() => {
          pendingDeleteItem?.onDelete?.();
          setPendingDeleteIndex(null);
        }}
        onCancel={() => setPendingDeleteIndex(null)}
      />
    </div>
  );
}

/** Setting 패널 메뉴 6행의 id (Figma `Part/GNB` 라벨과 1:1 대응) */
export type GnbSettingSection =
  "notification" | "general" | "account" | "privacy" | "billing" | "usage";

const SETTING_SECTIONS: {
  id: GnbSettingSection;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "notification", label: "Notification", icon: Bell },
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "account", label: "Account", icon: UserRound },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "usage", label: "Usage", icon: BarChartBig },
];

/** Setting 패널 — 헤더 없이 검색창+메뉴 6행만 쌓인다 (docs/components/gnb.md 참고) */
function GnbSettingPanel({
  activeSection,
  searchValue,
  defaultSearchValue,
  onSearchChange,
  onSectionSelect,
}: {
  activeSection: GnbSettingSection | null;
  searchValue?: string;
  defaultSearchValue?: string;
  onSearchChange?: (value: string) => void;
  onSectionSelect?: (section: GnbSettingSection) => void;
}) {
  return (
    <div
      className={cn(
        "dark flex h-full w-[250px] flex-col items-start gap-[var(--gb-spacing-2-5)]",
        "bg-[var(--gb-background-subtlest)] px-[var(--gb-spacing-2)] py-[var(--gb-spacing-5)]",
      )}
    >
      <InputSearch
        value={searchValue}
        defaultValue={defaultSearchValue}
        onValueChange={onSearchChange}
        className="h-[32px] w-[234px]"
      />
      <ul
        className={cn(
          "flex w-full flex-col items-start gap-[var(--gb-spacing-2-5)]",
          "border-l-[length:var(--gb-border-1)] border-[var(--gb-border-selected)] pl-[var(--gb-spacing-3-5)]",
        )}
      >
        {SETTING_SECTIONS.map(({ id, label, icon }, index) => (
          <li
            key={id}
            // 레일 헤더 고정 높이에 맞춤, 토큰 스케일에 대응값 없음
            className={cn("w-full shrink-0", index === 0 && "mt-[60px]")}
          >
            <MenuButton
              type="icon-with-text"
              icon={icon}
              label={label}
              status={activeSection === id ? "active" : "default"}
              onClick={() => onSectionSelect?.(id)}
              className="w-full"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 메인 사이드바 (docs/components/gnb.md 참고) */
export interface GnbItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

export interface GnbProps {
  /** 사이드바 확장 여부 (Figma `Expand` variant) */
  expanded: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** 네비게이션 항목 목록 (Figma의 Dashboard/Assets/Compass/Contents Studio/Know Thyself) */
  items: GnbItem[];
  /** 현재 활성 항목 id */
  activeId: string;
  /** 개별적으로 비활성화된 항목 id 목록 (Figma `Style=disabled`) */
  disabledIds?: string[];
  onItemSelect?: (id: string) => void;
  /** 알림 벨의 읽지 않음 dot 표시 여부를 결정 (0이면 dot 숨김) */
  unreadCount?: number;
  /** 알림 드롭다운(`NotiDropdown`)에 전달할 항목 목록 */
  notificationItems?: NotiDropdownItem[];
  onToggleNotification?: (open: boolean) => void;
  onNotificationSettingsClick?: () => void;
  /** Settings 메뉴 클릭 콜백 (Setting 패널 토글과 별개로 항상 함께 호출됨) */
  onSettingsClick?: () => void;
  /** Work History 드로어에 전달할 항목 목록 */
  workHistoryItems?: GnbHistoryItem[];
  /** Self Archive 드로어에 전달할 항목 목록 */
  selfArchiveItems?: GnbHistoryItem[];
  /** Setting 패널 메뉴 행 클릭 콜백 */
  onSettingSectionSelect?: (section: GnbSettingSection) => void;
  /** Setting 패널 검색창의 제어 컴포넌트 값 */
  settingSearchValue?: string;
  /** Setting 패널 검색창의 비제어 초기값 */
  defaultSettingSearchValue?: string;
  onSettingSearchChange?: (value: string) => void;
  className?: string;
}

export function Gnb({
  expanded,
  onExpandedChange,
  items,
  activeId,
  disabledIds = [],
  onItemSelect,
  unreadCount = 0,
  notificationItems = [],
  onToggleNotification,
  onNotificationSettingsClick,
  onSettingsClick,
  workHistoryItems = [],
  selfArchiveItems = [],
  onSettingSectionSelect,
  settingSearchValue,
  defaultSettingSearchValue,
  onSettingSearchChange,
  className,
}: GnbProps) {
  const [notificationOpen, setNotificationOpen] = React.useState(false);
  const [activeDrawer, setActiveDrawer] = React.useState<
    "work-history" | "self-archive" | "setting" | null
  >(null);
  const [activeSettingSection, setActiveSettingSection] =
    React.useState<GnbSettingSection | null>(null);
  const menuType = expanded ? "icon-with-text" : "icon";

  const handleSettingSectionSelect = (section: GnbSettingSection) => {
    setActiveSettingSection(section);
    onSettingSectionSelect?.(section);
  };

  // 알림 → Setting의 Notification 섹션 바로 이동 (docs/components/gnb.md 참고)
  const handleNotificationSettingsClick = () => {
    setNotificationOpen(false);
    setActiveDrawer("setting");
    handleSettingSectionSelect("notification");
    onNotificationSettingsClick?.();
  };

  // 토글 위치: left=레일 폭 축, transform=드로어 폭 축 (docs/components/gnb.md 참고)
  const toggleLeft = (expanded ? 250 : 48) + 20;
  const toggleDrawerOffset =
    activeDrawer === "work-history" || activeDrawer === "self-archive"
      ? 407
      : 0;

  const toggleDrawer = (
    drawer: "work-history" | "self-archive" | "setting",
  ) => {
    setActiveDrawer((prev) => (prev === drawer ? null : drawer));
  };

  const handleNotificationOpenChange = (open: boolean) => {
    setNotificationOpen(open);
    onToggleNotification?.(open);
  };

  return (
    <div className="relative inline-flex h-full">
      <div
        className={cn(
          "dark flex h-full flex-col gap-[var(--gb-spacing-2-5)] overflow-hidden",
          "bg-[var(--gb-background-subtlest)] px-[var(--gb-spacing-2)] py-[var(--gb-spacing-5)]",
          "transition-[width] duration-200 ease-linear",
          expanded
            ? // Figma 확정값 250px
              "w-[250px] items-start"
            : "w-[48px] items-center",
          className,
        )}
      >
        <div className="flex w-full items-center gap-[var(--gb-spacing-3)] overflow-hidden">
          <MenuButton
            type="icon"
            icon={expanded ? PanelLeftCloseIcon : PanelLeftOpenIcon}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            onClick={() => onExpandedChange?.(!expanded)}
            className="shrink-0"
          />
          <img
            src="/images/logo.png"
            alt="Gabrielle"
            aria-hidden={expanded ? undefined : "true"}
            className={cn(
              "h-[13.151px] w-auto shrink-0",
              "transition-opacity duration-150 ease-out",
              expanded ? "opacity-100" : "opacity-0",
            )}
          />
        </div>

        <PopoverPrimitive.Root
          open={notificationOpen}
          onOpenChange={handleNotificationOpenChange}
        >
          <PopoverPrimitive.Trigger asChild>
            <MenuButton
              type={menuType}
              icon={unreadCount > 0 ? DotBellIcon : Bell}
              label="Notification"
              status={notificationOpen ? "active" : "default"}
              aria-label={expanded ? undefined : "Notification"}
              className="w-full"
            />
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              side="bottom"
              align="start"
              sideOffset={8}
              className="z-50"
            >
              <NotiDropdown
                items={notificationItems}
                onSettingsClick={handleNotificationSettingsClick}
                onItemClick={handleNotificationSettingsClick}
              />
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>

        <MenuButton
          type={menuType}
          icon={SettingsIcon}
          label="Settings"
          status={activeDrawer === "setting" ? "active" : "default"}
          aria-label={expanded ? undefined : "Settings"}
          onClick={() => {
            if (activeDrawer !== "setting") setActiveSettingSection(null);
            toggleDrawer("setting");
            onSettingsClick?.();
          }}
          className="w-full"
        />

        <div role="separator" className="h-[8px] w-full">
          <div className="mt-[4px] h-[length:var(--gb-border-1)] w-full bg-[var(--gb-border-default)]" />
        </div>

        <nav
          aria-label="Main"
          className="flex w-full flex-1 flex-col gap-[var(--gb-spacing-2-5)] overflow-y-auto"
        >
          {items.map((item) => {
            const isDisabled = disabledIds.includes(item.id);
            // Setting이 열려있는 동안은 끔 (docs/components/gnb.md 참고)
            const isActive =
              !isDisabled && item.id === activeId && activeDrawer !== "setting";

            return (
              <MenuButton
                key={item.id}
                type={menuType}
                icon={item.icon}
                label={item.label}
                aria-label={expanded ? undefined : item.label}
                status={
                  isDisabled ? "disabled" : isActive ? "active" : "default"
                }
                onClick={() => {
                  if (activeDrawer === "setting") setActiveDrawer(null);
                  onItemSelect?.(item.id);
                }}
                className="w-full"
              />
            );
          })}
        </nav>
      </div>

      {/* Work History/Self Archive 트리거 (docs/components/gnb.md 참고) */}
      {activeDrawer !== "setting" && (
        <Toggle
          type="icon"
          selectionMode="multiple"
          className="absolute top-[20px] z-20 transition-[left] duration-200 ease-linear"
          style={{
            left: `${toggleLeft}px`,
            transform: `translateX(${toggleDrawerOffset}px)`,
          }}
          items={[
            {
              icon: <History aria-hidden="true" className="size-full" />,
              "aria-label": "Work history",
              pressed: activeDrawer === "work-history",
              onPressedChange: () => toggleDrawer("work-history"),
            },
            {
              icon: <Archive aria-hidden="true" className="size-full" />,
              "aria-label": "Self archive",
              pressed: activeDrawer === "self-archive",
              onPressedChange: () => toggleDrawer("self-archive"),
            },
          ]}
        />
      )}

      {/* Work History/Self Archive/Setting 패널 (docs/components/gnb.md 참고) */}
      {activeDrawer === "setting" ? (
        <GnbSettingPanel
          activeSection={activeSettingSection}
          searchValue={settingSearchValue}
          defaultSearchValue={defaultSettingSearchValue}
          onSearchChange={onSettingSearchChange}
          onSectionSelect={handleSettingSectionSelect}
        />
      ) : activeDrawer ? (
        <GnbHistoryPanel
          title={
            activeDrawer === "work-history" ? "Work History" : "Self Archive"
          }
          items={
            activeDrawer === "work-history"
              ? workHistoryItems
              : selfArchiveItems
          }
          onClose={() => setActiveDrawer(null)}
        />
      ) : null}
    </div>
  );
}
