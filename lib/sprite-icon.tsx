import * as React from "react";
import type { LucideIcon } from "lucide-react";

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
