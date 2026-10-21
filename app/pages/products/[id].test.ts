import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enableAutoUnmount, flushPromises } from "@vue/test-utils";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { clearNuxtData, refreshNuxtData } from "#imports";
import type { Product } from "~/composables/useProducts";
import ProductPage from "./[id].vue";

const { fetchById, addToCart } = vi.hoisted(() => ({
  fetchById: vi.fn(),
  addToCart: vi.fn(),
}));
mockNuxtImport("useProducts", () => () => ({ fetchById }));
mockNuxtImport("useCart", () => () => ({ addToCart }));

enableAutoUnmount(afterEach);

const product: Product = {
  id: 3,
  title: "Mens Cotton Jacket",
  price: 55.99,
  description: "Great outerwear jacket",
  category: "men's clothing",
  image: "https://img/3.jpg",
  rating: { rate: 4.7, count: 500 },
};

function mountProduct(id = "3") {
  return mountSuspended(ProductPage, { route: `/products/${id}` });
}
type Wrapper = Awaited<ReturnType<typeof mountProduct>>;

const qty = (w: Wrapper) => w.find("span.w-10").text();
const addButton = (w: Wrapper) => w.find("button.flex-1");
const meta = (selector: string) =>
  document.querySelector(selector)?.getAttribute("content");

describe("product detail page", () => {
  beforeEach(() => {
    clearNuxtData();
    fetchById.mockReset().mockResolvedValue(product);
    addToCart.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fetches the product for the id in the route", async () => {
    await mountProduct("3");

    expect(fetchById).toHaveBeenCalledWith("3");
  });

  it("renders product details", async () => {
    const wrapper = await mountProduct();

    expect(wrapper.find("h1").text()).toBe(product.title);
    expect(wrapper.text()).toContain("$ 55.99");
    expect(wrapper.text()).toContain("4.7");
    expect(wrapper.text()).toContain("(500)");
    expect(wrapper.text()).toContain(product.description);
    const img = wrapper.find("img");
    expect(img.attributes("src")).toBe(product.image);
    expect(img.attributes("alt")).toBe(product.title);
  });

  it("renders a breadcrumb with the category link", async () => {
    const wrapper = await mountProduct();

    const links = wrapper.findAll("nav a");
    expect(links.map((a) => a.text())).toEqual(["Home", "men's clothing"]);
    expect(decodeURI(links[1]!.attributes("href")!)).toBe(
      "/category/men's clothing"
    );
    expect(wrapper.find("nav > span:last-child").text()).toBe(product.title);
  });

  it("sets SEO meta from the product", async () => {
    await mountProduct();

    await vi.waitFor(() =>
      expect(document.title).toBe("Mens Cotton Jacket – Orange Store")
    );
    expect(meta('meta[name="description"]')).toBe(product.description);
    expect(meta('meta[property="og:image"]')).toBe(product.image);
  });

  it("increments and decrements quantity without going below 1", async () => {
    const wrapper = await mountProduct();
    const dec = wrapper.find('button[aria-label="Decrease quantity"]');
    const inc = wrapper.find('button[aria-label="Increase quantity"]');
    expect(qty(wrapper)).toBe("1");

    await dec.trigger("click");
    expect(qty(wrapper)).toBe("1");

    await inc.trigger("click");
    await inc.trigger("click");
    expect(qty(wrapper)).toBe("3");

    await dec.trigger("click");
    expect(qty(wrapper)).toBe("2");
  });

  it("adds the selected quantity to the cart with temporary feedback", async () => {
    const wrapper = await mountProduct();
    await wrapper
      .find('button[aria-label="Increase quantity"]')
      .trigger("click");
    vi.useFakeTimers();

    await addButton(wrapper).trigger("click");

    expect(addToCart).toHaveBeenCalledWith(product, 2);
    expect(addButton(wrapper).text()).toBe("Added to Cart ✓");
    expect(addButton(wrapper).classes()).toContain("!bg-green-600");

    await vi.advanceTimersByTimeAsync(1500);

    expect(addButton(wrapper).text()).toBe("Add to Cart");
  });

  it("shows skeletons while refreshing", async () => {
    const wrapper = await mountProduct();
    fetchById.mockReturnValue(new Promise(() => {}));

    refreshNuxtData("product-3");
    await flushPromises();

    expect(wrapper.findAll(".animate-pulse")).toHaveLength(2);
  });

  it("shows the error statusMessage when the product is not found", async () => {
    fetchById.mockRejectedValue(
      createError({ statusCode: 404, statusMessage: "Produk tidak ditemukan" })
    );
    const wrapper = await mountProduct("99");

    expect(wrapper.find(".text-red-600").text()).toBe(
      "⚠️ Produk tidak ditemukan"
    );
    expect(wrapper.findAll("nav a")).toHaveLength(1);
    expect(wrapper.find("nav > span:last-child").text()).toBe("...");
  });

  it("shows a generic error when the failure has no statusMessage", async () => {
    fetchById.mockRejectedValue(new Error("boom"));
    const wrapper = await mountProduct("98");

    expect(wrapper.find(".text-red-600").text()).toBe("⚠️ Terjadi kesalahan");
  });

  it("falls back to default SEO meta and ignores add when there is no product", async () => {
    fetchById.mockResolvedValue(null);
    const wrapper = await mountProduct("97");

    await vi.waitFor(() =>
      expect(document.title).toBe("Product Detail – Orange Store")
    );
    expect(meta('meta[name="description"]')).toBe("Product details and specs");
    expect(meta('meta[property="og:title"]')).toBe("Product Detail");
    expect(meta('meta[property="og:description"]')).toBe(
      "Product information"
    );
    expect(meta('meta[property="og:image"]')).toBe(
      "https://placehold.co/600x400"
    );

    await addButton(wrapper).trigger("click");

    expect(addToCart).not.toHaveBeenCalled();
    expect(addButton(wrapper).text()).toBe("Add to Cart");
  });
});
