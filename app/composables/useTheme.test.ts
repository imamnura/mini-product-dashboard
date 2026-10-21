import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { clearNuxtState } from "#imports";
import { useTheme } from "./useTheme";

function mockSystemDark(prefersDark: boolean) {
  const matchMedia = vi.fn((query: string) => ({
    matches: query === "(prefers-color-scheme: dark)" ? prefersDark : false,
    media: query,
  }));
  vi.stubGlobal("matchMedia", matchMedia);
  return matchMedia;
}

async function setup() {
  let theme!: ReturnType<typeof useTheme>;
  await mountSuspended(
    defineComponent({
      setup() {
        theme = useTheme();
        return () => h("div");
      },
    })
  );
  return theme;
}

const html = () => document.documentElement;

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    html().classList.remove("dark");
    clearNuxtState(undefined, { reset: false });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("applies the stored dark theme on mount", async () => {
    mockSystemDark(false);
    localStorage.setItem("theme", "dark");

    const { isDark } = await setup();

    expect(isDark.value).toBe(true);
    expect(html().classList.contains("dark")).toBe(true);
  });

  it("applies the stored light theme on mount even if the system prefers dark", async () => {
    mockSystemDark(true);
    localStorage.setItem("theme", "light");

    const { isDark } = await setup();

    expect(isDark.value).toBe(false);
    expect(html().classList.contains("dark")).toBe(false);
  });

  it("follows the system dark preference when nothing is stored", async () => {
    const matchMedia = mockSystemDark(true);

    const { isDark } = await setup();

    expect(matchMedia).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
    expect(isDark.value).toBe(true);
    expect(html().classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("follows the system light preference when nothing is stored", async () => {
    mockSystemDark(false);

    const { isDark } = await setup();

    expect(isDark.value).toBe(false);
    expect(html().classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("toggles between dark and light and persists the choice", async () => {
    mockSystemDark(false);
    const { isDark, toggle } = await setup();

    toggle();
    expect(isDark.value).toBe(true);
    expect(html().classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");

    toggle();
    expect(isDark.value).toBe(false);
    expect(html().classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
  });
});
