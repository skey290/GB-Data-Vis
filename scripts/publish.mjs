#!/usr/bin/env node
// 로컬 모노레포(/Users/key/Gabrielle)를 세 공개 레포로 배포한다.
//
// 아토믹 컴포넌트와 토큰의 원본은 이 모노레포 한 곳에만 존재하고, 각 레포는
// 여기서 파생된 출력물이다. components/ui를 고치면 이 스크립트가 그걸 참조하는
// 모든 레포에 같은 내용을 반영하므로, 수동으로 두 곳을 맞출 일이 없다.
//
//   npm run publish:design     범용 아토믹      → GB-Design-System
//   npm run publish:app        아토믹 조합      → GB-Component-App
//   npm run publish:all        위 둘 다

import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), "..");

// 세 레포가 공통으로 필요한 것: 빌드 설정 · Storybook · 토큰 · cn()/아이콘 헬퍼
const SHARED = [
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "next.config.ts",
  "postcss.config.mjs",
  "components.json",
  "vitest.config.ts",
  "vitest.setup.ts",
  ".storybook",
  "app/layout.tsx",
  "app/page.tsx",
  "app/globals.css",
  "lib/utils.ts",
  "lib/sprite-icon.tsx",
  "src/tokens",
  "public/icons.svg",
];

const TARGETS = {
  design: {
    repo: "GB-Design-System",
    dir: resolve(ROOT, "../gabrielle-design-system"),
    // 토큰과 아토믹의 뿌리. 레퍼런스 문서도 여기에 둔다.
    paths: [...SHARED, "components/ui", "docs/components"],
    // 아래 디렉터리는 스크립트가 전적으로 소유한다 — 원본에서 사라진 파일은
    // 대상에서도 지워야 하므로 복사 전에 비운다.
    owned: ["components", "docs", "src/tokens", ".storybook"],
  },
  app: {
    repo: "GB-Component-App",
    dir: resolve(ROOT, "../GB-Component-App"),
    // 조합 컴포넌트는 아토믹에 의존하므로 components/ui도 함께 싣는다.
    // 이쪽 ui는 편집 대상이 아니라 배포된 사본이다.
    paths: [...SHARED, "components/ui", "components/app", "public/images"],
    owned: ["components", "src/tokens", ".storybook", "public/images"],
  },
};

function run(cmd, args, cwd) {
  return execFileSync(cmd, args, { cwd, encoding: "utf8" }).trim();
}

function publish(key, { repo, dir, paths, owned }, message) {
  if (!existsSync(dir)) {
    throw new Error(`${repo} 레포가 ${dir} 에 없습니다. 먼저 clone하세요.`);
  }

  for (const path of owned) {
    rmSync(join(dir, path), { recursive: true, force: true });
  }

  for (const path of paths) {
    const from = join(ROOT, path);
    if (!existsSync(from)) throw new Error(`원본 없음: ${path}`);
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    cpSync(from, join(dir, path), { recursive: true });
  }

  // 레포 이름은 각자 유지한다 — package.json은 공유하지만 name만 덮어쓴다.
  const pkgPath = join(dir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.name = repo.toLowerCase();
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

  run("git", ["add", "-A"], dir);
  const staged = run("git", ["status", "--porcelain"], dir);
  if (!staged) {
    console.log(`  ${repo}: 변경 없음`);
    return;
  }
  run("git", ["commit", "-m", message], dir);
  run("git", ["push"], dir);
  const count = staged.split("\n").length;
  console.log(`  ${repo}: ${count}개 파일 반영 후 푸시 완료`);
}

const [which, ...rest] = process.argv.slice(2);
const message = rest.join(" ") || "모노레포에서 배포";
const keys = which === "all" ? Object.keys(TARGETS) : [which];

for (const key of keys) {
  if (!TARGETS[key]) {
    console.error(`알 수 없는 대상: ${key} (design | app | all)`);
    process.exit(1);
  }
}

console.log(`배포 대상: ${keys.map((k) => TARGETS[k].repo).join(", ")}`);
for (const key of keys) publish(key, TARGETS[key], message);
