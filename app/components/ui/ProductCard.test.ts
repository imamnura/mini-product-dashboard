import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import ProductCard from "./ProductCard.vue";
import type { Product } from "~/composables/useProducts";

const { addToCart } = vi.hoisted(() => ({ addToCart: vi.fn() }));
mockNuxtImport("useCart", () => () => ({ addToCart }));

const product: Product = {
  id: 7,
  title: "Test Product",
  price: 30,
  description: "This is a test product.",
  category: "electronics",
  image: "https://image.jpg",
  rating: { rate: 4.5, count: 10 },
};

function mountCard(p: Product = product) {
  return mountSuspended(ProductCard, { props: { p } });
}

describe("ProductCard", () => {
  beforeEach(() => {
    addToCart.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders title, price, capitalized category and rating", async () => {
    const wrapper = await mountCard();

    expect(wrapper.find("h3").text()).toBe("Test Product");
    expect(wrapper.text()).toContain("$ 30");
    expect(wrapper.text()).toContain("Electronics");
    expect(wrapper.text()).toContain("4.5");
    expect(wrapper.text()).toContain("(10)");
  });

  it("renders the product image with alt text", async () => {
    const wrapper = await mountCard();

    const img = wrapper.find("img");
    expect(img.attributes("src")).toBe(product.image);
    expect(img.attributes("alt")).toBe(product.title);
  });

  it("links to the product detail page", async () => {
    const wrapper = await mountCard();

    expect(wrapper.find("a").attributes("href")).toBe("/products/7");
  });

  it("shows fallbacks when the product has no rating", async () => {
    const { rating: _rating, ...noRating } = product;
    const wrapper = await mountCard(noRating);

    expect(wrapper.text()).toContain("-");
    expect(wrapper.text()).toContain("(0)");
  });

  it("adds the product to the cart and shows temporary feedback", async () => {
    const wrapper = await mountCard();
    vi.useFakeTimers();

    const button = wrapper.find("button");
    expect(button.text()).toBe("Add to Cart");

    await button.trigger("click");

    expect(addToCart).toHaveBeenCalledWith(product, 1);
    expect(button.text()).toBe("Added ✓");
    expect(button.classes()).toContain("!text-orange-500");

    await vi.advanceTimersByTimeAsync(1200);

    expect(button.text()).toBe("Add to Cart");
  });
});
