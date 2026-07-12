<template>
  <NuxtLink
    :to="`/products/${p.id}`"
    class="group block rounded-2xl border overflow-hidden hover:shadow-sm transition border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
  >
    <div
      class="aspect-square bg-[#EEF2F7] dark:bg-zinc-800 grid place-items-center"
    >
      <img
        :src="p.image"
        :alt="p.title"
        loading="lazy"
        class="max-h-40 object-contain transition group-hover:scale-105"
      />
    </div>
    <div class="p-3 space-y-1">
      <div class="flex items-center gap-2">
        <p class="text-base text-black font-light dark:text-zinc-400">
          {{ capitalize(p.category) }}
        </p>

        <div class="badge">
          <span
            ><svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.75001 7.27883C0.800779 7.49888 0.94112 7.65269 1.0898 7.80421C2.1846 8.91893 3.27542 10.0378 4.37385 11.1488C4.49315 11.2694 4.52507 11.384 4.49787 11.5477C4.22734 13.1791 3.96298 14.812 3.69209 16.4433C3.64639 16.7182 3.70043 16.9508 3.9133 17.1202C4.13378 17.2957 4.37058 17.2809 4.60992 17.1488C6.0126 16.3732 7.4171 15.6015 8.8176 14.8226C8.95069 14.7484 9.05296 14.7522 9.18423 14.8253C10.5746 15.5981 11.9686 16.3633 13.3596 17.1343C13.5268 17.2272 13.6969 17.2744 13.8811 17.2283C14.1738 17.1556 14.3714 16.8396 14.3188 16.5145C14.09 15.0998 13.8561 13.6862 13.6247 12.2722C13.5798 11.9981 13.5406 11.7232 13.4916 11.4499C13.4742 11.3521 13.4967 11.2839 13.5649 11.2146C14.6981 10.0599 15.8288 8.90218 16.9624 7.74787C17.1285 7.57883 17.2663 7.39876 17.2486 7.14178C17.2272 6.83302 17.0121 6.60383 16.697 6.55548C15.6602 6.39711 14.6231 6.24368 13.5859 6.08683C13.0198 6.00117 12.4545 5.90827 11.8881 5.82794C11.7604 5.80967 11.7216 5.72096 11.6759 5.62426C11.1958 4.60282 10.7153 3.58175 10.2355 2.5603C10.0168 2.09508 9.79491 1.63137 9.58386 1.16233C9.46564 0.900406 9.27779 0.75231 9.00618 0.750025C8.72658 0.747741 8.53801 0.900406 8.41363 1.16728C7.72534 2.6452 7.02944 4.11893 6.34007 5.59647C6.2737 5.73886 6.19791 5.81348 6.03473 5.83746C4.46668 6.06779 2.90081 6.31183 1.33349 6.54901C1.02308 6.59584 0.833778 6.77744 0.749647 7.08886V7.27883H0.75001Z"
                fill="#FFA655"
              />
            </svg> </span
          ><span class="font-bold text-black dark:text-zinc-400 text-base">{{
            p.rating?.rate ?? "-"
          }}</span
          ><span class="text-zinc-400">({{ p.rating?.count ?? 0 }})</span>
        </div>
      </div>
      <h3 class="line-clamp-2 text-base">{{ p.title }}</h3>
      <div class="flex items-center justify-between gap-2">
        <p class="font-bold text-[#2C2C2C] dark:text-orange-500">
          $ {{ p.price }}
        </p>
        <button
          class="btn !px-3 !py-1.5 text-xs shrink-0"
          :class="{ '!border-orange-400 !text-orange-500': justAdded }"
          @click.stop.prevent="handleAdd"
        >
          {{ justAdded ? "Added ✓" : "Add to Cart" }}
        </button>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type {} from "~/composables/useProducts";
const props = defineProps<{ p: any }>();
const { addToCart } = useCart();
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const justAdded = ref(false);
function handleAdd() {
  addToCart(props.p, 1);
  justAdded.value = true;
  setTimeout(() => (justAdded.value = false), 1200);
}
</script>
