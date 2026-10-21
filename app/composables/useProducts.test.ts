import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { clearNuxtState } from "#imports";
import { useProducts, type Product } from "./useProducts";

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));
mockNuxtImport("$fetch", () => fetchMock);

const BASE = "https://fakestoreapi.com";

const product: Product = {
  id: 1,
  title: "Backpack",
  price: 109.95,
  description: "A backpack",
  category: "men's clothing",
  image: "https://img/1.jpg",
  rating: { rate: 3.9, count: 120 },
};

describe("useProducts", () => {
  beforeEach(() => {
    clearNuxtState(undefined, { reset: false });
    fetchMock.mockReset();
  });

  describe("fetchAll", () => {
    it("fetches all products from the API", async () => {
      fetchMock.mockResolvedValue([product]);

      const result = await useProducts().fetchAll();

      expect(fetchMock).toHaveBeenCalledWith(`${BASE}/products`);
      expect(result).toEqual([product]);
    });

    it("returns cached products on subsequent calls", async () => {
      fetchMock.mockResolvedValue([product]);
      const { fetchAll } = useProducts();

      await fetchAll();
      const second = await useProducts().fetchAll();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(second).toEqual([product]);
    });

    it("throws a 500 error when the request fails", async () => {
      fetchMock.mockRejectedValue(new Error("network"));

      await expect(useProducts().fetchAll()).rejects.toMatchObject({
        statusCode: 500,
        statusMessage: "Gagal memuat produk",
      });
    });
  });

  describe("fetchById", () => {
    it("fetches a single product", async () => {
      fetchMock.mockResolvedValue(product);

      const result = await useProducts().fetchById(1);

      expect(fetchMock).toHaveBeenCalledWith(`${BASE}/products/1`);
      expect(result).toEqual(product);
    });

    it("throws a 404 error when the request fails", async () => {
      fetchMock.mockRejectedValue(new Error("not found"));

      await expect(useProducts().fetchById("99")).rejects.toMatchObject({
        statusCode: 404,
        statusMessage: "Produk tidak ditemukan",
      });
    });
  });

  describe("fetchByCategory", () => {
    it("fetches products of a category", async () => {
      fetchMock.mockResolvedValue([product]);

      const result = await useProducts().fetchByCategory("electronics");

      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE}/products/category/electronics`
      );
      expect(result).toEqual([product]);
    });

    it("caches results per category", async () => {
      fetchMock.mockResolvedValue([product]);
      const { fetchByCategory } = useProducts();

      await fetchByCategory("electronics");
      await fetchByCategory("electronics");
      await fetchByCategory("jewelery");

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("throws a 500 error when the request fails", async () => {
      fetchMock.mockRejectedValue(new Error("network"));

      await expect(
        useProducts().fetchByCategory("electronics")
      ).rejects.toMatchObject({
        statusCode: 500,
        statusMessage: "Gagal memuat kategori",
      });
    });
  });

  describe("fetchCategories", () => {
    it("fetches the list of categories", async () => {
      fetchMock.mockResolvedValue(["electronics", "jewelery"]);

      const result = await useProducts().fetchCategories();

      expect(fetchMock).toHaveBeenCalledWith(`${BASE}/products/categories`);
      expect(result).toEqual(["electronics", "jewelery"]);
    });

    it("returns an empty list when the request fails", async () => {
      fetchMock.mockRejectedValue(new Error("network"));

      await expect(useProducts().fetchCategories()).resolves.toEqual([]);
    });
  });
});
