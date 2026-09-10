import type { Preview } from "@storybook/nextjs";
import { useEffect } from "react";
import { useDarkMode } from "storybook-dark-mode";
import {
  decorators as pseudoStateDecorators,
  initialGlobals as pseudoStateInitialGlobals,
} from "storybook-addon-pseudo-states/preview";
import "../app/globals.css";

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
      }, [isDark]);
      return Story();
    },
    ...pseudoStateDecorators,
  ],
};

export default preview;
