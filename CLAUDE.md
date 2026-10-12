# 프로젝트: [Gabrielle]

## 기술 스택

- 프레임워크: Next.js
- 언어: TypeScript
- 스타일링: 커스터마이징된 Shadcn (shadcn/ui 기반 + Tailwind, 커스텀 테마)
- 데이터 스토리지: Firebase (사용자 정보 등 대부분의 데이터 저장) — **예정, 아직 미연결**
- DB: Supabase (DB 연결 링크만 저장 — 실제 데이터는 Firebase에 저장) — **예정, 아직 미연결**
- UI 문서화: Storybook
- 테스트: Vitest + @storybook/test

## 디렉토리 구조

- `app/` — Next.js App Router 라우트/페이지
- `components/ui/` — 범용 디자인 시스템 UI 컴포넌트 (Shadcn 기반)
- `components/app/` · `components/compass/` · `components/dashboard/` — 앱 공용 조합 / 앱 전용 컴포넌트
- `src/tokens/*.css` — 디자인 토큰 원본 (직접 수정)
- `lib/utils.ts` — `cn()` 등 유틸리티
- `lib/sprite-icon.tsx` — 아이콘 스프라이트 / lucide 매핑
- `docs/design-tokens.md` — 토큰 레퍼런스
- `docs/components/*.md` — 컴포넌트 레퍼런스

## 디자인 시스템 규칙

### 디자인 우선순위 규칙 (절대 규칙, 최우선 원칙)

- [매우 중요] 이 프로젝트의 컴포넌트 스타일링 "방식"(구조/구현 패턴)은 Shadcn(shadcn/ui)을 커스터마이징한 것이지만, 실제 디자인 값(색상/보더/그림자/간격/상태별 스타일 등)은 **항상 Figma 파일이 우선**한다.
- Figma에 명시적으로 디자인되어 있는 내용(variant, 상태, 색상, 토큰 값 등)이 있다면 반드시 그 값을 그대로 반영할 것 — Shadcn CLI 스캐폴드 기본값이나 Shadcn 관례로 대체/방치하지 말 것.
- Figma에 명시되지 않은 부분(예: Figma에 해당 상태/컴포넌트 자체가 없는 경우)에 한해서만 Shadcn 기본 방식/기본값을 기준으로 판단.
- 실제 사례: `app/globals.css`의 `.dark` 블록 색상값이 초기 Shadcn CLI 스캐폴드 기본값 그대로 남아있었고 Figma 다크 토큰과 실제 값이 달랐던 적이 있음 (예: `--border: oklch(1 0 0 / 10%)` → Figma 실제 값은 `oklch(0.371 0 0)`/neutral-700). 이런 불일치는 무조건 Figma 값으로 동기화한다.

### 컴포넌트 규칙 (신규 추가)

- 신규 컴포넌트는 반드시 components/ui/ 하위에 생성.
- props는 피그마 프로퍼티 기준으로 정의.
- [중요] 기존 컴포넌트 재사용 우선. 새로 <button> 태그 생성 금지.
- 신규 컴포넌트 추가 시 .stories.tsx 파일 함께 생성.

### 토큰 파일 규칙

- 이 프로젝트에 **Style Dictionary 파이프라인은 없다.** `tokens/*.json`도, `build:tokens` 스크립트도, 자동 생성 CSS도 없다.
- 토큰 원본은 `src/tokens/*.css` 8개 파일이고 **직접 수정**한다 — `colors.css` / `typography.css` / `text-styles.css` / `spacing.css` / `radius.css` / `border.css` / `effects.css` / `opacity.css`.
- 각 파일 끝의 prefix 없는 alias 블록(`--text-sm: var(--gb-text-sm)`)은 하위호환용이다. 신규 코드는 `var(--gb-*)`만 참조한다.
- 값은 Figma 변수 컬렉션(`color` / `color-primitives` / `space` / `radius` / `stroke` / `opacity` / `font`)과 Effect·Text 스타일이 기준이다.

### 토큰 사용 (절대 규칙)

- [중요] 하드코딩된 색상값(hex, rgb, hsl) 사용 금지. 반드시 `var(--gb-color-*)` 사용.
- 하드코딩된 스페이싱 사용 금지. 반드시 `var(--gb-spacing-*)` 사용.
- 컴포넌트의 사이즈(높이, 너비 등 컴포넌트 자체 크기)는 간격용 `--gb-spacing-*`가 아니라 Figma 확정값을 리터럴 px(예: `h-[36px]`)로 직접 사용.
- 타이포그래피는 `var(--gb-font-*)`, `var(--gb-text-*)` 토큰만 사용.
- 토큰을 어떤 맥락에서 써야 하는지는 `docs/design-tokens.md` 참조.
- 토큰(CSS 변수)은 Shadcn 테마 설정(`app/globals.css` 등)에서 직접 관리.

* font-size 직접 입력 금지

#### `--gb-` 토큰 prefix (2026-10-06 도입, 마이그레이션 진행 중)

- `src/tokens/*.css`에 정의된 원시/시맨틱 토큰(색상·스페이싱·radius·opacity·border·shadow·typography)은 전부 `--gb-` prefix로 정의되어 있음(예: `--gb-radius-scale-lg`, `--gb-text-bold`). 새로 작성/수정하는 코드는 반드시 `var(--gb-*)`로 참조할 것 — prefix 없는 이름(`--border-1` 등)은 과거 코드와의 하위호환을 위한 alias일 뿐, 신규 코드에서 쓰지 말 것.
- **예외**: `app/globals.css`의 `@theme inline` 블록(`--color-primary`, `--radius-lg` 등)과 Shadcn 브릿지 변수(`--background`, `--primary`, `--border` 등)는 Tailwind v4가 `bg-primary`/`rounded-lg` 같은 유틸리티 클래스를 생성하는 데 쓰는 고정 네임스페이스라 **prefix 대상이 아님**. 여길 건드리면 전체 앱의 Tailwind 유틸리티가 깨짐.
- 마이그레이션은 컴포넌트를 다듬을 때마다 점진적으로 진행 — 아직 작업하지 않은 컴포넌트는 prefix 없는 옛 이름을 그대로 참조해도 alias를 통해 정상 동작함. 현재 진행 상태는 `docs/design-tokens.md`의 "`--gb-` prefix 마이그레이션 상태" 표 참고.

### Figma에서 UI 구현 시

- 먼저 `docs/design-tokens.md`를 읽어 토큰 매핑 테이블을 확인할 것.
- `get_design_context` 사용 (`get_metadata` 아님).
- 에이전트 위임 시: 연속 구현 가능. 단, 5개 이상이면 새 세션 권장.
- 에이전트 없이 직접 구현 시: 한 번에 하나의 컴포넌트만.
- `components/ui/`에 기존 컴포넌트가 있으면 재사용 — 중복 생성 금지.

### Storybook 규칙 (2026-10-06 개정)

- 모든 컴포넌트는 반드시 `.stories.tsx` 파일을 함께 생성할 것.
- Story 포맷: CSF3 + TypeScript + `satisfies Meta<typeof Component>`
- 모든 story에 `tags: ['autodocs']` 포함.
- `parameters.design.url`에 해당 Figma 프레임 URL 연결.
- **1 컴포넌트 = 1 Controls story(`Playground`)**. variant/상태별로 개별 story를 나열하지 않고, `argTypes`에 모든 prop의 control(select/radio/boolean/text 등)을 지정해 한 페이지 안에서 바로 조작 가능하게 한다. (과거 "모든 variant에 대한 개별 story 생성" 규칙은 폐기 — 사이드바에 variant 수만큼 story가 늘어나 한눈에 비교/조작하기 어려웠음.)
- Story의 play function으로 variant별 자동검증을 하지 않는다 — 그 검증은 같은 컴포넌트의 `.test.tsx`(Vitest)로 옮긴다. Story는 디자인/문서 확인용, 자동 회귀 테스트는 Vitest 책임으로 분리.
- Storybook의 "Show code" 패널은 실제 `.tsx` 소스를 그대로 보여준다 — 즉 컴포넌트 파일 자체가 주석 없이 깔끔해야 Show code도 깔끔하다 (아래 "공통 Props 컨벤션"의 주석 규칙 참고).

### 공통 Props 컨벤션 (2026-10-06 도입, Atlaskit 레퍼런스 기반)

모든 `components/ui/` 컴포넌트가 아래 네이밍 규칙을 따른다. 구조적/접근성 prop은 Figma 유무와 무관하게 적용하고, 시각적 variant/상태 prop은 **반드시 Figma에 실제로 디자인되어 있을 때만** 추가한다(디자인 우선순위 규칙과 동일한 원칙).

- **Boolean prop**: `is*`/`should*` 접두사 (`isDisabled`, `isSelected`, `isLoading`, `shouldFitContainer` 등). 단, HTML 네이티브 속성과 1:1 대응하는 것(`disabled`, `required`, `readOnly` 등)은 네이티브 이름을 그대로 쓴다 — 억지로 `isDisabled`로 감싸지 않는다.
- **Figma boolean 프로퍼티에 대응하는 boolean prop은 `show` + Figma 프로퍼티 이름(camelCase)으로 쓴다.** Figma의 boolean 프로퍼티는 거의 전부 "이 요소를 그릴지" 토글이고, 이름을 보존해야 Figma 패널에서 본 프로퍼티를 코드에서 그대로 검색할 수 있다 (`Label` → `showLabel`, `Trailing icon` → `showTrailingIcon`, `Delete icon` → `showDeleteIcon`, `Title` → `showTitle`). 이 규칙이 위의 `is*`/`should*`보다 우선한다 — `is*`/`should*`는 Figma에 대응 프로퍼티가 없는 코드 전용 boolean에만 적용한다.
- 단, 그 요소가 **슬롯 prop 하나로 표현되는 경우**(`icon?: IconId`, `description?: string` 등)에는 별도 boolean을 두지 않고 **값 유무로 판단**한다. 상태가 두 군데로 갈리는 것을 막기 위함이다 (`Button › Show icon` ↔ `iconAfter` 유무, `Badge › Leading Icon` ↔ `icon` 유무).
- **ref**: DOM 접근이 의미 있는 컴포넌트는 `React.forwardRef`로 감싼다.
- **제어/비제어 값**: `value` + `onChange`(제어), `defaultValue`(비제어) 쌍으로 둘 다 지원.
- **아이콘/요소 슬롯**: `icon`, `iconBefore`/`iconAfter` 등 — 느슨한 `string` 대신 리터럴 유니온 타입으로 좁혀서 Storybook Controls에 드롭다운이 뜨게 한다 (`lib/sprite-icon.tsx`의 `IconId` 패턴 참고).
- **주석**: Figma 노드id·조사 히스토리·결정 배경 같은 긴 근거 주석은 코드에 남기지 않는다 — 그런 맥락은 커밋 메시지에 남기고, 코드에는 prop별 1줄 JSDoc만 유지한다(무엇을 받는지/언제 쓰는지만, 왜 이렇게 됐는지는 안 씀).
- 모든 Atlaskit 관례를 그대로 따를 필요는 없음 — 이 프로젝트에 실제로 필요한 것(테스트 가능성, 접근성, Storybook 조작성)만 선택적으로 채택한다.

### Code Connect

- 매핑 정보는 `figma-code-connect.json`에 있음.
- Figma 프레임 구현 시, 먼저 Code Connect에서 기존 매핑 확인.

## 컴포넌트 규칙

- 컴포넌트 1개 = 4개 파일: `.tsx` / `.stories.tsx` / `.test.tsx` / `index.ts`
- Named export만: `export function Button() {}`
- Props 인터페이스: `interface ButtonProps {}`

## 백엔드/데이터 규칙 (예정 — 현재 레포에 연결 코드 없음)

- 사용자 정보 등 대부분의 데이터는 Firebase에 저장.
- Supabase는 DB 연결 링크만 저장하는 용도로 사용 — 실제 데이터 저장소로 쓰지 않음.

## 에이전트 위임 규칙

- Figma URL이 포함된 구현 요청 → `@agent-figma-implementer`에 위임 (필수)
- 토큰 동기화/비교 요청 → `@agent-token-checker`에 위임
- 디자인 감사/토큰 검증 요청 → `@agent-design-reviewer`에 위임
- QA 리포트/전체 검사/릴리즈 전 검사 → `@agent-qa-reporter`에 위임
- Figma MCP 호출은 반드시 서브에이전트에서 실행할 것 (컨텍스트 보호)

## 빌드 및 테스트 명령어

- `npm run dev` — Next.js 개발 서버
- `npm run build` — Next.js 프로덕션 빌드
- `npm run storybook` — Storybook (http://localhost:6006)
- `npm test` — Vitest
- `npm run lint` — ESLint + Prettier
- `npm run typecheck` — tsc --noEmit
