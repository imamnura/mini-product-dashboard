<script setup lang="ts">
const route = useRoute();
const { fetchById } = useProducts();
const { data, pending, error } = await useAsyncData(
  `product-${route.params.id}`,
  () => fetchById(String(route.params.id)),
  { server: true }
);
//seo
useHead({
  title: data.value
    ? `${data.value.title} – Orange Store`
    : "Product Detail – Orange Store",
  meta: [
    {
      name: "description",
      content: data.value?.description || "Product details and specs",
    },
    { property: "og:title", content: data.value?.title || "Product Detail" },
    {
      property: "og:description",
      content: data.value?.description || "Product information",
    },
    {
      property: "og:image",
      content: data.value?.image || "https://placehold.co/600x400",
    },
    { property: "og:type", content: "product" },
  ],
});
</script>

<template>
  <main class="container my-6">
    <nav class="text-sm text-zinc-500 mb-4">
      <NuxtLink to="/" class="hover:underline">Home</NuxtLink>
      <span class="mx-2">></span>
      <NuxtLink
        v-if="data"
        :to="`/category/${data.category}`"
        class="hover:underline"
      >
        {{ data.category }}
      </NuxtLink>
      <span class="mx-2">></span>
      <span class="text-zinc-700 dark:text-zinc-200">{{
        data?.title ?? "..."
      }}</span>
    </nav>

    <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UiSkeletonCard /><UiSkeletonCard />
    </div>

    <div
      v-else-if="error"
      class="rounded-xl border p-6 text-red-600 dark:border-zinc-700"
    >
      ⚠️ {{ (error as any).statusMessage || "Terjadi kesalahan" }}
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        class="rounded-2xl bg-[#EEF2F7] dark:bg-zinc-900 dark:border-zinc-700 p-6 grid place-items-center"
      >
        <img
          :src="data?.image"
          :alt="data?.title"
          class="max-h-80 object-contain"
        />
      </div>

      <div class="space-y-3">
        <h1 class="text-2xl font-bold">{{ data?.title }}</h1>
        <p class="text-orange-600 text-2xl font-bold">$ {{ data?.price }}</p>
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
            data?.rating?.rate
          }}</span
          ><span class="text-zinc-400">({{ data?.rating?.count }})</span>
        </div>
        <p class="text-sm text-zinc-600 dark:text-zinc-300">
          {{ data?.description }}
        </p>

        <button
          class="w-full mt-2 opacity-60 bg-[#555454] cursor-not-allowed inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border transition hover:bg-[#838181] text-white"
        >
          Sold out!
        </button>
      </div>
    </div>
  </main>
</template>
