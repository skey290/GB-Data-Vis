/**
 * `status` 컨트롤이 내부 props로 풀리는 스토리에서, Show code 패널이 실제로
 * 작성해야 할 코드를 보여주도록 소스를 다시 만든다.
 *
 * `status`는 Figma `Status` 축을 한 줄로 모아 보기 위한 스토리 전용 arg라,
 * 그대로 찍으면 존재하지 않는 prop이 코드에 나온다. 여기서 실제 props로
 * 치환하고, hover 같은 CSS 상태는 prop이 없으므로 주석으로 알린다.
 */

type Props = Record<string, unknown>;

/** 스토리 전용 장치라 코드 샘플에서 숨긴다. */
function isPseudoClassName(key: string, value: unknown) {
  return (
    key === "className" &&
    typeof value === "string" &&
    value.split(" ").every((part) => part.startsWith("pseudo-"))
  );
}

function formatDate(value: Date) {
  return `new Date(${value.getFullYear()}, ${value.getMonth()}, ${value.getDate()})`;
}

/** JSX 속성값 한 개를 문자열로. `null`이면 코드에서 생략한다. */
function formatValue(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "function") return null;
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") return `{${value}}`;
  if (typeof value === "boolean") return value ? "" : "{false}";
  if (value instanceof Date) return `{${formatDate(value)}}`;
  // File은 열거 가능한 own property가 없어 아래 객체 분기에서 조용히 사라진다
  if (typeof File !== "undefined" && value instanceof File) {
    return `{new File([], ${JSON.stringify(value.name)})}`;
  }
  if (Array.isArray(value)) return value.length ? "{[...]}" : null;
  if (typeof value === "object") {
    const entries = Object.entries(value as Props).filter(
      ([, v]) => v !== undefined && typeof v !== "function",
    );
    if (!entries.length) return null;
    const body = entries
      .map(([k, v]) =>
        v instanceof Date
          ? `${k}: ${formatDate(v)}`
          : `${k}: ${JSON.stringify(v)}`,
      )
      .join(", ");
    return `{{ ${body} }}`;
  }
  return null;
}

export interface StatusSourceOptions {
  /** 코드 샘플에서 제외할 prop 이름 */
  omit?: string[];
  /** 자식으로 렌더링할 arg 이름 (예: Button의 `children`) */
  childrenKey?: string;
  /** prop 없이 CSS로만 재현되는 status 값 */
  cssOnly?: string[];
}

export function makeStatusSource(
  componentName: string,
  statusProps: Record<string, Props>,
  options: StatusSourceOptions = {},
) {
  const { omit = [], childrenKey, cssOnly = [] } = options;

  return (_code: string, context: { args?: Props }) => {
    const args = context.args ?? {};
    const status = String(args.status ?? "");
    const resolved: Props = { ...args, ...(statusProps[status] ?? {}) };
    delete resolved.status;

    let children: string | null = null;
    if (childrenKey && typeof resolved[childrenKey] === "string") {
      children = resolved[childrenKey] as string;
      delete resolved[childrenKey];
    }

    const attrs: string[] = [];
    for (const [key, value] of Object.entries(resolved)) {
      if (omit.includes(key) || isPseudoClassName(key, value)) continue;
      const formatted = formatValue(value);
      if (formatted === null) continue;
      attrs.push(formatted === "" ? key : `${key}=${formatted}`);
    }
    attrs.sort();

    const body = attrs.length ? `\n  ${attrs.join("\n  ")}\n` : " ";
    const element = children
      ? `<${componentName}${body}>${children}</${componentName}>`
      : `<${componentName}${body}/>`;

    if (!cssOnly.includes(status)) return element;

    return `${element}\n\n// \`${status}\`는 CSS 상태라 prop이 없다 — 마우스를 올리거나 포커스를 주면 그대로 나타난다.`;
  };
}
