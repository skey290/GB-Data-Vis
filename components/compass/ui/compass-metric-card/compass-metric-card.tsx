import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Figma "Detail view"(❄️ GB_Compass, C34HOpbSASmThFA1iYFm8D) node-id 8003:12444
 * 안에서 "Growth Potential" / "Qualified Reach" / "Engagement Intensity" 3개
 * 섹션이 완전히 동일하게 반복하는 틀(셸)만 뽑아낸 컴포넌트. 6개 `type` variant
 * (default/BLS/niche data/no experience/trend data/error)를 직접 조회한 결과,
 * 세 섹션 모두 "제목+뱃지 헤더 → (옵션)설명 문단 → 콘텐츠 슬롯 → (옵션)하단 링크"
 * 구조를 그대로 공유하고, 바뀌는 건 콘텐츠 슬롯 내부(퍼센트 히어로 vs 포스트
 * 통계 vs 빈 상태)뿐이라 그 부분만 `children`으로 상위(`CompassDetailView`)에서
 * 주입받는다(컴파스 전용 하위 컴포넌트 분리 패턴은 `compass-dial-tick.tsx`와 동일).
 *
 * `state` → Figma 축 매핑:
 * - `default`(border 없음): type=default/BLS/trend data
 * - `warning`(`--border-warning` 1px 보더 추가): type=niche data/no experience
 *   (Figma 실측 — 직관과 달리 "완전히 텅 빈" 상태가 아니라 이 두 타입에서만
 *   경고 보더가 붙는다. Growth Potential 카드에서만 쓰이는 축이고 Qualified
 *   Reach/Engagement Intensity 카드는 이 두 타입에서도 항상 `default`)
 * - `error`: 하단 "Update in Know thyself" 링크만 숨긴다. ⚠️ 설명 문단은
 *   `state`와 무관하게 `description` prop 유무로만 결정된다 — Figma 실측
 *   결과 Qualified Reach/Engagement Intensity 카드는 `error`에서도 설명 문단이
 *   그대로 남아있고(호출부에서 계속 전달), Growth Potential 카드만 `error`에서
 *   호출부가 `description`을 아예 넘기지 않아(제목 자리를 대신 차지) 사라진다.
 */

export type CompassMetricCardState = "default" | "warning" | "error";

export interface CompassMetricCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** 카드 제목 (예: "Growth Potential") */
  title: string;
  /** 헤더 우측 pill 뱃지 텍스트 (예: "Become Recommended") */
  badgeLabel: string;
  /** 설명 문단. `state`와 무관하게 이 값이 있을 때만 렌더링(위 doc 주석 참고) */
  description?: string;
  /** Figma `type` 축이 결정하는 셸 스타일. 기본 "default" */
  state?: CompassMetricCardState;
  /** 하단 링크 텍스트. 기본 "Update in Know thyself" */
  footerLinkLabel?: string;
  /** 하단 링크 클릭 핸들러. `state="error"`에서는 링크 자체를 렌더링하지 않음 */
  onFooterLinkClick?: () => void;
  /** 콘텐츠 슬롯 (퍼센트 히어로/포스트 통계/빈 상태/에러 안내 등, 카드마다 다름) */
  children: React.ReactNode;
}

export function CompassMetricCard({
  title,
  badgeLabel,
  description,
  state = "default",
  footerLinkLabel = "Update in Know thyself",
  onFooterLinkClick,
  children,
  className,
  ...props
}: CompassMetricCardProps) {
  const isError = state === "error";

  return (
    <div
      className={cn(
        "flex w-full flex-col items-start gap-[var(--spacing-5)]",
        "rounded-[var(--radius-scale-2xl)] bg-[var(--background-surface-secondary)]",
        "px-[var(--spacing-7)] py-[var(--spacing-8)] shadow-[var(--shadow-sm)]",
        state === "warning" &&
          "border-[length:var(--border-1)] border-[var(--border-warning)] border-solid",
        className,
      )}
      {...props}
    >
      <div className="flex w-full flex-col items-start gap-[var(--spacing-2)]">
        <div className="flex w-full items-center justify-between">
          <p className="text-xl-bold text-[var(--text-default)]">{title}</p>
          <Badge variant="outline" size="20">
            {badgeLabel}
          </Badge>
        </div>
        {description && (
          <p className="text-sm-medium w-full whitespace-pre-line text-[var(--text-subtle)]">
            {description}
          </p>
        )}
      </div>

      {children}

      {!isError && (
        // Figma 좌표 실측(2026-09-28 버그 수정, node 8003:12465 vs 부모 8003:12449):
        // 버튼 인스턴스 x=404·width=156 → 우측 끝 560px == 카드 콘텐츠 영역
        // 우측 끝(padding 28px 제외 시 28+532=560)과 정확히 일치 — 가운데 정렬이
        // 아니라 우측 정렬이었다. `items-center`를 `items-end`로 수정.
        <div className="flex h-[20px] w-full flex-col items-end justify-center rounded-[var(--radius-scale-lg)]">
          {/*
            Figma 실측(node 8003:12465): 이 링크의 기본(비호버) 색은 Button의
            link variant 기본값(`--text-bold`)이 아니라 `--text-subtle`이다
            (get_variable_defs로 확인). 단, Figma는 정적 목업이라 이 오버라이드
            인스턴스의 hover 색까지는 노출하지 않는다 — Design System의 Button
            컴포넌트(node 73:3681, G9YNa2vjdqDjnML9y5hXJ4)에도 link 타입엔
            default/active(hover)/disabled 3개 상태만 있고 "옅은 기본값" 변형은
            없어 이 인스턴스는 컴포넌트 스펙을 벗어난 수동 오버라이드로 보인다.
            2026-09-28 버그 수정: 기본색만 오버라이드하고 hover는 그대로 둬서
            기본=호버=text-subtle로 같아져 버튼이 안 눌리는 것처럼 보이는
            버그가 있었다 — hover는 Figma에 근거가 없어 이 프로젝트의 기존
            컨벤션(Tabs 비선택 탭: subtle → hover 시 emphasis, tabs.tsx 참고)을
            그대로 따라 `hover:text-[var(--text-emphasis)]`로 보강함.
          */}
          <Button
            variant="link"
            onClick={onFooterLinkClick}
            className="text-[var(--text-subtle)] hover:text-[var(--text-emphasis)]"
          >
            {footerLinkLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
