export type CartItem = {
  id: number;
  title: string;
  price: number;
  image: string;
  qty: number;
};

const STORAGE_KEY = "cart:items";

export function useCart() {
  const items = useState<CartItem[]>("cart:items", () => []);
  const hydrated = useState("cart:hydrated", () => false);

  function persist() {
    if (!process.client) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value));
  }

  function hydrate() {
    if (!process.client || hydrated.value) return;
    hydrated.value = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) items.value = JSON.parse(raw);
    } catch {
      items.value = [];
    }
  }

  onMounted(hydrate);

  function addToCart(
    product: { id: number; title: string; price: number; image: string },
    qty = 1
  ) {
    const existing = items.value.find((i) => i.id === product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      items.value.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        qty,
      });
    }
    persist();
  }

  function removeFromCart(id: number) {
    items.value = items.value.filter((i) => i.id !== id);
    persist();
  }

  function updateQty(id: number, qty: number) {
    const item = items.value.find((i) => i.id === id);
    if (!item) return;
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    item.qty = qty;
    persist();
  }

  function clearCart() {
    items.value = [];
    persist();
  }

  const totalItems = computed(() =>
    items.value.reduce((sum, i) => sum + i.qty, 0)
  );
  const totalPrice = computed(() =>
    items.value.reduce((sum, i) => sum + i.qty * i.price, 0)
  );

  return {
    items,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    totalItems,
    totalPrice,
  };
}
