import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { CompassSphere } from "./compass-sphere";

/**
 * jsdom엔 WebGL 컨텍스트가 없어 `THREE.WebGLRenderer` 생성이 실패한다 — 컴포넌트는
 * 이 경우 구체 렌더링을 건너뛰도록 방어돼 있으므로(컴포넌트 주석 참고), 여기서는
 * 크래시 없이 정적 레이어(컨테이너/배지 기본 라벨)가 마운트되는지만 검증한다.
 */
describe("CompassSphere", () => {
  it("renders without crashing when WebGL is unavailable", () => {
    render(<CompassSphere />);

    expect(screen.getByText("Gabrielle.ai")).toBeInTheDocument();
  });

  it("forwards className and props to the root container", () => {
    const { container } = render(
      <CompassSphere className="custom-class" data-testid="sphere-root" />,
    );

    const root = screen.getByTestId("sphere-root");
    expect(root).toHaveClass("custom-class");
    expect(container.firstChild).toBe(root);
  });
});
