import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enableAutoUnmount } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { clearNuxtState } from "#imports";
import CartPage from "./cart.vue";

enableAutoUnmount(afterEach);

const items = [
  { id: 1, title: "Backpack", price: 10.5, image: "a.jpg", qty: 2 },
  { id: 2, title: "Shirt", price: 20, image: "b.jpg", qty: 1 },
];

function seedCart(data = items) {
  localStorage.setItem("cart:items", JSON.stringify(data));
}

const mountCart = () => mountSuspended(CartPage);
type Wrapper = Awaited<ReturnType<typeof mountCart>>;

const rows = (w: Wrapper) => w.findAll(".lg\\:col-span-2 > div.flex");
const buttonByText = (
  w: Pick<Wrapper, "findAll">,
  text: string
) => w.findAll("button").find((b) => b.text() === text)!;

describe("cart page", () => {
  beforeEach(() => {
    localStorage.clear();
    clearNuxtState(undefined, { reset: false });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the empty state when the cart is empty", async () => {
    const wrapper = await mountCart();

    expect(wrapper.find("h1").text()).toBe("Your Cart");
    expect(wrapper.text()).toContain("Your cart is empty.");
    const link = wrapper.find("a");
    expect(link.text()).toBe("Continue Shopping");
    expect(link.attributes("href")).toBe("/");
  });

  it("lists cart items with links, prices and quantities", async () => {
    seedCart();
    const wrapper = await mountCart();

    expect(rows(wrapper)).toHaveLength(2);
    const first = rows(wrapper)[0]!;
    expect(first.find("a").text()).toBe("Backpack");
    expect(first.find("a").attributes("href")).toBe("/products/1");
    expect(first.find("img").attributes("src")).toBe("a.jpg");
    expect(first.text()).toContain("$ 10.5");
    expect(first.find("span.w-8").text()).toBe("2");
  });

  it("shows subtotal and total", async () => {
    seedCart();
    const wrapper = await mountCart();

    const summary = wrapper.find("aside");
    expect(summary.text()).toContain("Order Summary");
    expect(summary.text().match(/\$ 41\.00/g)).toHaveLength(2);
  });

  it("increases and decreases quantity", async () => {
    seedCart();
    const wrapper = await mountCart();
    const first = rows(wrapper)[0]!;

    await first.find('button[aria-label="Increase quantity"]').trigger("click");
    expect(first.find("span.w-8").text()).toBe("3");

    await first.find('button[aria-label="Decrease quantity"]').trigger("click");
    expect(first.find("span.w-8").text()).toBe("2");
  });

  it("removes an item when its quantity drops to zero", async () => {
    seedCart();
    const wrapper = await mountCart();

    await rows(wrapper)[1]!
      .find('button[aria-label="Decrease quantity"]')
      .trigger("click");

    expect(rows(wrapper)).toHaveLength(1);
    expect(rows(wrapper)[0]!.text()).toContain("Backpack");
  });

  it("removes an item with the Remove button", async () => {
    seedCart();
    const wrapper = await mountCart();

    await buttonByText(rows(wrapper)[0]!, "Remove").trigger("click");

    expect(rows(wrapper)).toHaveLength(1);
    expect(rows(wrapper)[0]!.text()).toContain("Shirt");
  });

  it("clears the cart", async () => {
    seedCart();
    const wrapper = await mountCart();

    await buttonByText(wrapper, "Clear cart").trigger("click");

    expect(wrapper.text()).toContain("Your cart is empty.");
  });

  it("checks out, shows a confirmation and then the empty state", async () => {
    seedCart();
    const wrapper = await mountCart();
    vi.useFakeTimers();

    await buttonByText(wrapper, "Checkout").trigger("click");

    expect(wrapper.text()).toContain("Order placed!");
    expect(wrapper.text()).not.toContain("Your cart is empty.");
    expect(rows(wrapper)).toHaveLength(0);
    expect(JSON.parse(localStorage.getItem("cart:items")!)).toEqual([]);

    await vi.advanceTimersByTimeAsync(3000);

    expect(wrapper.text()).not.toContain("Order placed!");
    expect(wrapper.text()).toContain("Your cart is empty.");
  });
});
