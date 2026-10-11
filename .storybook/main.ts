import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: [
    "../app/**/*.mdx",
    "../app/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../components/**/*.mdx",
    "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  staticDirs: ["../public"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-designs",
    "storybook-dark-mode",
    // hover·focus·active를 강제로 켜 둘 수 있게 한다 — 마우스를 올려야만
    // 보이는 상태를 Figma와 나란히 두고 비교할 수 있다.
    "storybook-addon-pseudo-states",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
};
export default config;
