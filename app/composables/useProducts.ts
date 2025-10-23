type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: { rate: number; count: number };
};

export function useProducts() {
  const config = useRuntimeConfig();
  const base = config.public.API_BASE;

  /** cache sederhana per routeKey */
  const cache = useState<Record<string, Product[]>>("cache", () => ({}));

  async function fetchAll(): Promise<Product[]> {
    const key = "all";
    if (cache.value[key]) return cache.value[key];
    try {
      const data = await $fetch<Product[]>(`${base}/products`);
      cache.value[key] = data;
      return data;
    } catch (e) {
      throw createError({
        statusCode: 500,
        statusMessage: "Gagal memuat produk",
      });
    }
  }

  async function fetchById(id: string | number): Promise<Product> {
    try {
      return await $fetch<Product>(`${base}/products/${id}`);
    } catch {
      throw createError({
        statusCode: 404,
        statusMessage: "Produk tidak ditemukan",
      });
    }
  }

  async function fetchByCategory(slug: string): Promise<Product[]> {
    const key = `cat:${slug}`;
    if (cache.value[key]) return cache.value[key];
    try {
      const data = await $fetch<Product[]>(`${base}/products/category/${slug}`);
      cache.value[key] = data;
      return data;
    } catch {
      throw createError({
        statusCode: 500,
        statusMessage: "Gagal memuat kategori",
      });
    }
  }

  async function fetchCategories(): Promise<string[]> {
    try {
      return await $fetch<string[]>(`${base}/products/categories`);
    } catch {
      return [];
    }
  }

  return { fetchAll, fetchById, fetchByCategory, fetchCategories };
}
