import type { Preview } from "@storybook/nextjs";
import * as React from "react";
import { useEffect } from "react";
import { DocsContainer } from "@storybook/addon-docs/blocks";
import { useDarkMode } from "storybook-dark-mode";
import { themes } from "storybook/theming";
import { Bitcount_Grid_Single, Inter } from "next/font/google";
import {
  decorators as pseudoStateDecorators,
  initialGlobals as pseudoStateInitialGlobals,
} from "storybook-addon-pseudo-states/preview";
import "../app/globals.css";

// app/layout.tsx와 동일한 이유(text-styles.css의 118개 텍스트 스타일이 참조하는
// --font-sans → --font-inter) — Storybook은 app/layout.tsx를 거치지 않아
// 별도로 로드해야 합니다.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// app/layout.tsx와 동일한 이유(.text-time-stamp가 참조하는 --font-time-stamp) —
// Storybook은 app/layout.tsx를 거치지 않아 별도로 로드해야 합니다.
const bitcountGridSingle = Bitcount_Grid_Single({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-time-stamp",
  display: "swap",
});

// --background-default의 실제 값. Docs 본문이 스토리 캔버스와 같은 배경을 쓰게 한다.
const docsDarkTheme = {
  ...themes.dark,
  appBg: "#0a0a0a",
  appContentBg: "#0a0a0a",
};
const docsLightTheme = {
  ...themes.light,
  appBg: "#ffffff",
  appContentBg: "#ffffff",
};

function ThemedDocsContainer(
  props: React.ComponentProps<typeof DocsContainer>,
) {
  const isDark = useDarkMode();
  return (
    <DocsContainer {...props} theme={isDark ? docsDarkTheme : docsLightTheme} />
  );
}

const preview: Preview = {
  tags: ["autodocs"],
  initialGlobals: {
    ...pseudoStateInitialGlobals,
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    darkMode: {
      stylePreview: true,
      dark: { ...themes.dark, appPreviewBg: "#0a0a0a" },
      light: { ...themes.light, appPreviewBg: "#ffffff" },
    },
    // Docs 본문(.sbdocs-wrapper)의 배경·보더·코드블록 색은 preview iframe 안의
    // DocsContainer 테마가 결정한다. 테마를 넘기지 않으면 다크모드에서도 흰
    // 배경으로 고정돼, `.dark` 토큰을 따라가는 흰 글자가 안 보인다.
    docs: {
      container: ThemedDocsContainer,
    },
  },
  decorators: [
    (Story) => {
      const isDark = useDarkMode();
      useEffect(() => {
        document.documentElement.classList.toggle("dark", isDark);
        document.documentElement.classList.add(
          inter.variable,
          bitcountGridSingle.variable,
        );
      }, [isDark]);
      return Story();
    },
    ...pseudoStateDecorators,
  ],
};

export default preview;
