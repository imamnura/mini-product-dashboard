<script setup lang="ts">
const route = useRoute();
const { fetchByCategory } = useProducts();
const slug = computed(() => String(route.params.slug));

const { data, pending, error } = await useAsyncData(
  `cat-${slug.value}`,
  () => fetchByCategory(slug.value),
  { server: true, watch: [slug] }
);

// pagination
const page = ref(1);
const pageSize = 4;
const total = computed(() => (data.value ?? []).length);
const endIndex = computed(() => Math.min(page.value * pageSize, total.value));
const visible = computed(() => (data.value ?? []).slice(0, endIndex.value));

//pagination info
const displayStart = computed(() => (total.value > 0 ? 1 : 0));
const displayEnd = computed(() => endIndex.value);
const hasMore = computed(() => endIndex.value < total.value);

function loadMore() {
  if (hasMore.value) page.value++;
}

// function onScroll() {
//   if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
//     if (page.value * pageSize < total.value) page.value++;
//   }
// }
// onMounted(() => window.addEventListener("scroll", onScroll));
// onBeforeUnmount(() => window.removeEventListener("scroll", onScroll));
</script>

<template>
  <main class="container my-6">
    <nav class="text-sm text-zinc-500 mb-4">
      <NuxtLink to="/" class="hover:underline">Home</NuxtLink>
      <span class="mx-2">›</span>
      <span class="text-zinc-700 dark:text-zinc-200 capitalize">{{
        slug
      }}</span>
    </nav>

    <div class="mb-4">
      <h2 class="text-lg font-semibold mb-2 capitalize">
        Search Results For “{{ slug }}”
      </h2>
      <p class="text-xs text-zinc-500">
        Displaying
        <span class="font-medium">{{ displayStart }}</span> -
        <span class="font-medium">{{ displayEnd }}</span>
        of
        <span class="font-medium">{{ total }}</span>
        products
      </p>
    </div>

    <div
      v-if="pending"
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      <UiSkeletonCard v-for="i in 4" :key="i" />
    </div>

    <div
      v-else-if="error"
      class="rounded-xl border p-6 text-red-600 dark:border-zinc-700"
    >
      ⚠️ {{ (error as any).statusMessage || "Terjadi kesalahan" }}
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <UiProductCard v-for="p in visible" :key="p.id" :p="p" />
    </div>

    <div v-if="!pending && hasMore" class="flex justify-center mt-6">
      <button class="btn" @click="loadMore">Muat lebih banyak</button>
    </div>
  </main>
</template>
