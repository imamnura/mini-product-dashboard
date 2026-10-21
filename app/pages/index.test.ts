import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, enableAutoUnmount } from "@vue/test-utils";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { clearNuxtState, useState } from "#imports";
import type { Product } from "~/composables/useProducts";
import IndexPage from "./index.vue";

const { fetchAll, fetchCategories } = vi.hoisted(() => ({
  fetchAll: vi.fn(),
  fetchCategories: vi.fn(),
}));
mockNuxtImport("useProducts", () => () => ({ fetchAll, fetchCategories }));

enableAutoUnmount(afterEach);

const makeProduct = (id: number, title: string, category: string): Product => ({
  id,
  title,
  price: id * 10,
  description: `${title} description`,
  category,
  image: `https://img/${id}.jpg`,
  rating: { rate: 4, count: id },
});

const products: Product[] = [
  makeProduct(1, "Laptop", "electronics"),
  makeProduct(2, "Monitor", "electronics"),
  makeProduct(3, "Gold Ring", "jewelery"),
  makeProduct(4, "Silver Ring", "jewelery"),
  makeProduct(5, "Jacket", "men's clothing"),
  makeProduct(6, "Hard Drive", "electronics"),
  makeProduct(7, "Dress", "women's clothing"),
  makeProduct(8, "Bracelet", "jewelery"),
  makeProduct(9, "T-Shirt", "men's clothing"),
];
const categories = ["electronics", "jewelery", "men's clothing"];

async function mountIndex() {
  const wrapper = await mountSuspended(IndexPage);
  await flushPromises();
  return wrapper;
}
type Wrapper = Awaited<ReturnType<typeof mountIndex>>;

const cardTitles = (w: Wrapper) => w.findAll("h3.line-clamp-2").map((h) => h.text());
const counter = (w: Wrapper) =>
  w.findAll("span.text-orange-500").map((s) => s.text());
const loadMoreButton = (w: Wrapper) =>
  w.findAll("button").find((b) => b.text() === "Muat lebih banyak");

describe("index page", () => {
  beforeEach(() => {
    clearNuxtState(undefined, { reset: false });
    fetchAll.mockReset().mockResolvedValue(products);
    fetchCategories.mockReset().mockResolvedValue(categories);
  });

  it("shows skeletons while loading", async () => {
    fetchAll.mockReturnValue(new Promise(() => {}));
    const wrapper = await mountSuspended(IndexPage);

    expect(wrapper.findAll(".animate-pulse")).toHaveLength(4);
    expect(loadMoreButton(wrapper)).toBeUndefined();
  });

  it("renders the hero banner", async () => {
    const wrapper = await mountIndex();

    expect(wrapper.find('img[src="/banner.png"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Discover Our Fall/Winter 2025 Collection");
  });

  it("shows the first page of products with the counter", async () => {
    const wrapper = await mountIndex();

    expect(wrapper.find("h3.text-2xl").text()).toBe("All Product");
    expect(cardTitles(wrapper)).toEqual([
      "Laptop",
      "Monitor",
      "Gold Ring",
      "Silver Ring",
    ]);
    expect(counter(wrapper)).toEqual(["1", "4", "9"]);
  });

  it("passes categories to the category filter", async () => {
    const wrapper = await mountIndex();

    const options = wrapper.findAll("select option").map((o) => o.text());
    expect(options).toEqual([
      "Categories",
      "Electronics",
      "Jewelery",
      "Men's clothing",
    ]);
  });

  it("loads more products until all are shown", async () => {
    const wrapper = await mountIndex();

    await loadMoreButton(wrapper)!.trigger("click");
    expect(cardTitles(wrapper)).toHaveLength(8);
    expect(counter(wrapper)).toEqual(["1", "8", "9"]);

    await loadMoreButton(wrapper)!.trigger("click");
    expect(cardTitles(wrapper)).toHaveLength(9);
    expect(counter(wrapper)).toEqual(["1", "9", "9"]);
    expect(loadMoreButton(wrapper)).toBeUndefined();
  });

  it("filters by the global search query", async () => {
    const wrapper = await mountIndex();

    useState("global:q").value = "  RING ";
    await flushPromises();

    expect(wrapper.find("h3.text-2xl").text()).toBe(
      "Search Results for “RING”"
    );
    expect(cardTitles(wrapper)).toEqual(["Gold Ring", "Silver Ring"]);
    expect(counter(wrapper)).toEqual(["1", "2", "2"]);
  });

  it("filters by the selected category", async () => {
    const wrapper = await mountIndex();

    await wrapper.find("select").setValue("electronics");

    expect(useState("nav:selectedCat").value).toBe("electronics");
    expect(wrapper.find("h3.text-2xl").text()).toBe("Electronics Product");
    expect(cardTitles(wrapper)).toEqual(["Laptop", "Monitor", "Hard Drive"]);
  });

  it("resets pagination when the filter changes", async () => {
    const wrapper = await mountIndex();
    await loadMoreButton(wrapper)!.trigger("click");

    await wrapper.find("select").setValue("jewelery");
    await wrapper.find("select").setValue("");

    expect(cardTitles(wrapper)).toHaveLength(4);
  });

  it("shows a message when nothing matches", async () => {
    const wrapper = await mountIndex();

    useState("global:q").value = "no such product";
    await flushPromises();

    expect(wrapper.text()).toContain("Tidak ada produk yang cocok.");
    expect(counter(wrapper)).toEqual(["0", "0", "0"]);
  });

  it("shows the error statusMessage when loading fails", async () => {
    fetchAll.mockRejectedValue({ statusMessage: "Gagal memuat produk" });
    const wrapper = await mountIndex();

    expect(wrapper.text()).toContain("⚠️ Gagal memuat produk");
    expect(wrapper.findAll(".animate-pulse")).toHaveLength(0);
  });

  it("shows a generic error when the failure has no statusMessage", async () => {
    fetchAll.mockRejectedValue(undefined);
    const wrapper = await mountIndex();

    expect(wrapper.text()).toContain("Terjadi kesalahan Fetch data");
  });
});
