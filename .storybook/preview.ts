import type { Preview } from "@storybook/nextjs";
import { useEffect } from "react";
import { useDarkMode } from "storybook-dark-mode";
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
