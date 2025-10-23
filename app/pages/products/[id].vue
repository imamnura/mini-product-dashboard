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
      <span class="mx-2">›</span>
      <NuxtLink
        v-if="data"
        :to="`/category/${data.category}`"
        class="hover:underline"
      >
        {{ data.category }}
      </NuxtLink>
      <span class="mx-2">›</span>
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
        class="rounded-2xl border bg-white dark:bg-zinc-900 dark:border-zinc-700 p-6 grid place-items-center"
      >
        <img
          :src="data?.image"
          :alt="data?.title"
          class="max-h-80 object-contain"
        />
      </div>

      <div class="space-y-3">
        <h1 class="text-2xl font-semibold">{{ data?.title }}</h1>
        <div class="badge">
          <span>⭐</span><span>{{ data?.rating?.rate }}</span
          ><span class="text-zinc-400">({{ data?.rating?.count }})</span>
        </div>
        <p class="text-orange-600 text-2xl font-bold">$ {{ data?.price }}</p>
        <p class="text-sm text-zinc-600 dark:text-zinc-300">
          {{ data?.description }}
        </p>

        <button class="btn w-48 mt-2 opacity-60 cursor-not-allowed">
          Sold out!
        </button>
      </div>
    </div>
  </main>
</template>
