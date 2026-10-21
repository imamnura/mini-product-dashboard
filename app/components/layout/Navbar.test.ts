import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { reactive } from "vue";
import { enableAutoUnmount } from "@vue/test-utils";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { clearNuxtState, useState } from "#imports";
import Navbar from "./Navbar.vue";

const { fetchCategories, navigateToMock, route } = vi.hoisted(() => ({
  fetchCategories: vi.fn(),
  navigateToMock: vi.fn(),
  route: { fullPath: "/" },
}));
const reactiveRoute = reactive(route);

mockNuxtImport("useProducts", () => () => ({ fetchCategories }));
mockNuxtImport("navigateTo", () => navigateToMock);
mockNuxtImport("useRoute", () => () => reactiveRoute);

enableAutoUnmount(afterEach);

const categories = [
  "electronics",
  "jewelery",
  "men's clothing",
  "Café   latte",
  "   ",
];

function mountNavbar() {
  return mountSuspended(Navbar, {
    slots: { search: () => "SEARCH-SLOT" },
  });
}

const html = () => document.documentElement;
const desktopCats = (w: Awaited<ReturnType<typeof mountNavbar>>) =>
  w.findAll("nav button");
const mobileCats = (w: Awaited<ReturnType<typeof mountNavbar>>) =>
  w.findAll("#mobile-menu .flex-wrap button");
const hamburger = (w: Awaited<ReturnType<typeof mountNavbar>>) =>
  w.find('button[aria-label="Toggle navigation"]');

describe("Navbar", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("theme", "light");
    html().classList.remove("dark", "overflow-hidden");
    clearNuxtState(undefined, { reset: false });
    fetchCategories.mockReset().mockResolvedValue(categories);
    navigateToMock.mockReset();
    reactiveRoute.fullPath = "/";
  });

  it("renders the brand and the search slot", async () => {
    const wrapper = await mountNavbar();

    expect(wrapper.find("a").text()).toBe("Orange Store");
    expect(wrapper.text()).toContain("SEARCH-SLOT");
  });

  it("renders categories with a short label (first word, normalized)", async () => {
    const wrapper = await mountNavbar();

    expect(desktopCats(wrapper).map((b) => b.text())).toEqual([
      "Electronics",
      "Jewelery",
      "Men",
      "Cafe",
      "",
    ]);
    expect(mobileCats(wrapper).map((b) => b.text())).toEqual([
      "electronics",
      "jewelery",
      "men",
      "cafe",
      "",
    ]);
    expect(desktopCats(wrapper)[2]!.attributes("aria-label")).toBe(
      "Filter category men's clothing"
    );
  });

  it("renders no categories when none are returned", async () => {
    fetchCategories.mockResolvedValue([]);
    const wrapper = await mountNavbar();

    expect(desktopCats(wrapper)).toHaveLength(0);
  });

  it("selects a category from the desktop menu and navigates home", async () => {
    const wrapper = await mountNavbar();

    await desktopCats(wrapper)[1]!.trigger("click");

    expect(useState("nav:selectedCat").value).toBe("jewelery");
    expect(navigateToMock).toHaveBeenCalledWith("/");
    expect(desktopCats(wrapper)[1]!.classes()).toContain("text-orange-500");
  });

  it("selects a category from the mobile menu and closes it", async () => {
    const wrapper = await mountNavbar();
    await hamburger(wrapper).trigger("click");

    await mobileCats(wrapper)[0]!.trigger("click");

    expect(useState("nav:selectedCat").value).toBe("electronics");
    expect(navigateToMock).toHaveBeenCalledWith("/");
    expect(hamburger(wrapper).attributes("aria-expanded")).toBe("false");
    expect(mobileCats(wrapper)[0]!.classes()).toContain("text-orange-600");
  });

  it("resets category and search when the brand is clicked", async () => {
    const wrapper = await mountNavbar();
    useState("nav:selectedCat").value = "jewelery";
    useState("global:q").value = "ring";

    await wrapper.find("a").trigger("click");

    expect(useState("nav:selectedCat").value).toBe("");
    expect(useState("global:q").value).toBe("");
    expect(navigateToMock).toHaveBeenCalledWith("/");
  });

  describe("cart badge", () => {
    it("is hidden when the cart is empty", async () => {
      const wrapper = await mountNavbar();

      expect(wrapper.findAll('a[aria-label="View cart"] span')).toHaveLength(0);
    });

    it("shows the total item count", async () => {
      localStorage.setItem(
        "cart:items",
        JSON.stringify([
          { id: 1, title: "A", price: 1, image: "a", qty: 2 },
          { id: 2, title: "B", price: 1, image: "b", qty: 3 },
        ])
      );
      const wrapper = await mountNavbar();

      const badges = wrapper.findAll('a[aria-label="View cart"] span');
      expect(badges).toHaveLength(2);
      expect(badges.map((b) => b.text())).toEqual(["5", "5"]);
    });
  });

  describe("theme toggle", () => {
    it("switches between dark and light mode", async () => {
      const wrapper = await mountNavbar();
      const desktopToggle = wrapper.find("div.hidden.md\\:flex > button.btn");
      expect(desktopToggle.text()).toBe("🌙");
      expect(wrapper.find("#mobile-menu").text()).toContain(
        "Enable Dark Mode"
      );

      await desktopToggle.trigger("click");

      expect(html().classList.contains("dark")).toBe(true);
      expect(desktopToggle.text()).toBe("☀️");
      expect(wrapper.find("#mobile-menu").text()).toContain(
        "Disable Dark Mode"
      );

      await wrapper.find("#mobile-menu .pt-2 button").trigger("click");

      expect(html().classList.contains("dark")).toBe(false);
    });
  });

  describe("mobile menu", () => {
    it("is closed by default", async () => {
      const wrapper = await mountNavbar();

      expect(wrapper.find("#mobile-menu").isVisible()).toBe(false);
      expect(hamburger(wrapper).attributes("aria-expanded")).toBe("false");
      expect(hamburger(wrapper).text()).toBe("☰");
    });

    it("opens and closes with the hamburger and locks page scroll", async () => {
      const wrapper = await mountNavbar();

      await hamburger(wrapper).trigger("click");

      expect(wrapper.find("#mobile-menu").isVisible()).toBe(true);
      expect(hamburger(wrapper).attributes("aria-expanded")).toBe("true");
      expect(hamburger(wrapper).text()).toBe("✕");
      expect(html().classList.contains("overflow-hidden")).toBe(true);

      await hamburger(wrapper).trigger("click");

      expect(wrapper.find("#mobile-menu").isVisible()).toBe(false);
      expect(html().classList.contains("overflow-hidden")).toBe(false);
    });

    it("closes when the backdrop is clicked", async () => {
      const wrapper = await mountNavbar();
      await hamburger(wrapper).trigger("click");

      await wrapper.find("#mobile-menu > div.fixed.inset-0").trigger("click");

      expect(hamburger(wrapper).attributes("aria-expanded")).toBe("false");
    });

    it("closes on Escape but not on other keys", async () => {
      const wrapper = await mountNavbar();
      await hamburger(wrapper).trigger("click");

      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      await wrapper.vm.$nextTick();
      expect(hamburger(wrapper).attributes("aria-expanded")).toBe("true");

      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await wrapper.vm.$nextTick();
      expect(hamburger(wrapper).attributes("aria-expanded")).toBe("false");
    });

    it("closes when the route changes", async () => {
      const wrapper = await mountNavbar();
      await hamburger(wrapper).trigger("click");

      reactiveRoute.fullPath = "/cart";
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      expect(hamburger(wrapper).attributes("aria-expanded")).toBe("false");
    });

    it("removes the keydown listener on unmount", async () => {
      const removeSpy = vi.spyOn(window, "removeEventListener");
      const wrapper = await mountNavbar();

      wrapper.unmount();

      expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    });
  });
});
