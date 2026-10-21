import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enableAutoUnmount, flushPromises } from "@vue/test-utils";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import {
  clearNuxtData,
  clearNuxtState,
  refreshNuxtData,
  useState,
} from "#imports";
import type { Product } from "~/composables/useProducts";
import CategoryPage from "./[slug].vue";

const { fetchByCategory, navigateToMock } = vi.hoisted(() => ({
  fetchByCategory: vi.fn(),
  navigateToMock: vi.fn(),
}));
mockNuxtImport("useProducts", () => () => ({ fetchByCategory }));
mockNuxtImport("navigateTo", () => navigateToMock);

enableAutoUnmount(afterEach);

const makeProduct = (id: number): Product => ({
  id,
  title: `Product ${id}`,
  price: id,
  description: "desc",
  category: "electronics",
  image: `https://img/${id}.jpg`,
});
const products = [1, 2, 3, 4, 5, 6].map(makeProduct);

function mountCategory(slug = "electronics") {
  return mountSuspended(CategoryPage, { route: `/category/${slug}` });
}
type Wrapper = Awaited<ReturnType<typeof mountCategory>>;

const cardTitles = (w: Wrapper) =>
  w.findAll("h3.line-clamp-2").map((h) => h.text());
const counter = (w: Wrapper) =>
  w.findAll("span.text-orange-500").map((s) => s.text());
const loadMoreButton = (w: Wrapper) =>
  w.findAll("button").find((b) => b.text() === "Muat lebih banyak");

describe("category page", () => {
  beforeEach(() => {
    clearNuxtState(undefined, { reset: false });
    clearNuxtData();
    fetchByCategory.mockReset().mockResolvedValue(products);
    navigateToMock.mockReset();
  });

  it("fetches products for the slug in the route", async () => {
    await mountCategory("jewelery");

    expect(fetchByCategory).toHaveBeenCalledWith("jewelery");
  });

  it("renders breadcrumb and heading with the slug", async () => {
    const wrapper = await mountCategory();

    expect(wrapper.find("nav").text()).toContain("Home");
    expect(wrapper.find("nav span.capitalize").text()).toBe("electronics");
    expect(wrapper.find("h2").text()).toBe("Search Results For “electronics”");
  });

  it("sets the page title from the slug", async () => {
    await mountCategory();

    await vi.waitFor(() =>
      expect(document.title).toBe("Electronics Products - Orange Store")
    );
    expect(
      document.querySelector('meta[name="description"]')?.getAttribute("content")
    ).toBe("Explore all Electronics products on Orange Store.");
  });

  it("shows the first page of products with the counter", async () => {
    const wrapper = await mountCategory();

    expect(cardTitles(wrapper)).toEqual([
      "Product 1",
      "Product 2",
      "Product 3",
      "Product 4",
    ]);
    expect(counter(wrapper)).toEqual(["1", "4", "6"]);
  });

  it("loads more products until all are shown", async () => {
    const wrapper = await mountCategory();

    await loadMoreButton(wrapper)!.trigger("click");

    expect(cardTitles(wrapper)).toHaveLength(6);
    expect(counter(wrapper)).toEqual(["1", "6", "6"]);
    expect(loadMoreButton(wrapper)).toBeUndefined();
  });

  it("shows zero counters when the category is empty", async () => {
    fetchByCategory.mockResolvedValue([]);
    const wrapper = await mountCategory();

    expect(cardTitles(wrapper)).toEqual([]);
    expect(counter(wrapper)).toEqual(["0", "0", "0"]);
  });

  it("shows skeletons while refreshing", async () => {
    const wrapper = await mountCategory();
    fetchByCategory.mockReturnValue(new Promise(() => {}));

    refreshNuxtData("cat-electronics");
    await flushPromises();

    expect(wrapper.findAll(".animate-pulse")).toHaveLength(4);
    expect(loadMoreButton(wrapper)).toBeUndefined();
  });

  it("shows the error statusMessage when fetching fails", async () => {
    fetchByCategory.mockRejectedValue(
      createError({ statusCode: 500, statusMessage: "Gagal memuat kategori" })
    );
    const wrapper = await mountCategory();

    expect(wrapper.text()).toContain("Gagal memuat kategori");
    expect(cardTitles(wrapper)).toEqual([]);
  });

  it("shows a generic error when the failure has no statusMessage", async () => {
    fetchByCategory.mockRejectedValue(new Error("boom"));
    const wrapper = await mountCategory();

    expect(wrapper.find(".text-red-600").text()).toBe("Terjadi kesalahan");
  });

  it("resets filters and navigates home from the breadcrumb", async () => {
    const wrapper = await mountCategory();
    useState("nav:selectedCat").value = "electronics";
    useState("global:q").value = "laptop";

    await wrapper.find("nav a").trigger("click");

    expect(useState("nav:selectedCat").value).toBe("");
    expect(useState("global:q").value).toBe("");
    expect(navigateToMock).toHaveBeenCalledWith("/");
  });
});
