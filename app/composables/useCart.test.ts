import { beforeEach, describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { clearNuxtState } from "#imports";
import { useCart, type CartItem } from "./useCart";

const STORAGE_KEY = "cart:items";

const productA = { id: 1, title: "Product A", price: 10, image: "a.jpg" };
const productB = { id: 2, title: "Product B", price: 25.5, image: "b.jpg" };

async function setup() {
  let cart!: ReturnType<typeof useCart>;
  await mountSuspended(
    defineComponent({
      setup() {
        cart = useCart();
        return () => h("div");
      },
    })
  );
  return cart;
}

function stored(): CartItem[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
}

describe("useCart", () => {
  beforeEach(() => {
    localStorage.clear();
    clearNuxtState(undefined, { reset: false });
  });

  it("starts with an empty cart", async () => {
    const cart = await setup();

    expect(cart.items.value).toEqual([]);
    expect(cart.totalItems.value).toBe(0);
    expect(cart.totalPrice.value).toBe(0);
  });

  it("adds a new product with default qty 1 and persists it", async () => {
    const cart = await setup();

    cart.addToCart(productA);

    expect(cart.items.value).toEqual([{ ...productA, qty: 1 }]);
    expect(stored()).toEqual([{ ...productA, qty: 1 }]);
  });

  it("only stores the cart fields of the product", async () => {
    const cart = await setup();

    cart.addToCart({ ...productA, description: "extra" } as typeof productA);

    expect(cart.items.value[0]).toEqual({ ...productA, qty: 1 });
  });

  it("increments qty when the product already exists", async () => {
    const cart = await setup();

    cart.addToCart(productA, 2);
    cart.addToCart(productA, 3);

    expect(cart.items.value).toHaveLength(1);
    expect(cart.items.value[0]!.qty).toBe(5);
    expect(stored()[0]!.qty).toBe(5);
  });

  it("computes totalItems and totalPrice", async () => {
    const cart = await setup();

    cart.addToCart(productA, 2);
    cart.addToCart(productB, 1);

    expect(cart.totalItems.value).toBe(3);
    expect(cart.totalPrice.value).toBe(45.5);
  });

  it("removes a product from the cart", async () => {
    const cart = await setup();
    cart.addToCart(productA);
    cart.addToCart(productB);

    cart.removeFromCart(productA.id);

    expect(cart.items.value.map((i) => i.id)).toEqual([productB.id]);
    expect(stored().map((i) => i.id)).toEqual([productB.id]);
  });

  it("updates qty of an existing product", async () => {
    const cart = await setup();
    cart.addToCart(productA);

    cart.updateQty(productA.id, 4);

    expect(cart.items.value[0]!.qty).toBe(4);
    expect(stored()[0]!.qty).toBe(4);
  });

  it("removes the product when qty is updated to 0 or less", async () => {
    const cart = await setup();
    cart.addToCart(productA);
    cart.addToCart(productB);

    cart.updateQty(productA.id, 0);
    cart.updateQty(productB.id, -1);

    expect(cart.items.value).toEqual([]);
  });

  it("ignores updateQty for an unknown product", async () => {
    const cart = await setup();
    cart.addToCart(productA);
    localStorage.removeItem(STORAGE_KEY);

    cart.updateQty(999, 3);

    expect(cart.items.value).toEqual([{ ...productA, qty: 1 }]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("clears the cart", async () => {
    const cart = await setup();
    cart.addToCart(productA);
    cart.addToCart(productB);

    cart.clearCart();

    expect(cart.items.value).toEqual([]);
    expect(stored()).toEqual([]);
  });

  describe("hydration", () => {
    it("loads items from localStorage on mount", async () => {
      const saved: CartItem[] = [{ ...productB, qty: 3 }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

      const cart = await setup();

      expect(cart.items.value).toEqual(saved);
      expect(cart.totalItems.value).toBe(3);
    });

    it("hydrates only once across multiple consumers", async () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([{ ...productA, qty: 1 }])
      );
      const first = await setup();
      first.addToCart(productB);
      // ubah storage setelah hydrate pertama; consumer kedua tidak boleh membaca ulang
      localStorage.setItem(STORAGE_KEY, "[]");

      const second = await setup();

      expect(second.items.value.map((i) => i.id)).toEqual([1, 2]);
    });

    it("falls back to an empty cart when stored data is invalid JSON", async () => {
      localStorage.setItem(STORAGE_KEY, "{not-json");

      const cart = await setup();

      expect(cart.items.value).toEqual([]);
    });
  });
});
