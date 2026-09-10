import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DEFAULT_PERSONAS, PersonaRadialChart } from "./persona-radial-chart";

/** 값 밴드 path만 골라냅니다 (그리드/hit area 제외) */
function getBandPaths(container: HTMLElement, fillToken: string) {
  return Array.from(
    container.querySelectorAll<SVGPathElement>(
      `path[fill="var(${fillToken})"]`,
    ),
  );
}

const WHITE_BAND = "--color-rdx-white-4";
const BLACK_BAND = "--color-rdx-black-4";

/**
 * 배지 텍스트로 Badge 루트를 찾습니다. 텍스트는 페이드인용으로 한 겹 더 감싼
 * 안쪽 span에 들어있어 `getByText`가 그 span을 돌려줍니다.
 */
function badgeOf(text: string) {
  return screen.getByText(text).parentElement as HTMLElement;
}

/**
 * 셀프가 1등이 **아닌** 데이터.
 *
 * Figma 샘플은 Data Scientist가 3개 지표 모두 1등이라 "셀프 배지를 채운다"와
 * "1등 배지를 채운다"가 같은 결과를 냅니다. 둘을 구분하려면 셀프와 1등이 서로
 * 다른 데이터가 필요합니다.
 */
const SELF_IS_RUNNER_UP = [
  { id: "self", name: "Self", growth: 10, reach: 100, engagement: 1 },
  { id: "rival", name: "Rival", growth: 90, reach: 900, engagement: 9 },
];

describe("PersonaRadialChart", () => {
  describe("grid", () => {
    it("renders the four concentric circles at the Figma radii", () => {
      const { container } = render(<PersonaRadialChart />);

      const radii = Array.from(container.querySelectorAll("circle")).map(
        (circle) => circle.getAttribute("r"),
      );

      expect(radii).toEqual(["128", "160", "200", "250"]);
    });

    it("renders four diameter spokes, the first one vertical", () => {
      const { container } = render(<PersonaRadialChart />);

      const lines = Array.from(container.querySelectorAll("line"));
      // Figma 원본은 반직선 8개가 아니라 중심을 관통하는 지름선 4개입니다
      expect(lines).toHaveLength(4);

      expect(Number(lines[0].getAttribute("x1"))).toBeCloseTo(0, 3);
      expect(Number(lines[0].getAttribute("y1"))).toBeCloseTo(250, 3);
      expect(Number(lines[0].getAttribute("x2"))).toBeCloseTo(0, 3);
      expect(Number(lines[0].getAttribute("y2"))).toBeCloseTo(-250, 3);
    });

    it("uses the muted token for grid strokes", () => {
      const { container } = render(<PersonaRadialChart />);

      const circles = Array.from(container.querySelectorAll("circle"));
      expect(
        circles.every(
          (circle) => circle.getAttribute("stroke") === "var(--color-muted)",
        ),
      ).toBe(true);
    });
  });

  describe("value bands", () => {
    it("gives the ring's top performer all eight bands", () => {
      const { container } = render(
        <PersonaRadialChart
          posting={false}
          personas={[
            { id: "top", name: "Top", growth: 80, reach: 0, engagement: 0 },
            { id: "half", name: "Half", growth: 40, reach: 0, engagement: 0 },
          ]}
        />,
      );

      // posting=false 이므로 growth 링만: 1등 8칸 + 꼴등 1칸 = 9개 path
      expect(getBandPaths(container, WHITE_BAND)).toHaveLength(9);
    });

    it("ranks by order, so near-identical values still differ by one band", () => {
      const { container } = render(
        <PersonaRadialChart
          posting={false}
          personas={[
            { id: "a", name: "A", growth: 8340, reach: 0, engagement: 0 },
            { id: "b", name: "B", growth: 8006, reach: 0, engagement: 0 },
            { id: "c", name: "C", growth: 125, reach: 0, engagement: 0 },
          ]}
        />,
      );

      // 값 비율이었다면 8340과 8006이 둘 다 8칸으로 뭉개집니다.
      // 순위 기반이므로 3명은 8칸 / 5칸(중간) / 1칸으로 항상 구분됩니다
      expect(getBandPaths(container, WHITE_BAND)).toHaveLength(8 + 5 + 1);
    });

    it("spreads eight personas across all eight band counts", () => {
      const { container } = render(<PersonaRadialChart posting={false} />);

      // 기본 데이터의 growth는 80/70/60/40/30/30/20/10 — 30이 동점이라
      // 8,7,6,5,4,4,2,1 = 37개가 됩니다 (동점은 같은 칸, 다음 순위는 건너뜀)
      expect(getBandPaths(container, WHITE_BAND)).toHaveLength(37);
    });

    it("gives tied values the same band count", () => {
      const { container } = render(
        <PersonaRadialChart
          posting={false}
          personas={[
            { id: "a", name: "A", growth: 50, reach: 0, engagement: 0 },
            { id: "b", name: "B", growth: 50, reach: 0, engagement: 0 },
          ]}
        />,
      );

      // 동점이면 같은 순위 = 같은 칸 (8칸 + 8칸)
      expect(getBandPaths(container, WHITE_BAND)).toHaveLength(16);
    });

    it("renders no bands for a persona whose value is zero", () => {
      const { container } = render(
        <PersonaRadialChart
          posting={false}
          personas={[
            { id: "a", name: "A", growth: 80, reach: 0, engagement: 0 },
            { id: "zero", name: "Zero", growth: 0, reach: 0, engagement: 0 },
          ]}
        />,
      );

      expect(getBandPaths(container, WHITE_BAND)).toHaveLength(8);
    });

    it("dims non-hovered rings with black bands instead of opacity", () => {
      const { container } = render(
        <PersonaRadialChart
          hover="growth"
          personas={[
            { id: "solo", name: "Solo", growth: 80, reach: 100, engagement: 4 },
          ]}
        />,
      );

      // growth 링만 흰 밴드 8칸, reach/engagement 링은 검은 밴드 8칸씩
      expect(getBandPaths(container, WHITE_BAND)).toHaveLength(8);
      expect(getBandPaths(container, BLACK_BAND)).toHaveLength(16);
    });

    it("keeps every ring white when nothing is hovered", () => {
      const { container } = render(
        <PersonaRadialChart
          personas={[
            { id: "solo", name: "Solo", growth: 80, reach: 100, engagement: 4 },
          ]}
        />,
      );

      expect(getBandPaths(container, WHITE_BAND)).toHaveLength(24);
      expect(getBandPaths(container, BLACK_BAND)).toHaveLength(0);
    });
  });

  describe("posting", () => {
    it("omits reach and engagement bands when there are no posts", () => {
      const { container } = render(
        <PersonaRadialChart
          posting={false}
          personas={[
            { id: "solo", name: "Solo", growth: 80, reach: 100, engagement: 4 },
          ]}
        />,
      );

      // growth 링 8칸만
      expect(getBandPaths(container, WHITE_BAND)).toHaveLength(8);
    });

    it("shows the placeholder badge only while a post-dependent metric is hovered", () => {
      /*
       * 비활성(회색) 상태는 Figma에서 삭제되었습니다. 게시물이 없다는 이유만으로
       * 배지가 미리 떠 있으면 안 되고, Reach/Engagement를 실제로 hover했을 때만
       * default 상태로 나타나야 합니다.
       */
      const { rerender } = render(<PersonaRadialChart posting={false} />);
      expect(screen.queryByText("Not Enough Data Yet")).toBeNull();

      // Growth는 게시물 없이도 산출되므로 여전히 안 뜬다
      rerender(<PersonaRadialChart posting={false} hover="growth" />);
      expect(screen.queryByText("Not Enough Data Yet")).toBeNull();

      // 아바타를 보고 있을 뿐이어도 안 뜬다
      rerender(<PersonaRadialChart posting={false} hover="self" />);
      expect(screen.queryByText("Not Enough Data Yet")).toBeNull();

      rerender(<PersonaRadialChart posting={false} hover="reach" />);
      expect(screen.getByText("Not Enough Data Yet")).toBeInTheDocument();
    });

    it("renders the placeholder badge in its default, never a dimmed, state", () => {
      render(<PersonaRadialChart posting={false} hover="engagement" />);

      // 하단 배지는 페르소나 배지와 달리 페이드용 span 중첩이 없어 요소 자체가 Badge입니다
      const badge = screen.getByText("Not Enough Data Yet");
      expect(badge).toHaveClass("bg-primary");
      // 삭제된 비활성 상태의 흔적이 남아있지 않은지
      expect(badge).not.toHaveClass("bg-accent");
    });

    it("fills the ring uniformly while awaiting data", () => {
      const { container } = render(
        <PersonaRadialChart posting={false} hover="reach" />,
      );

      // 균일 채움은 섹터별 밴드가 아니라 링 전체 도넛 1개입니다
      const uniformFill = container.querySelector<SVGPathElement>(
        `path[fill="var(${WHITE_BAND})"][fill-rule="evenodd"]`,
      );
      expect(uniformFill).not.toBeNull();
    });

    it("highlights the awaiting ring's boundary circles in white", () => {
      const { container } = render(
        <PersonaRadialChart posting={false} hover="reach" />,
      );

      const highlighted = Array.from(container.querySelectorAll("circle"))
        .filter(
          (circle) =>
            circle.getAttribute("stroke") ===
            "var(--color-semantic-non-changeable)",
        )
        .map((circle) => circle.getAttribute("r"));

      // Qualified Reach 링의 두 경계원(160/200)만 흰색
      expect(highlighted).toEqual(["160", "200"]);
    });
  });

  describe("badges", () => {
    it("shows persona names when nothing is hovered", () => {
      render(<PersonaRadialChart />);

      for (const persona of DEFAULT_PERSONAS) {
        expect(screen.getByText(persona.name)).toBeInTheDocument();
      }
    });

    it("swaps names for metric values while a ring is hovered", () => {
      render(<PersonaRadialChart hover="growth" />);

      expect(screen.queryByText("Data Scientist")).toBeNull();
      expect(screen.getByText("80%")).toBeInTheDocument();
      expect(screen.getByText("10%")).toBeInTheDocument();
    });

    it("formats reach values with thousands separators", () => {
      render(<PersonaRadialChart hover="reach" />);

      expect(screen.getByText("8,340")).toBeInTheDocument();
      expect(screen.getByText("125")).toBeInTheDocument();
    });

    it("keeps names on the badges while hovering the self avatar", () => {
      render(<PersonaRadialChart hover="self" />);

      expect(screen.getByText("Data Scientist")).toBeInTheDocument();
    });

    it("renders one badge per existing self, not one per sector", () => {
      render(<PersonaRadialChart selfCount={1} />);

      // 빈 슬롯 7개에는 배지가 없습니다
      expect(screen.getByText("Data Scientist")).toBeInTheDocument();
      for (const persona of DEFAULT_PERSONAS.slice(1)) {
        expect(screen.queryByText(persona.name)).toBeNull();
      }
    });

    it("hides every badge when the hovered metric has no data", () => {
      render(<PersonaRadialChart posting={false} hover="reach" />);

      // 이름으로 되돌아가지 않고 배지 자체가 사라집니다
      for (const persona of DEFAULT_PERSONAS) {
        expect(screen.queryByText(persona.name)).toBeNull();
      }
      // 화면에 남는 배지는 하단 안내 하나뿐입니다
      expect(screen.getByText("Not Enough Data Yet")).toBeInTheDocument();
    });

    it("still shows badges for growth, which needs no posts", () => {
      render(<PersonaRadialChart posting={false} hover="growth" />);

      expect(screen.getByText("80%")).toBeInTheDocument();
    });

    it("calls onPersonaSelect with the persona id when a badge is clicked", async () => {
      const onPersonaSelect = vi.fn();
      render(<PersonaRadialChart onPersonaSelect={onPersonaSelect} />);

      await userEvent.click(screen.getByText("Yoga Meditator"));

      expect(onPersonaSelect).toHaveBeenCalledWith("yoga-meditator");
    });

    it("fills the self's badge while the badges show names", () => {
      render(<PersonaRadialChart personas={SELF_IS_RUNNER_UP} selfId="self" />);

      // 이름을 보여줄 때의 기준은 "이 페이지에서 설정된 셀프"입니다
      expect(badgeOf("Self")).toHaveClass("bg-primary");
      expect(badgeOf("Rival")).toHaveClass("bg-transparent");
    });

    it("fills the top performer's badge while the badges show values", () => {
      render(
        <PersonaRadialChart
          personas={SELF_IS_RUNNER_UP}
          selfId="self"
          hover="growth"
        />,
      );

      // 값을 보여줄 때의 기준은 셀프가 아니라 그 지표의 1등입니다
      expect(badgeOf("90%")).toHaveClass("bg-primary");
      expect(badgeOf("10%")).toHaveClass("bg-transparent");
    });

    it("fills both badges when the top value is tied", () => {
      render(
        <PersonaRadialChart
          personas={[
            { id: "a", name: "A", growth: 50, reach: 1, engagement: 1 },
            { id: "b", name: "B", growth: 50, reach: 2, engagement: 2 },
          ]}
          hover="growth"
        />,
      );

      // 동점은 같은 순위 = 같은 밴드 칸 수라, 배지도 함께 채워집니다
      const tied = screen.getAllByText("50%");
      expect(tied).toHaveLength(2);
      for (const label of tied) {
        expect(label.parentElement).toHaveClass("bg-primary");
      }
    });
  });

  describe("self count", () => {
    it("renders seven empty slots when only the self persona exists", () => {
      render(<PersonaRadialChart selfCount={1} />);

      expect(screen.getAllByText("No Self")).toHaveLength(7);
    });

    it("draws bands for the self persona only", () => {
      const { container } = render(
        <PersonaRadialChart selfCount={1} posting={false} />,
      );

      // Data Scientist의 growth(80)가 링 최댓값이므로 8칸, 나머지는 미표시
      expect(getBandPaths(container, WHITE_BAND)).toHaveLength(8);
    });

    it("keeps the self visible when selfId is an empty string", () => {
      /*
       * `selfId=""`는 `??` 폴백을 통과해버려 어떤 페르소나와도 일치하지 않는
       * 셀프 id가 되고, 8칸 전부 빈 슬롯이 되어 셀프가 통째로 사라졌습니다.
       * Storybook의 Interactive 스토리가 이 값을 넘기고 있었습니다.
       */
      render(<PersonaRadialChart selfCount={1} selfId="" />);

      expect(screen.getAllByText("No Self")).toHaveLength(7);
      expect(screen.getByText("Data Scientist")).toBeInTheDocument();
    });

    it("renders no empty slots when all eight personas exist", () => {
      render(<PersonaRadialChart selfCount={8} />);

      expect(screen.queryByText("No Self")).toBeNull();
    });

    it("keeps the 8px type style on the empty slot label", () => {
      render(<PersonaRadialChart selfCount={1} />);

      /*
       * `cn()`(tailwind-merge)이 .text-xxs-medium을 텍스트 색상 유틸리티로 오인하면
       * text-muted-foreground와 충돌해 통째로 삭제되어 8px이 적용되지 않습니다
       * (lib/utils.ts의 TYPOGRAPHY_PRESET_CLASSES에 등록해 방지).
       */
      const slot = screen.getAllByRole("img", { name: "No Self" })[0];
      expect(slot).toHaveClass("text-xxs-medium");
      expect(slot).toHaveClass("text-muted-foreground");
    });
  });

  describe("center message", () => {
    it.each([
      ["default" as const, true, 8 as const, "Hover to see analysis"],
      ["growth" as const, true, 8 as const, "Growth Potential"],
      ["reach" as const, true, 8 as const, "Qualified Reach"],
      ["engagement" as const, true, 8 as const, "Engagement Intensity"],
      ["reach" as const, false, 8 as const, "Create Posts to analyze"],
      ["engagement" as const, false, 8 as const, "Create Posts to analyze"],
      ["self" as const, true, 1 as const, "Create a Self"],
      ["self" as const, true, 8 as const, "Go to Content Studio"],
    ])(
      "shows %s / posting=%s / self=%s → %s",
      (hover, posting, selfCount, expected) => {
        render(
          <PersonaRadialChart
            hover={hover}
            posting={posting}
            selfCount={selfCount}
          />,
        );

        expect(screen.getByText(expected)).toBeInTheDocument();
      },
    );

    it("calls onCenterClick when the message is clicked", async () => {
      const onCenterClick = vi.fn();
      render(
        <PersonaRadialChart
          selfCount={1}
          hover="self"
          onCenterClick={onCenterClick}
        />,
      );

      await userEvent.click(screen.getByText("Create a Self"));

      expect(onCenterClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("hover behaviour", () => {
    it("stays fixed on the controlled value regardless of the mouse", async () => {
      const { container } = render(<PersonaRadialChart hover="growth" />);

      const hitAreas = container.querySelectorAll<SVGPathElement>(
        'g[fill="transparent"] path',
      );
      await userEvent.hover(hitAreas[2]);

      // 제어 모드이므로 engagement 링에 올려도 growth가 유지된다
      expect(screen.getByText("Growth Potential")).toBeInTheDocument();
    });

    it("reports hover changes through onHoverChange", async () => {
      const onHoverChange = vi.fn();
      const { container } = render(
        <PersonaRadialChart onHoverChange={onHoverChange} />,
      );

      const hitAreas = container.querySelectorAll<SVGPathElement>(
        'g[fill="transparent"] path',
      );
      await userEvent.hover(hitAreas[0]);

      expect(onHoverChange).toHaveBeenCalledWith("growth");
    });

    it("activates the hovered avatar, not just the self one", async () => {
      const onHoverChange = vi.fn();
      render(<PersonaRadialChart onHoverChange={onHoverChange} />);

      // 셀프가 아닌 아바타에 올려도 self 강조 상태로 전환됩니다
      await userEvent.hover(
        screen.getByRole("img", { name: "Yoga Meditator" }),
      );

      expect(onHoverChange).toHaveBeenCalledWith("self");
    });

    it("does not highlight any ring while an avatar is hovered", async () => {
      const { container } = render(<PersonaRadialChart />);

      await userEvent.hover(
        screen.getByRole("img", { name: "Data Scientist" }),
      );

      // 아바타 hover는 지표 hover가 아니므로 어떤 링도 검게 가라앉지 않습니다
      expect(getBandPaths(container, BLACK_BAND)).toHaveLength(0);
      expect(getBandPaths(container, WHITE_BAND).length).toBeGreaterThan(0);
    });

    it("restores the default message when the pointer leaves an avatar", async () => {
      /*
       * 루트의 onMouseLeave만 있으면 차트 **바깥으로 완전히 나갈 때만** 복원되어,
       * 아바타에서 중앙 빈 공간으로 옮겼을 때 CTA 문구가 그대로 남았습니다.
       * 그래서 차트 안에 머무는 이동(아바타 → 중앙 문구)으로 검증합니다.
       */
      render(<PersonaRadialChart />);

      const avatar = screen.getByRole("img", { name: "Novelist" });
      await userEvent.hover(avatar);
      expect(screen.getByText("Go to Content Studio")).toBeInTheDocument();

      /*
       * React는 onMouseLeave를 `mouseout` + `relatedTarget`으로 합성하고,
       * relatedTarget까지의 공통 조상은 제외합니다. 여기서 공통 조상은 차트
       * 루트라, 이 이벤트로는 **아바타의 onMouseLeave만** 발생하고 루트의
       * onMouseLeave는 발생하지 않습니다 — 아바타 단위 처리를 정확히 겨냥합니다.
       */
      fireEvent.mouseOut(avatar.closest("div.absolute") as HTMLElement, {
        relatedTarget: screen.getByText("Go to Content Studio"),
      });

      expect(screen.getByText("Hover to see analysis")).toBeInTheDocument();
    });

    it("says Go to Content Studio when an existing avatar is hovered", async () => {
      // 셀프가 1명뿐이어도, 그 셀프에 올린 거라면 새로 만들라고 하면 안 됩니다
      render(<PersonaRadialChart selfCount={1} />);

      await userEvent.hover(
        screen.getByRole("img", { name: "Data Scientist" }),
      );

      expect(screen.getByText("Go to Content Studio")).toBeInTheDocument();
      expect(screen.queryByText("Create a Self")).toBeNull();
    });

    it("says Create a Self when an empty slot is hovered", async () => {
      render(<PersonaRadialChart selfCount={1} />);

      await userEvent.hover(screen.getAllByLabelText("No Self")[0]);

      expect(screen.getByText("Create a Self")).toBeInTheDocument();
    });

    it("follows the mouse when uncontrolled", async () => {
      const { container } = render(<PersonaRadialChart />);

      const hitAreas = container.querySelectorAll<SVGPathElement>(
        'g[fill="transparent"] path',
      );
      await userEvent.hover(hitAreas[1]);

      expect(screen.getByText("Qualified Reach")).toBeInTheDocument();
      expect(screen.getByText("8,340")).toBeInTheDocument();
    });
  });

  /*
   * jsdom은 실제 애니메이션을 실행하지 않으므로 "부드러운지"는 검증할 수 없습니다.
   * 대신 전환에 필요한 클래스가 cn()(tailwind-merge)에 삼켜지지 않고 살아남는지를
   * 봅니다 — text-xxs-medium이 조용히 삭제됐던 것과 같은 종류의 사고를 막기 위한
   * 회귀 테스트입니다.
   */
  describe("transitions", () => {
    it("puts a colour transition on every value band", () => {
      const { container } = render(<PersonaRadialChart />);

      for (const band of getBandPaths(container, WHITE_BAND)) {
        expect(band).toHaveClass("transition-colors");
        expect(band).toHaveClass("duration-200");
      }
    });

    it("puts a colour transition on the grid circles", () => {
      const { container } = render(<PersonaRadialChart />);

      for (const circle of container.querySelectorAll("circle")) {
        expect(circle).toHaveClass("transition-colors");
      }
    });

    it("keeps the avatar highlight ring mounted in both states", () => {
      const { container: idle } = render(<PersonaRadialChart />);
      const { container: active } = render(<PersonaRadialChart hover="self" />);

      const ringOf = (container: HTMLElement) =>
        container.querySelector<HTMLElement>(".overflow-hidden")!;

      // 링은 항상 있고 색만 바뀝니다 — 그래야 outline-color가 전환됩니다
      for (const el of [ringOf(idle), ringOf(active)]) {
        expect(el).toHaveClass("outline-solid");
        expect(el).toHaveClass("outline-[length:var(--border-width-2)]");
        expect(el).toHaveClass("transition-colors");
      }
      expect(ringOf(idle)).toHaveClass("outline-transparent");
      expect(ringOf(active)).toHaveClass(
        "outline-[color:var(--color-semantic-non-changeable)]",
      );
    });

    it("keeps the dim overlay mounted so it can fade", () => {
      const { container: idle } = render(<PersonaRadialChart />);
      const { container: active } = render(<PersonaRadialChart hover="self" />);

      const overlayOf = (container: HTMLElement) =>
        container.querySelector<HTMLElement>(".pointer-events-none")!;

      expect(overlayOf(idle)).toHaveClass("opacity-0");
      expect(overlayOf(active)).toHaveClass("opacity-100");
    });

    it("keeps the empty slot's dashed border alongside the highlight ring", () => {
      const slotOf = (hover?: "self") =>
        render(
          <PersonaRadialChart selfCount={1} hover={hover} />,
        ).container.querySelectorAll<HTMLElement>('[aria-label="No Self"]')[0];

      for (const slot of [slotOf(), slotOf("self")]) {
        // dashed는 두 상태 모두 유지되고, 활성 링이 그 위를 덮습니다
        expect(slot).toHaveClass("border-dashed");
        expect(slot).toHaveClass("outline-solid");
        expect(slot).toHaveClass("transition-colors");
      }
    });

    it("fades the badge label in when the text is swapped", () => {
      const { rerender } = render(<PersonaRadialChart />);
      expect(screen.getByText("Data Scientist")).toHaveClass("animate-in");

      rerender(<PersonaRadialChart hover="growth" />);
      expect(screen.getByText("80%")).toHaveClass("animate-in");
    });
  });
});
