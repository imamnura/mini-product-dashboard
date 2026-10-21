import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    globals: true,
    environment: "nuxt",
    environmentOptions: {
      nuxt: { domEnvironment: "jsdom" },
    },
    // unit test diletakkan bersebelahan dengan file sumbernya
    include: ["app/**/*.test.ts"],
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "app/components/**/*.{ts,vue}",
        "app/composables/**/*.ts",
        "app/pages/**/*.{ts,vue}",
      ],
      exclude: ["**/*.test.ts"],
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
    },
  },
});
