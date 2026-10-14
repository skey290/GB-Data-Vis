# Persona Radial Analytics — 스펙

## 개요

사용자의 "셀프(self)"와 8가지 페르소나(Data Scientist, Yoga Meditator, Novelist, Entrepreneur, Fashionista, Fashion Editor, Team Leader, Vegan Chef)를 하나의 원형 차트로 비교하는 데이터 시각화. 3가지 지표(Growth Potential, Qualified Reach, Engagement Intensity)를 동심원 링으로, 8명의 페르소나를 각도 섹터로 표현한다.

- **Figma**: 📌 `GB_UXUI (261002)` (`Wp6AZNGqC4qf2Sz5zQ2PzQ`) node `8133:122594` ("Dashboard Data Vis")
- **원본 variant 구성**: `Self(1|8) × Data collected(true|false) × Status(default|hover-reach|hover-engagement|hover-growth potential)` = **12개** (`Self=8 × Data collected=false` 조합 없음). `hover="self"`는 이 Status 축에 없는 값 — 아바타 직접 hover라는 별도 상호작용을 코드가 추가로 다루는 것
- **구현 위치**: `components/dashboard/ui/persona-radial-chart/`

> ⚠️ **다크 전용**: Figma 원본이 다크 배경에만 그려져 있습니다. 배지·그리드·텍스트는 시맨틱 토큰이라 라이트 테마에서도 자동 대응하지만, **값 밴드만은 흰색 20%를 리터럴로 쓰고 있어 라이트 배경에서는 거의 보이지 않습니다.** Figma에 라이트 variant가 생기기 전까지 원본 값을 그대로 따릅니다.

---

## 1. 전체 구조

### 1.1 각도 분할 (8섹터 = 8페르소나)

- 원을 정확히 45°씩 8등분
- 첫 섹터 시작 각도 **-90°(12시)** → 맨 위 스포크가 정확히 수직. `Vegan Chef`(좌측)와 `Data Scientist`(우측)가 정중앙 기준 좌우 대칭
- 섹터 배치 순서 (12시부터 시계방향):
  1. Data Scientist _(self)_
  2. Yoga Meditator
  3. Novelist
  4. Entrepreneur
  5. Fashionista
  6. Fashion Editor
  7. Team Leader
  8. Vegan Chef

> 배열 순서가 곧 섹터 순서입니다. `personas` prop의 순서를 바꾸면 배치도 바뀝니다.

### 1.2 반지름 분할 (3개 링 = 3개 지표)

캔버스 500×500, 동심원 **4개**로 구획(Figma 실측 127.775/159.781/199.539/249.549의 의도값).

| 원 (안쪽부터) | 반지름  | 지름 | 역할                                    |
| ------------- | ------- | ---- | --------------------------------------- |
| 1             | **128** | 256  | 아바타 배치 구역 경계                   |
| 2             | 160     | 320  | Growth Potential 바깥 경계              |
| 3             | 200     | 400  | Qualified Reach 바깥 경계               |
| 4             | 250     | 500  | Engagement Intensity 바깥 경계 (최외곽) |

3개 링은 안쪽부터:

1. **Growth Potential** — 128 ~ 160 (폭 32)
2. **Qualified Reach** — 160 ~ 200 (폭 40)
3. **Engagement Intensity** — 200 ~ 250 (폭 50)

> **좌표계 주의**: 위 반지름·각도는 CSS 길이가 아니라 SVG `viewBox` 내부의 **기하 좌표값**입니다. 그래서 `--spacing-*` 토큰을 쓰지 않고 순수 숫자 상수로 둡니다. 반면 컴포넌트 **바깥 치수**(캔버스, 아바타, 보더/스트로크 폭)는 토큰을 사용합니다.

### 1.3 그리드 스타일

- 동심원 4개 + 지름선 4개(=시각적으로 스포크 8개), 기본 색상 `--color-muted`, 굵기 `--border-1`
- 데이터 없는 링을 hover하면 **그 링의 경계원 2개만** `--color-semantic-non-changeable`(흰색)로 강조 (§5.2)
- 링 내부 8단계를 나누는 별도 가이드라인은 **그리지 않습니다.** 단계 구분은 밴드가 겹치며 생기는 밝기 차이로만 보입니다.

---

## 2. 값 표현 방식 — 순위 기반 8단 밴드

### 2.1 밴드 쌓기 구조

각 링 안에서 **링 안쪽 경계를 시작점으로 공유하는 도넛 조각(annulus sector)을 N겹 겹쳐 쌓습니다.**

- 링 폭을 8등분한 것이 밴드 1칸
- N칸이면 `[내경 → 내경+1칸]`, `[내경 → 내경+2칸]` … `[내경 → 내경+N칸]` 총 N개의 path를 겹쳐 그림
- 겹칠수록 알파가 누적되어 **안쪽이 밝고 바깥으로 갈수록 옅어지는 그라데이션**이 자연스럽게 생김
- 밴드 색: `color-mix(in srgb, var(--icon-default) 20%, transparent)` (흰색 20%, 다크 기준)

> "그라데이션"은 실제 gradient 정의가 아니라, **반투명 밴드를 겹쳐 쌓아 만들어지는 결과물**입니다. Figma 원본도 페르소나×지표 조합마다 정적으로 구워진(baked) SVG가 같은 기법(동일 geometry를 N겹 겹쳐 쌓고 동일 `fill-opacity`를 먹임)으로 만들어져 있어, 시각적으로 완전히 동일합니다.

### 2.2 칸 수 = 링 내 **순위** (값 비율 아님)

1등이 8칸, 꼴등이 1칸이 되도록 순위를 균등 배분합니다.

값 비율(1등 대비 몇 %)로 칠하면 두 가지 문제가 있습니다:

1. **값이 비슷하면 뭉개짐** — 예: 8,340과 8,006이 둘 다 8칸이 되어 구분 불가
2. **한 명이 압도적이면 나머지가 바닥에 깔림**

순위로 칠하면 **분포와 무관하게 8명이 항상 구분됩니다.** 대신 "얼마나 차이나는지"는 표현되지 않으므로, **정확한 값은 링을 hover했을 때 배지에서 확인**하는 구조입니다 (§5.1).

- 동점 → 같은 순위 = 같은 칸
- 값 ≤ 0 → "데이터 없음"으로 보아 **0칸**(아무것도 그리지 않음)
- 순위는 **표시 대상과 무관하게 전체 8명 기준**으로 매깁니다. 셀프 1명만 보이는 상태에서도 척도가 흔들리지 않게 하기 위함

---

## 3. 아바타 배치

- 아바타는 **반지름 128 원 안쪽**, 각 섹터 중간 각도(-67.5°, -22.5°, 22.5° …)에 균등 배치
- 배치 궤도 반지름: **97** (Figma 실측) / 아바타 크기: **40px**
- 인접 아바타 간 중심 거리 ≈ 74px > 40px → 겹치지 않음
- 이미지 없으면 **이니셜 → 아이콘** 순으로 폴백 (`Avatar` 컴포넌트 재사용)

### 3.1 빈 슬롯 ("No Self")

셀프가 1명만 만들어진 상태에서 나머지 7칸에 표시:

- 40px 원, `--border-1`(1px) **dashed** 보더, 색 `--color-muted-foreground`
- 중앙에 8px 텍스트 "No Self" (`text-xxs-medium`)
- `Avatar`의 initial/icon variant와 형태가 달라 **차트 전용 마크업**을 씁니다

---

## 4. 상태 (props)

| prop                  | 값                                                         | 기본값            | 의미                                                                                                |
| --------------------- | ---------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------- |
| `personas`            | `PersonaDatum[]`                                           | 샘플 8명          | **존재하는** 페르소나. 배열 순서 = 섹터 순서                                                        |
| `selfCount`           | `number` (1~8)                                             | `personas.length` | 노출할 셀프 수. 나머지 칸은 빈 슬롯                                                                 |
| `valueFractionDigits` | `number`                                                   | `1`               | 배지 값의 **최대** 소수 자릿수                                                                      |
| `isDataCollected`     | `boolean`                                                  | `true`            | 게시물 유무 (Figma `Data collected`). **Growth는 게시물 없이도 산출**되지만 Reach/Engagement는 필요 |
| `hover`               | `default` \| `growth` \| `reach` \| `engagement` \| `self` | —                 | 주면 제어 컴포넌트(마우스 무시), 안 주면 실제 마우스 hover를 따름                                   |
| `selfId`              | `string`                                                   | 첫 번째 페르소나  | 셀프로 취급할 id                                                                                    |
| `onHoverChange`       | `(hover) => void`                                          | —                 | hover 상태 변경 콜백                                                                                |
| `onCenterClick`       | `() => void`                                               | —                 | 중앙 문구 클릭 (CTA 성격)                                                                           |
| `onPersonaSelect`     | `(id) => void`                                             | —                 | 바깥 배지 클릭. 안 주면 배지는 표시 전용                                                            |

> Figma에는 `Self=8 + Data collected=false` 조합이 **없습니다.** `Data collected=false`는 `Self=1`에만 존재합니다.

### 4.1 실데이터 연결

서버에서 받은 배열을 **그대로 넘기면 됩니다.** `selfCount`를 지정할 필요가 없습니다.

```tsx
const personas = await fetchPersonas(); // 셀프가 3명이라고 가정
<PersonaRadialChart personas={personas} />;
// → 3칸이 채워지고 나머지 5칸은 "No Self" 빈 슬롯
```

설계 규칙:

- **"몇 칸인가"와 "몇 칸이 채워졌는가"는 별개입니다.** 칸 수는 **8개 고정**(`SECTOR_COUNT` 상수)이고, `selfCount`만 달라집니다. 셀프가 3명이어도 8칸 휠이 유지되어야 "더 만들라"는 유도가 성립합니다 — Figma가 의도한 구성입니다
- 셀프는 배열 어디에 있든 **항상 노출**됩니다. `selfId`를 뒤쪽 페르소나로 지정해도 사라지지 않습니다
- 빈 슬롯은 페르소나 id가 없어 `slot:<index>` 합성 키로 식별합니다. 덕분에 **빈 슬롯 하나하나를 개별 hover 강조**할 수 있습니다
- 순위는 **표시 대상과 무관하게 `personas` 전체**로 매깁니다 (§2.2)

> 칸 수를 prop으로 열지 않은 이유: 8칸은 Figma 디자인의 전제(스포크 배치, 배지 앵커 규칙, 지름선 4개)와 얽혀 있어 가변으로 두면 그 규칙들이 함께 깨집니다. 바꿔야 할 일이 생기면 `SECTOR_COUNT` 상수 하나만 고치면 되지만, 그때 스포크·배지 배치를 함께 검토해야 합니다.

### 4.2 값 표기

**모든 지표 최대 소수 1자리.** `valueFractionDigits`로 덮어쓸 수 있습니다.

"최대"라서 정수에는 소수점이 붙지 않아 Figma mock 표기가 그대로 유지됩니다.

| 입력         | 출력                 |
| ------------ | -------------------- |
| `80`         | `80%` (`80.0%` 아님) |
| `14.333333`  | `14.3%`              |
| `8340`       | `8,340`              |
| `1234567.89` | `1,234,567.9`        |

`toLocaleString("en-US", { maximumFractionDigits })`이 반올림과 천 단위 구분을 함께 처리합니다.

### 4.3 중앙 문구 (Hover × 상태 조합)

Figma 원본 문구 그대로:

| Hover                  | 조건                             | 문구                                       |
| ---------------------- | -------------------------------- | ------------------------------------------ |
| `default`              | —                                | `Hover to see analysis`                    |
| `growth`               | —                                | `Growth Potential`                         |
| `reach` / `engagement` | `isDataCollected=true`           | `Qualified Reach` / `Engagement Intensity` |
| `reach` / `engagement` | `isDataCollected=false`          | `Create Posts to analyze`                  |
| `self`                 | **이미 있는 아바타**에 올렸을 때 | `Go to Content Studio`                     |
| `self`                 | **빈 슬롯**에 올렸을 때          | `Create a Self`                            |

> `self` 문구의 기준은 `selfCount`가 **아니라 지금 강조된 대상**입니다. `selfCount`로 판단하면 셀프가 1명 있는 상태에서 **그 셀프에 올려도** `Create a Self`가 떠서, 이미 있는 걸 또 만들라고 말하게 됩니다.
>
> 마우스 정보가 없는 제어 모드(Storybook에서 `hover="self"`만 지정)에서는 **빈 슬롯이 있으면 첫 빈 슬롯**을, 없으면 셀프를 강조합니다.

Figma에는 Button 인스턴스 없이 **1줄 텍스트**만 있어 버튼으로 만들지 않았고, CTA 용도로 `onCenterClick`만 열어뒀습니다.

---

## 5. 인터랙션

### 5.1 링 hover — 배지가 값으로 전환

지표 링에 마우스를 올리면:

1. **해당 링만 흰 밴드 유지**, 나머지 2개 링은 `var(--background-sheer)`(검정 20%) 밴드로 교체되어 **배경보다 어둡게 가라앉음**
2. **바깥 배지 8개의 텍스트가 페르소나 이름 → 그 지표의 값으로 교체** (같은 자리에서)
   - Reach는 천 단위 구분 (`8,340`), 나머지는 `%` (`80%`)
3. 중앙 문구가 지표명으로 전환

### 5.2 데이터가 없는 지표를 볼 때 (`isDataCollected=false` + reach/engagement)

1. 그 링이 **8겹 밴드 대신 균일한 한 겹**으로 채워짐
2. 그 링의 **경계원 2개만 흰색으로 강조**
3. **바깥 배지가 전부 사라짐** (이름으로 되돌아가지 않음)
4. 하단 안내 배지 `Not Enough Data Yet`이 Reach/Engagement를 실제로 hover했을 때만 **default 상태로 나타납니다.** 그 외에는 아예 렌더되지 않습니다. `selfCount`가 1이든 8이든 동일하게 적용되고, 위치는 프레임 중심에서 y +276.

### 5.3 아바타 hover

- **마우스를 올린 아바타 하나만** 강조됩니다. 링 강조는 일어나지 않습니다
- 강조 표현 = **흰 2px 안쪽 링 + 블러 + 검정 오버레이** — 밝아지는 게 아니라 **어두워집니다**
  - 링: `outline` 2px `--color-semantic-non-changeable`, `-outline-offset-2`
  - 블러: `--backdrop-blur-sm`(4px) — Figma Effect는 BACKGROUND_BLUR("Backdrop Blur/backdrop-blur") radius 8을 환산. 아바타 뒤에 다른 레이어가 없어 `filter`로 적용해도 결과가 같고, 링은 별도 레이어라 영향받지 않음
  - 딤: `--background-backdrop`(검정, 알파 0.3 — Figma 쪽도 동일 토큰에 바인딩됨)
- 빈 슬롯도 hover하면 같은 링 + `--background-sheer` 배경(다크에서 검정 20%)
- Storybook의 `hover="self"` 제어 모드는 **어떤 아바타에 올렸는지 알 수 없어** 셀프를 강조합니다

### 5.4 바깥 배지 위치

- 배지의 "원을 향한 모서리"가 놓이는 궤도 반지름 **265** (Figma 실측 258.9~272.3의 중앙값)
- 좌/우 4개(±22.5°, ±157.5°): 가로만 모서리 정렬, **세로는 중앙 정렬**
- 모서리 4개(±67.5°, ±112.5°): 가로·세로 모두 모서리 정렬
- **배지는 만들어진 셀프 수만큼만** 렌더됩니다. 빈 슬롯에는 배지가 없습니다

### 5.5 배지 강조 규칙 (어떤 배지가 채워지는가)

채워진(`Badge variant="default"`) 배지가 **"지금 기준이 되는 대상"** 을 가리킵니다. 나머지는 보더·텍스트 모두 `--color-muted-foreground`인 커스텀 outline입니다.

| 배지가 보여주는 것                  | 채워지는 배지                 |
| ----------------------------------- | ----------------------------- |
| **이름** (`hover=default` / `self`) | 이 페이지에서 설정된 **셀프** |
| **값** (지표 hover)                 | 그 지표의 **1등**             |

1등 판정은 값을 다시 비교하지 않고 **링 채움에 쓴 밴드 칸 수를 그대로 재사용**합니다(8칸 = 1등). 링에서 가장 길게 찬 섹터와 채워진 배지가 항상 같은 페르소나를 가리키게 되고, **동점이면 둘 다 8칸이라 배지도 둘 다 채워집니다.** (Figma 목업은 정적 애셋이라 동점 케이스를 전부 재현하지 못할 수 있지만, 절차적 구현은 모든 동점을 일관되게 처리합니다.)

---

## 6. 모션 / 전환

hover 시 전환이 끊기지 않도록, shadcn 관례를 따라 차트 전체에 전환을 적용했습니다.

### 6.1 공통 설정

```
MOTION_DURATION = duration-200 ease-out
```

- 이 프로젝트의 다른 컴포넌트는 duration 없는 `transition-colors`(기본 150ms)를 쓰지만, 그건 **버튼처럼 작은 요소 기준**입니다. 지름 500px 차트는 hover 한 번에 색이 바뀌는 면적이 훨씬 넓어 150ms면 여전히 끊겨 보여 **200ms**로 잡았습니다
- **속도 조절은 이 상수 하나만 바꾸면 차트 전체에 반영됩니다**
- 모든 전환에 `motion-reduce:` 변형 → OS "동작 줄이기" 사용자에겐 전환 없이 즉시 변경

### 6.2 대상별 전환

| 대상                      | 방식                                               | 보이는 시점                            |
| ------------------------- | -------------------------------------------------- | -------------------------------------- |
| 값 밴드 (최대 226개 path) | `fill` 흰↔검정 색 페이드                           | 링 hover — 가장 큰 효과                |
| 그리드 경계원 4개         | `stroke` 색 페이드                                 | 데이터 없는 링 hover                   |
| 아바타 강조 링            | `outline-color` 투명↔흰색                          | 아바타 hover                           |
| 아바타 블러               | `--backdrop-blur-none` ↔ `--backdrop-blur-sm` 보간 | 아바타 hover                           |
| 딤 오버레이               | `opacity` 0↔1                                      | 아바타 hover                           |
| 빈 슬롯                   | 링 페이드인 + 배경 색 페이드                       | `selfCount=1`에서 빈 슬롯 hover        |
| 배지 텍스트               | 이름↔값 교체 시 페이드인                           | 링 hover                               |
| 배지 등장/퇴장            | 페이드인                                           | 데이터 없는 지표 hover                 |
| 중앙 문구                 | 문구 교체 시 페이드인                              | 모든 hover                             |
| 하단 안내 배지            | 배경·글자색·보더 동시 페이드                       | `isDataCollected=false`에서 지표 hover |

### 6.3 구현상 주의점 (재작업 시 참고)

1. **`border` → `outline`**: 강조 링을 border로 주면 `box-sizing` 때문에 아바타가 40px → **36px로 찌그러집니다.** outline은 레이아웃을 차지하지 않고, `outline-color`는 애니메이션 가능하며, border보다 위에 그려집니다
2. **`border-style: dashed ↔ solid`는 CSS가 보간할 수 없는 값**입니다. 빈 슬롯은 dashed 1px를 **두 상태 모두 유지**하고, 그 위를 2px outline이 덮는 방식으로 우회했습니다
3. **mount/unmount는 transition이 안 걸립니다.** 딤 오버레이는 항상 렌더하고 `opacity`만 바꿉니다 (`pointer-events-none` 필수)
4. **`filter: none` ↔ `blur(4px)`는 보간이 모호합니다.** 비활성일 때도 `--backdrop-blur-none`(= `blur(0px)`)을 명시해야 부드럽게 이어집니다
5. **텍스트 내용 교체는 transition 대상이 아닙니다.** `key={content}`로 remount시키고 `animate-in fade-in`을 겁니다 (tw-animate-css)
6. Tailwind v4의 `transition-colors`는 `fill` / `stroke` / `outline-color`를 **이미 포함**합니다. SVG는 presentation attribute 그대로 두고 className만 추가하면 됩니다

---

## 7. 샘플 데이터

`DEFAULT_PERSONAS`는 Figma mock 기준 플레이스홀더이며, 실제 화면에서는 백엔드에서 받은 배열로 교체됩니다(수치 자체가 Figma와 일치할 필요는 없습니다).

| 페르소나                | Growth (%) | Qualified Reach | Engagement (%) |
| ----------------------- | ---------- | --------------- | -------------- |
| Data Scientist _(self)_ | 80         | 8,340           | 14.3           |
| Yoga Meditator          | 10         | 6,453           | 1.8            |
| Novelist                | 40         | 4,784           | 0.4            |
| Entrepreneur            | 70         | 978             | 2.0            |
| Fashionista             | 60         | 6,782           | 0.3            |
| Fashion Editor          | 20         | 125             | 3.7            |
| Team Leader             | 50         | 8,006           | 0.5            |
| Vegan Chef              | 30         | 5,431           | 1.9            |

Growth는 `10/20/30/40/50/60/70/80`의 완전한 사다리꼴입니다. 동점이 없어 §2.2의 순위 기반 채움에서 8명이 8단계에 정확히 하나씩 배정됩니다(밴드 path 총 36개).

> ⚠️ **"지표별 최댓값(스케일 상한)" 개념은 쓰이지 않습니다.** §2.2의 순위 기반 방식이라 Growth 100% / Reach 9,000 / Engagement 16% 같은 상한값은 필요 없습니다.

---

## 8. 미확정 / 추후 논의 필요

- [ ] **아바타 실제 사진 적용** — `imageSrc` prop은 이미 열려 있으나 현재는 전부 이니셜 폴백. Figma `Self=1`에는 실제 인물 사진이 들어가 있음
- [ ] **빈 슬롯 dashed 패턴** — Figma가 raw dash 값을 노출하지 않아 현재는 브라우저 기본값. 명시적 `stroke-dasharray` 지정 여부
- [ ] **배지 위치 미세 조정** — Figma 실측 대비 평균 ~5px / 최대 16px 차이. 단, Figma 원본 좌표 자체가 불규칙해 규칙화한 현재 방식이 더 정확할 수 있음
- [ ] **라이트 테마 variant** — Figma에 다크만 존재. 값 밴드(흰색 20%)가 라이트에서 안 보임
- [ ] **self 페르소나 밴드 색 구분** — 현재는 다른 페르소나와 동일. 별도 강조색 부여 여부

---

## 9. 구현 파일

`components/dashboard/ui/persona-radial-chart/` (프로젝트 규칙대로 컴포넌트 1개 = 4파일)

| 파일                               | 내용                                                                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `persona-radial-chart.tsx`         | 컴포넌트 본체                                                                                                        |
| `persona-radial-chart.stories.tsx` | Storybook — `Playground` 단일 story, Controls로 모든 prop 조작(1 컴포넌트 = 1 Controls story 컨벤션)                 |
| `persona-radial-chart.test.tsx`    | Vitest (grid / value bands / isDataCollected / badges / self count / center message / hover behaviour / transitions) |
| `index.ts`                         | named export                                                                                                         |

관련 컴포넌트: 아바타 원형 배치 + 중앙 문구는 `components/dashboard/ui/self-curation/`(`SelfCuration`, Figma `Self curation`, node `8133:122553`)에 분리돼 있고, 슬롯 하나(아바타/빈 슬롯)는 `components/dashboard/ui/self-slot/`(`SelfSlot`, Figma `Part/self`, node `8133:122512`)가 담당합니다.

### 사용하는 토큰

| 용도                | 토큰                                                    | 값                  |
| ------------------- | ------------------------------------------------------- | ------------------- |
| 값 밴드 (활성)      | `color-mix(..., var(--icon-default) 20%, transparent)`  | 흰색 20%            |
| 값 밴드 (침강)      | `var(--background-sheer)`                               | 검정 20%(다크 기준) |
| 아바타 딤 오버레이  | `var(--background-backdrop)`                            | 검정 알파 0.3       |
| 그리드              | `var(--color-muted)`                                    | —                   |
| 강조 링/경계원      | `var(--color-semantic-non-changeable)`                  | 흰색                |
| 빈 슬롯 보더/텍스트 | `var(--color-muted-foreground)`                         | —                   |
| 보더 폭             | `var(--border-1)` / `var(--border-2)`                   | 1px / 2px           |
| 블러                | `var(--backdrop-blur-none)` / `var(--backdrop-blur-sm)` | 0px / 4px           |
| 빈 슬롯 원 radius   | `var(--radius-scale-full)`                              | —                   |
| 빈 슬롯 라벨        | `text-xxs-medium`                                       | 8px Medium          |

> ⚠️ `text-xxs-medium` 같은 커스텀 타이포 클래스는 **`lib/utils.ts`의 `TYPOGRAPHY_PRESET_CLASSES`에 등록되어 있어야** 합니다. 등록하지 않으면 `cn()`(tailwind-merge)이 텍스트 **색상** 유틸리티로 오인해 조용히 삭제하고, 빌드·타입체크·테스트가 전부 통과해버립니다.
>
> 위 토큰은 전부 prefix 없는 alias 이름(`--border-1` 등)이며 `src/tokens/*.css`에서 `--gb-*`로 정의된 뒤 별칭된 것입니다. `--gb-` prefix 마이그레이션 상태는 `docs/design-tokens.md` 참고.
