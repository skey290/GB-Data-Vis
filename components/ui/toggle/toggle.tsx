import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

// on/off 슬라이더인 Switch와 달리, 아이콘 눌림 버튼을 여러 개 묶는 세그먼트 그룹입니다.
const toggleItemVariants = cva(
  cn(
    "inline-flex shrink-0 items-center justify-center",
    // 34px: 토큰 스케일(32px/36px)에 정확히 일치하는 값이 없어 예외적으로 하드코딩 (Figma 스펙 확정값)
    // 높이(36px)는 컴포넌트 자체 치수라 간격 전용인 --spacing-*가 아닌 범용 숫자 풀 --scale-*를 참조
    "h-[calc(var(--scale-36)*1px)] w-[34px]",
    "outline-none transition-colors",
    "focus-visible:z-10 focus-visible:shadow-[var(--shadow-focus-ring)]",
    // Figma에는 hover 상태가 없어 배경/색 변화는 없고 커서만 바뀝니다.
    "cursor-pointer disabled:cursor-not-allowed",
  ),
  {
    variants: {
      pressed: {
        true: "bg-[var(--background-mute-subtle)] text-[var(--icon-static-white)]",
        false: "bg-background text-[var(--icon-default)]",
      },
      disabled: {
        true: "bg-[var(--background-disabled)] text-[var(--text-subtler)]",
        false: "",
      },
    },
    defaultVariants: {
      pressed: false,
      disabled: false,
    },
  },
);

export interface ToggleItem {
  /** 버튼 안에 렌더링할 아이콘 (필수) */
  icon: React.ReactNode;
  /** 눌림 상태 (Figma `Status=pressed`) */
  pressed?: boolean;
  /** 눌림 상태가 바뀔 때 호출됩니다 */
  onPressedChange?: (pressed: boolean) => void;
  /** 아이콘만 있는 버튼이라 접근성 라벨이 필수입니다 */
  "aria-label": string;
  /**
   * `orientation="vertical"`일 때만 버튼 우측에 표시되는 보조 라벨.
   * horizontal/grid에서는 무시됩니다.
   */
  label?: string;
}

export interface ToggleProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** 세그먼트 그룹에 표시할 아이템 목록 */
  items: ToggleItem[];
  /**
   * 세그먼트 배치 방향 (Figma `Type` variant: Horizontal/Vertical/Rectangular).
   * - `horizontal`: 1행 가로 배치
   * - `vertical`: 1열 세로 배치 (라벨 지원)
   * - `grid`: 2열 그리드 배치 (Figma `Type=Rectangular`)
   */
  orientation?: "horizontal" | "vertical" | "grid";
  /** 그룹 전체를 비활성화합니다. 개별 아이템 단위 비활성화는 지원하지 않습니다. */
  disabled?: boolean;
}

function ToggleButton({
  item,
  disabled,
  className,
}: {
  item: ToggleItem;
  disabled: boolean;
  /** vertical 배치에서 첫/마지막 행의 컨테이너 라운딩을 아이콘 칩 배경에도 맞추기 위한 클래스 */
  className?: string;
}) {
  const pressed = item.pressed ?? false;
  const { icon, onPressedChange, label, ...rest } = item;
  const ariaLabel = rest["aria-label"];

  const handleClick = () => {
    onPressedChange?.(!pressed);
  };

  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={ariaLabel}
      onClick={handleClick}
      disabled={disabled}
      className={cn(toggleItemVariants({ pressed, disabled }), className)}
    >
      <span
        aria-hidden="true"
        data-slot="toggle-icon"
        className="inline-flex size-[calc(var(--scale-16)*1px)] items-center justify-center"
      >
        {icon}
      </span>
    </button>
  );
}

function RowDivider() {
  return (
    <span
      aria-hidden="true"
      data-slot="toggle-divider"
      className="h-[length:var(--border-1)] w-full shrink-0 bg-[var(--border-default)]"
    />
  );
}

function ColumnDivider() {
  return (
    <span
      aria-hidden="true"
      data-slot="toggle-divider"
      className="w-[length:var(--border-1)] shrink-0 self-stretch bg-[var(--border-default)]"
    />
  );
}

const containerBaseClassName = cn(
  "inline-flex",
  "rounded-[var(--radius-scale-lg)]",
  "border-[length:var(--border-1)] border-[var(--border-default)] border-solid",
  "shadow-[var(--shadow-xs)]",
);

export function Toggle({
  items,
  orientation = "horizontal",
  disabled = false,
  className,
  ...props
}: ToggleProps) {
  const isVertical = orientation === "vertical";
  const isGrid = orientation === "grid";

  if (isGrid) {
    const rows: ToggleItem[][] = [];
    for (let i = 0; i < items.length; i += 2) {
      rows.push(items.slice(i, i + 2));
    }

    return (
      <div
        role="group"
        className={cn(
          containerBaseClassName,
          "flex-col overflow-clip",
          className,
        )}
        {...props}
      >
        {rows.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {rowIndex > 0 && <RowDivider />}
            <div className="inline-flex flex-row">
              {row.map((item, colIndex) => (
                <React.Fragment key={item["aria-label"] + colIndex}>
                  {colIndex > 0 && <ColumnDivider />}
                  <ToggleButton item={item} disabled={disabled} />
                </React.Fragment>
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  }

  // vertical: Figma 원본에서 보더 박스는 아이콘 칩(34px) 열에만 고정되고,
  // 라벨은 그 박스의 `absolute` 자식이라 flex 너비 계산에 전혀 관여하지
  // 않습니다(라벨이 아무리 길어도 박스가 늘어나지 않음). 각 행을 `relative`
  // 컨테이너로 두고 라벨을 `absolute left-full`로 박스 바깥에 배치하면,
  // flex-col 너비는 오직 ToggleButton(34px)만으로 결정되어 동일하게 재현됩니다.
  // (라벨을 `overflow-clip`으로 가둘 수 없는 것도 이 때문 — 원래도 박스 밖.)
  //
  // `w-fit` 필수: 이 컴포넌트를 `align-items: stretch`가 기본인 flex-col 부모
  // (예: Compass 페이지의 툴바+서브메뉴 세로 스택) 안에 두면, 컨테이너의
  // width:auto가 형제 요소(예: 더 넓은 토글 필) 폭에 맞춰 강제로 늘어나
  // `left-full` 기준점 자체가 밀려나 라벨이 아이콘에서 한참 떨어져 보이는
  // 버그가 있었다(사용자 확인, 2026-09-29). `w-fit`으로 명시적 폭을 줘서
  // 부모의 stretch를 무시하고 항상 콘텐츠(아이콘 칩) 폭에만 맞도록 고정한다.
  if (isVertical) {
    return (
      <div
        role="group"
        className={cn(containerBaseClassName, "w-fit flex-col", className)}
        {...props}
      >
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          return (
            <div
              key={item["aria-label"] + index}
              className={cn(
                "relative",
                !isLast &&
                  "border-b-[length:var(--border-1)] border-b-[var(--border-default)] border-solid",
              )}
            >
              <ToggleButton
                item={item}
                disabled={disabled}
                className={cn(
                  // Figma 실측(node 7214:453 Vertical/4/Default, 7214:490 Vertical/4/Disabled):
                  // 컨테이너 라운딩(--radius-scale-lg)과 맞춰 첫/마지막 아이콘 칩 배경도
                  // 같은 값으로 라운딩됨 — 중간 행은 라운딩 없음. 이 div가 아닌
                  // ToggleButton(실제 배경이 그려지는 요소)에 직접 줘야 시각적으로 반영된다.
                  isFirst && "rounded-t-[var(--radius-scale-lg)]",
                  isLast && "rounded-b-[var(--radius-scale-lg)]",
                )}
              />
              {item.label && (
                <span
                  data-slot="toggle-label"
                  className="absolute left-full top-1/2 ml-[var(--spacing-2)] -translate-y-1/2 whitespace-nowrap text-xs-medium text-[var(--text-subtle)]"
                >
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="group"
      className={cn(
        containerBaseClassName,
        "flex-row overflow-clip",
        className,
      )}
      {...props}
    >
      {items.map((item, index) => (
        <React.Fragment key={item["aria-label"] + index}>
          {index > 0 && <ColumnDivider />}
          <ToggleButton item={item} disabled={disabled} />
        </React.Fragment>
      ))}
    </div>
  );
}
