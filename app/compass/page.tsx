"use client";

import * as React from "react";
import { Blocks, Home, UserSearch } from "lucide-react";

import { cn } from "@/lib/utils";
import { createSpriteIcon } from "@/lib/sprite-icon";
import { Gnb, type GnbItem } from "@/components/ui/gnb";
import { FloatingProfile } from "@/components/ui/floating-profile";
import { CompassToolbar } from "@/components/compass/ui/compass-toolbar";
import {
  CompassFloatingNav,
  type CompassFloatingNavItemId,
} from "@/components/compass/ui/compass-floating-nav";
import { CompassSphere } from "@/components/compass/ui/compass-sphere";
import { CompassDetailView } from "@/components/compass/ui/compass-detail-view";
import {
  CompassAnalysis,
  type CompassAnalysisSelf,
} from "@/components/compass/ui/compass-analysis";
import {
  CompassAnalysisMenu,
  type CompassAnalysisMenuValue,
} from "@/components/compass/ui/compass-analysis-menu";
import type { CompassDialType } from "@/components/compass/ui/compass-dial";
import type { CompassSelfClusterVariant } from "@/components/compass/ui/compass-self-cluster";

// Figma GNB 노드(616:3399)와 동일 — Assets/Compass는 커스텀 스프라이트,
// 나머지는 lucide 표준 아이콘 (components/ui/gnb/gnb.stories.tsx와 동일 소스).
const AssetIcon = createSpriteIcon("asset-icon");
const CompassIcon = createSpriteIcon("compass-icon");

const GNB_ITEMS: GnbItem[] = [
  { id: "dashboard", icon: Home, label: "Dashboard" },
  { id: "assets", icon: AssetIcon, label: "Assets" },
  { id: "compass", icon: CompassIcon, label: "Compass" },
  { id: "contents-studio", icon: Blocks, label: "Contents Studio" },
  { id: "know-thyself", icon: UserSearch, label: "Know Thyself" },
];

// 8개 셀프 플레이스홀더 — Figma 다이얼 캐릭터 variant에서 확인된 8개 페르소나 이름을
// 기존 /public/images/personas/*.jpg 자산(components/compass/ui/compass-self-avatar
// 스토리에서 이미 8장 전부 사용 중)에 매칭했습니다. "Data Scientist"는 프로젝트 전역
// 컨벤션상 기본 셀프 이름이라 self-default.jpg에 매핑합니다.
const SELF_OPTIONS = [
  { value: "self-default", label: "Data Scientist" },
  { value: "team-leader", label: "Office Worker" },
  { value: "entrepreneur", label: "Entrepreneur" },
  { value: "fashion-editor", label: "Fashion Editor" },
  { value: "fashionista", label: "Fashionista" },
  { value: "novelist", label: "English Novelist" },
  { value: "vegan-chef", label: "Vegan Chef" },
  { value: "yoga-meditator", label: "Yoga Meditator" },
];

const TOGGLE_OPTIONS = [
  { value: "home", label: "Home" },
  { value: "analysis", label: "Analysis" },
] as const;

/**
 * `components/compass/ui/compass-analysis/compass-analysis.stories.tsx`의
 * `DEMO_SELVES`와 동일한 수치(id/image/qualifiedReach/engagementIntensity/growth)를
 * 그대로 옮겼습니다 — 새 값을 발명하지 않고 이미 검증된 Figma mock 데이터를
 * 재사용(사용자 지시, 2026-09-29). 배열 순서(0번째=북쪽)도 그 스토리와 동일하게
 * 유지해 "북쪽=Data Scientist(현재 사용자 자신)" 관례를 그대로 따릅니다.
 */
const ANALYSIS_SELVES: CompassAnalysisSelf[] = [
  {
    id: "data-scientist",
    image: "/images/personas/self-default.jpg",
    imageAlt: "Data Scientist",
    qualifiedReach: 8340,
    engagementIntensity: 14.3,
    growth: 55,
  },
  {
    id: "yoga-meditator",
    image: "/images/personas/yoga-meditator.jpg",
    imageAlt: "Yoga Meditator",
    qualifiedReach: 6453,
    engagementIntensity: 1.8,
    growth: 20,
  },
  {
    id: "novelist",
    image: "/images/personas/novelist.jpg",
    imageAlt: "Novelist",
    qualifiedReach: 4784,
    engagementIntensity: 0.4,
    growth: 30,
  },
  {
    id: "entrepreneur",
    image: "/images/personas/entrepreneur.jpg",
    imageAlt: "Entrepreneur",
    qualifiedReach: 978,
    engagementIntensity: 2.0,
    growth: 45,
  },
  {
    id: "fashionista",
    image: "/images/personas/fashionista.jpg",
    imageAlt: "Fashionista",
    qualifiedReach: 6782,
    engagementIntensity: 0.3,
    growth: 10,
  },
  {
    id: "fashion-editor",
    image: "/images/personas/fashion-editor.jpg",
    imageAlt: "Fashion Editor",
    qualifiedReach: 125,
    engagementIntensity: 3.7,
    growth: 65,
  },
  {
    id: "team-leader",
    image: "/images/personas/team-leader.jpg",
    imageAlt: "Team Leader",
    qualifiedReach: 8006,
    engagementIntensity: 0.5,
    growth: 15,
  },
  {
    id: "vegan-chef",
    image: "/images/personas/vegan-chef.jpg",
    imageAlt: "Vegan Chef",
    qualifiedReach: 5431,
    engagementIntensity: 1.9,
    growth: 25,
  },
];

/**
 * Analysis 서브메뉴 4개 → `CompassAnalysis` props 매핑. Figma 실측(2026-09-28,
 * 이전 세션)으로 확정된 표를 그대로 옮겼습니다.
 */
const ANALYSIS_CONFIG: Record<
  CompassAnalysisMenuValue,
  {
    dial: boolean;
    type?: CompassDialType;
    clusterVariant: CompassSelfClusterVariant;
    label?: string;
  }
> = {
  "growth-potential": { dial: false, clusterVariant: "growth-potential" },
  reach: {
    dial: true,
    type: "reach",
    clusterVariant: "reach-or-engagement",
    label: "Most Reached Post",
  },
  engagement: {
    dial: true,
    type: "engagement",
    clusterVariant: "reach-or-engagement",
    label: "Most Engaged Post",
  },
  ranking: {
    dial: true,
    type: "reach-and-engagement",
    clusterVariant: "reach-or-engagement",
    label: "Ranking",
  },
};

/**
 * `CompassDetailView`는 자체 스크롤/높이 제어가 없어(컴포넌트는 Figma 프레임
 * 그대로 유지, 스크롤은 소비하는 쪽 책임), 여기서 감싸서 세로 스크롤을 주고
 * 커스텀 트랙/썸 스크롤바(Figma node 4740:1311 — `select`/`noti-dropdown`과
 * 동일 패턴, 네이티브 스크롤바는 숨김)를 붙입니다. 두 컴포넌트에 이미 같은
 * 구현이 각각 있어 더 이상 중복이지만, 셋을 하나로 묶는 공용 훅/컴포넌트 추출은
 * 이번 요청 범위 밖이라 하지 않습니다.
 */
function ScrollableDetailView() {
  const [thumb, setThumb] = React.useState({ top: 0, height: 100 });
  const [scrollable, setScrollable] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);

  const updateThumb = React.useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight) {
      setScrollable(false);
      setThumb({ top: 0, height: 100 });
      return;
    }
    setScrollable(true);
    const heightPercent = (clientHeight / scrollHeight) * 100;
    const topPercent =
      (scrollTop / (scrollHeight - clientHeight)) * (100 - heightPercent);
    setThumb({ top: topPercent, height: heightPercent });
  }, []);

  const listCallbackRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node;
      if (node) updateThumb();
    },
    [updateThumb],
  );

  React.useEffect(() => {
    window.addEventListener("resize", updateThumb);
    return () => window.removeEventListener("resize", updateThumb);
  }, [updateThumb]);

  return (
    <div className="flex h-full shrink-0">
      <div
        ref={listCallbackRef}
        onScroll={updateThumb}
        className="h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <CompassDetailView type="default" />
      </div>
      {scrollable && (
        <div
          aria-hidden="true"
          className="shrink-0 py-[var(--spacing-1)] pr-[var(--spacing-1)]"
        >
          <div className="relative h-full w-[calc(var(--scale-10)*1px)] rounded-[var(--radius-scale-full)] bg-[var(--background-subtler)]">
            <div
              className="absolute inset-x-0 rounded-[var(--radius-scale-full)] bg-[var(--background-subtle)]"
              style={{ top: `${thumb.top}%`, height: `${thumb.height}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompassPage() {
  const [gnbExpanded, setGnbExpanded] = React.useState(true);
  const [floatingNavActiveId, setFloatingNavActiveId] =
    React.useState<CompassFloatingNavItemId>("compass");
  const [toggleValue, setToggleValue] = React.useState<string>("home");
  const [selfValue, setSelfValue] = React.useState("self-default");
  const [analysisSubmenu, setAnalysisSubmenu] =
    React.useState<CompassAnalysisMenuValue>("growth-potential");

  // 코치마크 노출 여부는 실제 "포스팅 9개+7일 경과" 판정 로직 없이 단순
  // boolean으로만 제어합니다(사용자 지시, 2026-09-29) — X 버튼을 누르면 그
  // 서브메뉴의 코치마크만 꺼집니다. Ranking에는 Figma에 코치마크가 없습니다.
  const [showGrowthCoachmark, setShowGrowthCoachmark] = React.useState(true);
  const [showReachCoachmark, setShowReachCoachmark] = React.useState(true);
  const [showEngagementCoachmark, setShowEngagementCoachmark] =
    React.useState(true);

  const coachmark = React.useMemo(() => {
    if (analysisSubmenu === "growth-potential" && showGrowthCoachmark) {
      return {
        title: "Growth Potential: 80%",
        description: "Start posting to turn this potential into real reach.",
        onDismiss: () => setShowGrowthCoachmark(false),
      };
    }
    if (analysisSubmenu === "reach" && showReachCoachmark) {
      return {
        title: "Most Reached: 8,340",
        onDismiss: () => setShowReachCoachmark(false),
      };
    }
    if (analysisSubmenu === "engagement" && showEngagementCoachmark) {
      return {
        title: "Most Engaged: 14.3%",
        onDismiss: () => setShowEngagementCoachmark(false),
      };
    }
    return undefined;
  }, [
    analysisSubmenu,
    showGrowthCoachmark,
    showReachCoachmark,
    showEngagementCoachmark,
  ]);

  const isAnalysis = toggleValue === "analysis";
  const analysisConfig = ANALYSIS_CONFIG[analysisSubmenu];
  // Reach/Ranking(reach-and-engagement)만 outward 링을 그리고, 그 북쪽(슬롯0)
  // 라벨(코치마크가 붙는 자리 포함)은 캔버스 상단보다 최대
  // `OUTWARD_NORTH_LABEL_MAX_BLEED`(44px, components/compass/ui/compass-dial/
  // compass-dial-utils.ts)만큼 더 위로 튀어나온다 — Engagement(inward 전용)는
  // 이 문제가 없다. 기존 `pt`(=플로팅 필과 캔버스 상단 사이 spacing-4 여백)만으로는
  // 이 튀어나온 라벨이 플로팅 필 뒤에 완전히 가려지는 버그가 있어(실사용 확인,
  // 2026-09-29), outward 링이 있는 상태에서만 그만큼 `pt`를 추가로 확보한다.
  const hasOutwardRing =
    analysisConfig.type === "reach" ||
    analysisConfig.type === "reach-and-engagement";

  return (
    <div className="dark relative flex h-screen w-screen overflow-hidden bg-[var(--background-default)]">
      <Gnb
        expanded={gnbExpanded}
        onExpandedChange={setGnbExpanded}
        items={GNB_ITEMS}
        activeId="compass"
      />

      <div className="relative min-w-0 flex-1 overflow-hidden">
        {/* Figma 실측(2026-09-29): 점무늬 배경("dotted background")은 CompassSphere
            전용이 아니라 Home/Growth Potential/Reach/Engagement/Ranking 5개 상태
            전부에 공통으로 깔리는 페이지 레벨 레이어(node 8052:39896 하위 각 "Compass
            Page Component" 전부 동일 위치/크기의 dotted background를 가짐). 두 번
            그리지 않도록 여기 한 곳에서만 그리고 CompassSphere 자체 배경은 제거했다.
            뷰포트 크기의 기준 레이어로 항상 깔아두고, Analysis 스크롤 시 추가로
            드러나는 영역은 아래 스크롤 래퍼 안에서 같은 클래스를 한 번 더 그려
            자연스럽게 이어지게 한다. */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0",
            "bg-[var(--color-neutral-950)]",
            // 점 색상은 --border-mute-subtle(neutral-400, #a3a3a3)이 배경
            // neutral-950(#0a0a0a)과 대비가 너무 강해 점이 과하게 도드라져
            // 보였다(사용자 확인, 2026-09-29) — CompassSphere와 동일하게 이
            // 영역도 테마 무관 고정 다크 배경이라 semantic 토큰 대신 한 단계
            // 어두운 neutral-700 primitive로 낮췄다.
            "bg-[radial-gradient(circle,var(--color-neutral-700)_1px,transparent_1px)]",
            "bg-[length:var(--spacing-6)_var(--spacing-6)]",
          )}
        />

        {/* CompassSphere/CompassAnalysis는 컨테이너를 꽉 채우는 컴포넌트라, 토글/셀프
            select는 반드시 이 뒤(DOM 순서상 나중)에 와야 위에 보인다. Analysis 토글이
            켜지면 Home 전용 Sphere 대신 서브메뉴로 고른 CompassAnalysis variant를
            같은 자리에 겹쳐 그린다(사용자 확인, 2026-09-28).

            다이얼(800px 고정 캔버스)을 순수 `items-center`로만 중앙 정렬하면, 뷰포트
            높이가 낮을 때(실사용 확인, 2026-09-29 — 약 828px) 캔버스 상단이 위쪽
            `CompassFloatingNav`(top spacing-4 + 높이 53px) 영역까지 올라와 서로
            겹친다. Figma 목업(1920×1218)은 캔버스보다 훨씬 큰 고정 프레임이라
            자연스럽게 여백이 생겼을 뿐, 실측 스펙값은 아니다(순수 레이아웃 방어
            로직, 사용자 확인) — `[align-items:safe_center]`로 공간이 충분하면 기존과
            동일하게 정중앙 정렬되고, 부족해지면 위쪽 `pt`만큼의 최소 여백 아래로
            떨어지도록 방어한다.

            outward 링(Reach/Ranking) 상태에서 `pt`가 129px까지 늘어나면 뷰포트가
            좁을 때(실사용 확인, 2026-09-29 — 2560×929) 캔버스 하단이 이 컨테이너의
            `overflow-hidden`에 그대로 잘려 나갔다. 플로팅 필/토글(아래 두 블록)은
            이 스크롤 영역 밖(형제 요소, 바깥 컨테이너 기준 absolute)에 그대로 둬
            스크롤해도 고정되게 하고, 캔버스만 담는 이 레이어만 별도로
            `overflow-y-auto` 처리해 잘리는 대신 스크롤로 전체를 볼 수 있게 한다. */}
        {isAnalysis ? (
          <div className="absolute inset-0 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div
              className={cn(
                "flex min-h-full justify-center",
                "[align-items:safe_center]",
                "bg-[var(--color-neutral-950)]",
                "bg-[radial-gradient(circle,var(--color-neutral-700)_1px,transparent_1px)]",
                "bg-[length:var(--spacing-6)_var(--spacing-6)]",
                // outward 링(Reach/Ranking)의 북쪽 라벨 bleed(44px, 위 hasOutwardRing
                // 주석 참고)만큼 pt만 조건부로 늘린다. pb는 이 버그와 무관해 그대로 둔다.
                hasOutwardRing
                  ? "pt-[calc(var(--spacing-4)*2+53px+44px)]"
                  : "pt-[calc(var(--spacing-4)*2+53px)]",
                "pb-[calc(var(--spacing-4)*2+53px)]",
              )}
            >
              <CompassAnalysis
                dial={analysisConfig.dial}
                type={analysisConfig.type}
                clusterVariant={analysisConfig.clusterVariant}
                label={analysisConfig.label}
                selves={ANALYSIS_SELVES}
                coachmark={coachmark}
              />
            </div>
          </div>
        ) : (
          <CompassSphere className="absolute inset-0" />
        )}

        <div className="absolute top-[var(--spacing-4)] left-1/2 -translate-x-1/2">
          <CompassFloatingNav
            activeId={floatingNavActiveId}
            onItemSelect={setFloatingNavActiveId}
          />
        </div>

        <div className="absolute top-[var(--spacing-4)] left-[var(--spacing-4)] flex flex-col gap-[var(--spacing-3)]">
          <CompassToolbar
            toggleOptions={TOGGLE_OPTIONS}
            toggleValue={toggleValue}
            onToggleValueChange={setToggleValue}
            selectOptions={isAnalysis ? undefined : SELF_OPTIONS}
            selectValue={selfValue}
            onSelectValueChange={setSelfValue}
          />
          {isAnalysis && (
            <CompassAnalysisMenu
              value={analysisSubmenu}
              onValueChange={setAnalysisSubmenu}
            />
          )}
        </div>
      </div>

      <ScrollableDetailView />

      {/* 아바타 버블은 항상 이 자리(top-6/right-6)에 고정되어야 하므로(사용자 확인,
          2026-09-29), 여기서 스크롤 래퍼로 감싸지 않는다 — bio가 길어 카드가
          뷰포트보다 커질 때의 스크롤은 카드 자신의 책임으로
          `floating-profile.tsx` 내부에서 처리한다(아바타와 카드가 한 컴포넌트
          안에서 좌표적으로 결합돼 있어 페이지 레벨에서 분리할 수 없음). */}
      <div className="absolute top-[var(--spacing-6)] right-[var(--spacing-6)]">
        <FloatingProfile
          avatarSrc="/images/personas/self-default.jpg"
          title="Data Scientist"
          portraitSrc="/images/personas/self-default.jpg"
          timestamp="2026.03.24 19:24:06"
          tagline="4 years in finance, 3 in data science — forecasting Finance teams trust."
          bio="Four years in finance. Three in data science. She builds forecasting models with the accounting logic most data scientists skip — the reason Finance teams trust the output. Two freelance projects outside the office proved it holds up beyond a single team's walls. Not a title she chose, but one the work has already earned."
        />
      </div>
    </div>
  );
}
