<script setup lang="ts">
useHead({
  title: "Your Cart – Orange Store",
  meta: [{ name: "description", content: "Review items in your cart" }],
});

const { items, updateQty, removeFromCart, clearCart, totalPrice } = useCart();

const checkedOut = ref(false);
function checkout() {
  checkedOut.value = true;
  clearCart();
  setTimeout(() => (checkedOut.value = false), 3000);
}
</script>

<template>
  <main
    class="container my-6 bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 min-h-screen"
  >
    <h1 class="text-2xl font-semibold text-[#2C2C2C] dark:text-white mb-6">
      Your Cart
    </h1>

    <div
      v-if="checkedOut"
      class="rounded-xl border p-6 mb-6 text-green-600 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/40"
    >
      ✅ Order placed! Thank you for shopping with us.
    </div>

    <div
      v-if="items.length === 0 && !checkedOut"
      class="rounded-2xl border border-zinc-200 dark:border-zinc-700 p-10 text-center space-y-3"
    >
      <p class="text-zinc-500">Your cart is empty.</p>
      <NuxtLink to="/" class="btn inline-flex">Continue Shopping</NuxtLink>
    </div>

    <div v-else-if="items.length" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-4">
        <div
          v-for="item in items"
          :key="item.id"
          class="flex gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-4"
        >
          <div
            class="h-24 w-24 shrink-0 rounded-xl bg-[#EEF2F7] dark:bg-zinc-800 grid place-items-center"
          >
            <img
              :src="item.image"
              :alt="item.title"
              class="max-h-16 object-contain"
            />
          </div>

          <div class="flex-1 min-w-0 space-y-2">
            <NuxtLink
              :to="`/products/${item.id}`"
              class="line-clamp-2 text-sm font-medium hover:underline"
            >
              {{ item.title }}
            </NuxtLink>
            <p class="font-bold text-[#2C2C2C] dark:text-orange-500">
              $ {{ item.price }}
            </p>

            <div class="flex items-center justify-between gap-3">
              <div
                class="inline-flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700"
              >
                <button
                  class="h-8 w-8 grid place-items-center hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  @click="updateQty(item.id, item.qty - 1)"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span class="w-8 text-center text-sm">{{ item.qty }}</span>
                <button
                  class="h-8 w-8 grid place-items-center hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  @click="updateQty(item.id, item.qty + 1)"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                class="text-xs text-red-500 hover:underline"
                @click="removeFromCart(item.id)"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        <button class="text-sm text-zinc-500 hover:underline" @click="clearCart">
          Clear cart
        </button>
      </div>

      <aside
        class="rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 h-fit space-y-4"
      >
        <h2 class="font-semibold">Order Summary</h2>
        <div class="flex justify-between text-sm text-zinc-500">
          <span>Subtotal</span>
          <span>$ {{ totalPrice.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between font-bold text-lg pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <span>Total</span>
          <span>$ {{ totalPrice.toFixed(2) }}</span>
        </div>
        <button
          class="w-full inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition"
          @click="checkout"
        >
          Checkout
        </button>
      </aside>
    </div>
  </main>
</template>
