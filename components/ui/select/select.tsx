"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  /** "country-number" 타입 전용: 국가 코드 (예: "+82") */
  code?: string;
}

export interface SelectProps {
  /** Figma `Type` variant 5종 — 항목 레이아웃/트리거 스타일을 결정 */
  type: "country-number" | "social-media" | "mbti" | "self" | "frequency";
  /**
   * Figma `Style` variant — type에 따라 의미가 다름.
   * - `self`: "primary"(기본, 투명 배경) | "reverse"(항상 `--background-bold` 배경) | "mute"(`--background-surface-secondary` 배경)
   * - `social-media`: "primary"(기본, 값 표시) | "icon"("+" 아이콘 전용 트리거, 값 표시 없음, filled 상태 없음)
   * - 그 외 type은 무시됨(항상 단일 스타일)
   */
  style?: "primary" | "reverse" | "mute" | "icon";
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

// Figma 확정값: MBTI만 150px, 나머지 타입(country-number/social-media/self/frequency)은
// 210px — 토큰 스케일에 없는 값이라 예외적으로 하드코딩
const DROPDOWN_WIDTH_CLASS: Record<SelectProps["type"], string> = {
  "country-number": "w-[210px]",
  "social-media": "w-[210px]",
  mbti: "w-[150px]",
  self: "w-[210px]",
  frequency: "w-[210px]",
};

// 리스트와 스크롤바 트랙이 공유하는 Figma 확정 높이값: 항목 h-8(32px) x 6 + gap-1(4px) x 5 + padding-1(4px) x 2 ≈ 220px
// (max-h/h 유틸이 달라 Tailwind 정적 추출을 위해 리터럴을 각각 따로 둠 — 값 변경 시 둘 다 함께 수정할 것)
const LIST_MAX_HEIGHT_CLASS =
  "max-h-[calc((var(--spacing-8)*6)+(var(--spacing-1)*5)+(var(--spacing-1)*2))]";
const SCROLLBAR_TRACK_HEIGHT_CLASS =
  "h-[calc((var(--spacing-8)*6)+(var(--spacing-1)*5)+(var(--spacing-1)*2))]";

export function Select({
  type,
  style,
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  disabled,
  error,
  className,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  // Figma 스크롤바(node 4740:1311)의 트랙 대비 썸 비율/위치 — 실제 스크롤 위치에 연동해서 계산
  const [thumb, setThumb] = React.useState({ top: 0, height: 100 });
  const generatedId = React.useId();
  const listRef = React.useRef<HTMLUListElement>(null);
  // Figma 목업(node 3657:8753)은 16개 옵션 중 6개만 보이는 고정 높이 드롭다운 +
  // 하단 셰브론 힌트로 디자인되어 있음 — 6개 이하면 스크롤할 내용이 없어 숨김
  const isScrollable = options.length > 6;

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

  // Radix Popover는 Portal + Presence로 렌더링되어, `open`이 true가 되는 렌더와
  // <ul>가 실제 DOM에 마운트되는 시점이 같은 커밋이 아닐 수 있음 — `open`만
  // 의존하는 useLayoutEffect는 그 시점에 listRef.current가 null이라 계산을
  // 건너뛰고, 초기값(height:100, 꽉 찬 썸)이 남아 있다가 첫 스크롤에서야
  // 실제 크기로 "줄어드는" 것처럼 보였다. 콜백 ref로 노드가 실제로 붙는
  // 순간(매번 재오픈될 때마다)에 맞춰 계산하도록 변경.
  const listCallbackRef = React.useCallback(
    (node: HTMLUListElement | null) => {
      listRef.current = node;
      if (node) updateThumb();
    },
    [updateThumb],
  );

  const handleScrollNext = () => {
    listRef.current?.scrollBy({
      top: listRef.current.clientHeight,
      behavior: "smooth",
    });
  };

  const selectedOption = options.find((option) => option.value === value);
  const isSelf = type === "self";
  const isCountryNumber = type === "country-number";
  const isSocialMediaIcon = type === "social-media" && style === "icon";
  const selfStyle = isSelf ? (style ?? "primary") : undefined;
  const isSelfReverse = selfStyle === "reverse";
  const isSelfMute = selfStyle === "mute";

  const triggerLabel = isCountryNumber
    ? (selectedOption?.code ?? selectedOption?.label ?? placeholder)
    : (selectedOption?.label ?? placeholder);

  const listboxId = `${generatedId}-listbox`;
  const getOptionId = (optionValue: string) =>
    `${generatedId}-option-${optionValue}`;

  const handleOpenChange = (nextOpen: boolean) => {
    if (disabled) return;
    setOpen(nextOpen);
    if (nextOpen) {
      const selectedIndex = options.findIndex(
        (option) => option.value === value,
      );
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  };

  const commitSelection = (option: SelectOption) => {
    onValueChange?.(option.value);
    setOpen(false);
  };

  const handleTriggerKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (disabled || open) return;
    // Enter/Space는 <button>의 기본 클릭 동작으로 이미 팝오버가 열리므로 화살표 키만 처리
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      handleOpenChange(true);
    }
  };

  const handleContentKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Escape/바깥 클릭 닫힘은 Radix Popover가 기본 제공하므로 별도 처리하지 않음
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = options[highlightedIndex];
      if (option) commitSelection(option);
    }
  };

  // Figma 확정값(node 3763:11408 등): Style=icon을 제외한 모든 Type/Style은
  // 배경/보더가 서로 다르지만, "선택 전(text-subtle) → 선택 후(text-default)"
  // 텍스트 색 규칙은 self/reverse를 제외하고 전부 동일
  const surfaceClass = isSocialMediaIcon
    ? "bg-[var(--background-default)] border-[var(--border-default)]"
    : isSelfReverse
      ? "bg-[var(--background-bold)] border-transparent"
      : isSelfMute
        ? "bg-[var(--background-surface-secondary)] border-transparent"
        : isSelf
          ? "bg-transparent border-transparent"
          : "bg-[var(--background-default)] border-[var(--border-default)]";

  const textColorClass = isSocialMediaIcon
    ? "text-[var(--icon-default)]"
    : isSelfReverse
      ? selectedOption
        ? "text-[var(--text-invert)]"
        : "text-[var(--text-selected)]"
      : selectedOption
        ? "text-[var(--text-default)]"
        : "text-[var(--text-subtle)]";

  // Figma 확정값: 팝오버가 열려있는 동안(pressed)에는 hover와 달리 배경을 채우지 않고
  // 보더+포커스링 쉐도우만 추가되며, 텍스트는 선택 여부와 무관하게 "값이 있는 것처럼"
  // 고정 색(self/reverse는 text-invert, 그 외는 text-default)으로 강제된다.
  const openTextColorClass = isSocialMediaIcon
    ? ""
    : isSelfReverse
      ? "data-[state=open]:text-[var(--text-invert)]"
      : "data-[state=open]:text-[var(--text-default)]";

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          disabled={disabled}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            "inline-flex w-fit shrink-0 items-center justify-center",
            "rounded-[var(--radius-scale-md)]",
            "border-[length:var(--border-1)] border-solid",
            "outline-none transition-colors",
            isSocialMediaIcon
              ? "size-[var(--spacing-9)]"
              : "justify-between gap-[var(--spacing-2)] h-[var(--spacing-9)] px-[var(--spacing-3)]",
            disabled ? "text-sm-regular" : "text-sm-medium",
            // Figma(node 4792:1344): disabled는 타입별 배경/보더를 유지한 채 흐리는 게 아니라,
            // 타입 무관 단일 디자인(background-disabled, border-overlay, text-static-gray)으로 완전히 대체됨
            disabled
              ? cn(
                  "cursor-not-allowed",
                  "bg-[var(--background-disabled)] border-[var(--border-overlay)]",
                  isSocialMediaIcon
                    ? "text-[var(--icon-static-gray)]"
                    : "text-[var(--text-static-gray)]",
                )
              : cn(
                  surfaceClass,
                  textColorClass,
                  error ? "border-[var(--border-error)]" : null,
                  // Figma 확정값: hover는 타입/스타일 무관 공통으로 배경 전체를 static-gray로
                  // 채우고 텍스트/아이콘을 static-white로 뒤집으며, 포커스링 쉐도우가 함께 붙는다.
                  "hover:bg-[var(--background-static-gray)] hover:border-[var(--border-static-gray)]",
                  "hover:text-[var(--text-static-white)] hover:shadow-[var(--shadow-focus-ring)]",
                  // 팝오버가 열린 동안(pressed)에는 배경은 그대로 두고 보더+쉐도우만 추가
                  "data-[state=open]:border-[var(--border-static-gray)]",
                  "data-[state=open]:shadow-[var(--shadow-focus-ring)]",
                  openTextColorClass,
                ),
            className,
          )}
        >
          {isSocialMediaIcon ? (
            <svg
              aria-hidden="true"
              className="size-[var(--spacing-4)] shrink-0"
            >
              <use href="/icons.svg#plus-icon" />
            </svg>
          ) : (
            <>
              <span className="truncate">{triggerLabel}</span>
              {open ? (
                <svg
                  aria-hidden="true"
                  className="size-[var(--spacing-4)] shrink-0"
                >
                  <use href="/icons.svg#chevron-up-icon" />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  className="size-[var(--spacing-4)] shrink-0"
                >
                  <use href="/icons.svg#chevron-down-icon" />
                </svg>
              )}
            </>
          )}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          onKeyDown={handleContentKeyDown}
          className={cn(
            "z-50 overflow-hidden",
            "rounded-[var(--radius-scale-md)]",
            "border-[length:var(--border-1)] border-[var(--border-default)] border-solid",
            "bg-[var(--background-surface)] text-[var(--text-default)]",
            // Figma의 그림자값(0 4px 3px + 0 2px 2px, rgba(0,0,0,0.1))과 정확히 일치하는 토큰이 없어 --shadow-lg로 근사
            "shadow-[var(--shadow-lg)]",
            DROPDOWN_WIDTH_CLASS[type],
          )}
        >
          <div className="flex items-stretch">
            <ul
              ref={listCallbackRef}
              id={listboxId}
              role="listbox"
              tabIndex={-1}
              onScroll={updateThumb}
              aria-activedescendant={
                highlightedIndex >= 0
                  ? getOptionId(options[highlightedIndex]?.value ?? "")
                  : undefined
              }
              className={cn(
                "flex flex-1 flex-col items-start gap-[var(--spacing-1)] overflow-y-auto p-[var(--spacing-1)]",
                // 커스텀 스크롤바(트랙/썸)를 별도로 그리므로 브라우저 기본 스크롤바는 숨김
                "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                LIST_MAX_HEIGHT_CLASS,
              )}
            >
              {options.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = highlightedIndex === index;

                return (
                  <li
                    key={option.value}
                    id={getOptionId(option.value)}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => commitSelection(option)}
                    className={cn(
                      "flex w-full shrink-0 cursor-pointer items-center",
                      "gap-[var(--spacing-1)]",
                      "h-[var(--spacing-8)] px-[var(--spacing-2)]",
                      "rounded-[var(--radius-scale-sm)]",
                      "text-sm-regular",
                      isSelected || isHighlighted
                        ? "bg-[var(--background-static-gray)] text-[var(--text-static-white)]"
                        : cn(
                            "text-[var(--text-default)]",
                            "hover:bg-[var(--background-static-gray)] hover:text-[var(--text-static-white)]",
                          ),
                    )}
                  >
                    {isCountryNumber ? (
                      <>
                        {/* Figma 확정값: 코드 컬럼 고정폭 50px. 컴포넌트 자체 치수라 간격 전용인 --spacing-*가 아닌 범용 숫자 풀 --scale-*를 참조 */}
                        <span className="w-[calc(var(--scale-50)*1px)] shrink-0">
                          {option.code}
                        </span>
                        <span className="min-w-0 flex-1 truncate">
                          {option.label}
                        </span>
                      </>
                    ) : (
                      <span className="min-w-0 flex-1 truncate">
                        {option.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            {/* Figma 스크롤바(node 4740:1311): 트랙 --background-subtler, 썸 --background-subtle, 폭 10px, 모두 rounded-full */}
            {isScrollable && (
              <div
                aria-hidden="true"
                className="shrink-0 py-[var(--spacing-1)] pr-[var(--spacing-1)]"
              >
                <div
                  className={cn(
                    "relative w-[calc(var(--scale-10)*1px)] rounded-[var(--radius-scale-full)] bg-[var(--background-subtler)]",
                    SCROLLBAR_TRACK_HEIGHT_CLASS,
                  )}
                >
                  <div
                    className="absolute inset-x-0 rounded-[var(--radius-scale-full)] bg-[var(--background-subtle)]"
                    style={{ top: `${thumb.top}%`, height: `${thumb.height}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          {/* Figma 확정값: 옵션이 6개 초과일 때만 노출되는 "다음 페이지 스크롤" 버튼 */}
          {isScrollable && (
            <button
              type="button"
              aria-label="Show more options"
              onClick={handleScrollNext}
              className="flex h-[var(--spacing-7)] w-full items-center justify-center outline-none"
            >
              <svg
                aria-hidden="true"
                className="size-[var(--spacing-4)] text-muted-foreground"
              >
                <use href="/icons.svg#chevron-down-icon" />
              </svg>
            </button>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
