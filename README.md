# PersonaRadialChart

셀프(self)와 8개 페르소나를 3개 지표로 비교하는 원형 데이터 시각화 컴포넌트입니다.

- **각도** — 8개 섹터 = 8명의 페르소나 (12시 스포크가 정확히 수직)
- **반지름** — 3개 동심원 링 = Growth Potential / Qualified Reach / Engagement Intensity
- **값** — 링 안쪽 경계를 공유하는 반투명 밴드를 겹쳐 쌓아, 안쪽일수록 밝아지는 8단계로 표현

D3 같은 차트 라이브러리 없이 SVG path를 직접 계산합니다.

## 빠르게 실행하기

```bash
npm install
npm run storybook
```

http://localhost:6006 이 열립니다. **`UI/PersonaRadialChart` → `Interactive`** 스토리가 실제 마우스 hover로 동작하는 버전입니다.

- 링 위에 올리면 → 바깥 배지 8개가 그 지표의 **값**으로 전환
- 아바타 위에 올리면 → 그 아바타만 강조 (흰 링 + 블러 + 딤)
- 좌측 Controls에서 `selfCount` / `posting` / `hover`를 바꿔볼 수 있습니다

`SingleSelf`는 빈 슬롯, `NoPostingHoverReach`는 데이터 없는 상태의 처리를 보여줍니다.

## 먼저 읽어주세요

**[docs/persona-radial-chart-spec.md](docs/persona-radial-chart-spec.md)** 에 설계 의도와 결정 근거가 정리되어 있습니다.

코드만 봐서는 역추적하기 어려운 것들이 담겨 있습니다. 예를 들어:

- 값 비율이 아니라 **순위**로 칠하는 이유 (비율로 하면 8,340과 8,006이 같은 칸으로 뭉개짐)
- 강조 링을 `border`가 아니라 `outline`으로 쓴 이유 (border는 아바타를 40px → 36px로 찌그러뜨림)
- 빈 슬롯의 dashed 보더를 두 상태 모두 유지하는 이유 (`border-style`은 CSS가 보간할 수 없는 값)

문서 마지막의 **미확정 항목**도 확인해주세요. Figma와 값이 다른 부분이 아직 남아 있습니다.

## 구성

```
components/ui/persona-radial-chart/   차트 본체 + 스토리 + 테스트
components/ui/avatar/                 차트가 재사용하는 아바타
components/ui/badge/                  차트가 재사용하는 배지
lib/utils.ts                          cn() — clsx + tailwind-merge 커스텀 설정
src/tokens/*.css                      디자인 토큰 (색상/타이포/스페이싱/이펙트)
app/globals.css                       토큰 import + 테마
docs/                                 스펙 문서
```

이 저장소는 **차트가 동작하는 데 필요한 것만** 담고 있습니다. 원본 프로젝트에는 다른 컴포넌트(Input, Chips, Switch 등)도 있지만 여기에는 포함하지 않았습니다.

## 명령어

| 명령어              | 설명                              |
| ------------------- | --------------------------------- |
| `npm run storybook` | Storybook (http://localhost:6006) |
| `npm test`          | Vitest — 차트 테스트 54개         |
| `npm run typecheck` | `tsc --noEmit`                    |
| `npm run lint`      | oxlint                            |
| `npm run build`     | Next.js 프로덕션 빌드             |
| `npm run dev`       | Next.js 개발 서버                 |

> ⚠️ `npm test`를 돌리면 **Badge 2건 + Avatar 1건이 실패**합니다 (`69개 중 3개`). 차트 테스트 54개는 전부 통과합니다. 이 3건은 원본 프로젝트에서도 동일하게 실패하던 기존 이슈이고, 차트 동작과는 무관합니다. 놀라지 마세요.

## 작업 시 주의사항

**색·크기를 하드코딩하지 마세요.** 모든 값은 `src/tokens/*.css`의 CSS 변수를 참조합니다.

```tsx
// ❌
className = "bg-[#ffffff33] text-sm";

// ✅
fill = "var(--color-rdx-white-4)";
className = "text-xs-bold";
```

**새 타이포그래피 클래스를 추가한다면 `lib/utils.ts`의 `TYPOGRAPHY_PRESET_CLASSES`에도 등록해야 합니다.** 등록하지 않으면 `cn()`(tailwind-merge)이 그 클래스를 텍스트 _색상_ 유틸리티로 오인해 **조용히 삭제**합니다. 에러도 경고도 없고 빌드·타입체크·테스트가 전부 통과하며, 폰트 크기만 기본값으로 렌더됩니다. 실제로 한 번 겪은 문제입니다.

**차트 내부의 반지름·각도 상수는 디자인 토큰이 아닙니다.** SVG `viewBox` 내부의 기하 좌표값이라 순수 숫자로 둡니다. 반면 컴포넌트 바깥 치수(캔버스 500, 아바타 40)는 토큰을 씁니다.

## 기술 스택

Next.js 16 · React 19 · TypeScript 5.9 · Tailwind CSS v4 · Storybook 10 · Vitest 4

## 테마

Figma 원본이 다크 배경에만 그려져 있어 **다크 전용**입니다. 값 밴드가 흰색 20%라 라이트 배경에서는 거의 보이지 않습니다. Storybook 스토리는 `.dark` 클래스를 걸어 다크로 고정해두었습니다.
