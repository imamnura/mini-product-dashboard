<script setup lang="ts">
const { fetchAll, fetchCategories } = useProducts();

// data
const products = ref<any[]>([]);
const filtered = ref<any[]>([]);
const categories = ref<string[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// UI state
const q = useState("global:q", () => "");
const selectedCat = useState<string>("nav:selectedCat", () => "");

// pagination kumulatif
const page = ref(1);
const pageSize = 4;
const total = computed(() => filtered.value.length);
const endIndex = computed(() => Math.min(page.value * pageSize, total.value));
const visible = computed(() => filtered.value.slice(0, endIndex.value));
const displayStart = computed(() => (total.value > 0 ? 1 : 0));
const displayEnd = computed(() => endIndex.value);
const hasMore = computed(() => endIndex.value < total.value);

const titleLabel = computed(() =>
  selectedCat.value ? `${capitalize(selectedCat.value)} Product` : "All Product"
);

async function load() {
  loading.value = true;
  try {
    [products.value, categories.value] = await Promise.all([
      fetchAll(),
      fetchCategories(),
    ]);
    applyFilter();
  } catch (e: any) {
    error.value = e?.statusMessage || "Terjadi kesalahan";
  } finally {
    loading.value = false;
  }
}

function applyFilter() {
  const s = q.value.trim().toLowerCase();
  filtered.value = products.value.filter((p) => {
    const matchQ = !s || p.title.toLowerCase().includes(s);
    const matchCat = !selectedCat.value || p.category === selectedCat.value;
    return matchQ && matchCat;
  });
  page.value = 1;
}

function loadMore() {
  if (hasMore.value) page.value++;
}

watch([q, selectedCat], applyFilter);
onMounted(load);

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
</script>

<template>
  <main>
    <!-- Hero -->
    <section class="container mt-6">
      <div class="relative overflow-hidden rounded-2xl">
        <img
          src="https://images.unsplash.com/photo-1548669558-33b41e4b7e1b?q=80&w=1600&auto=format&fit=crop"
          alt=""
          class="h-64 w-full object-cover"
        />
        <div
          class="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"
        ></div>
        <div class="absolute left-6 top-6 text-white">
          <p class="text-sm">Discover Our Fall/Winter 2025 Collection</p>
          <h2 class="text-2xl font-semibold">
            Step into the season with fresh new arrivals
          </h2>
        </div>
      </div>
    </section>

    <!-- Toolbar -->
    <section
      class="container mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
    >
      <div>
        <h3 class="text-lg font-semibold">{{ titleLabel }}</h3>
        <p class="text-xs text-zinc-500">
          Displaying
          <span class="font-medium">{{ displayStart }}</span> -
          <span class="font-medium">{{ displayEnd }}</span>
          of
          <span class="font-medium">{{ total }}</span>
          products
        </p>
      </div>
      <div class="flex items-center gap-2">
        <UiCategoryFilter :categories="categories" v-model="selectedCat" />
      </div>
    </section>

    <!-- Error -->
    <section v-if="error" class="container mt-6">
      <div class="rounded-xl border p-6 text-red-600 dark:border-zinc-700">
        ⚠️ {{ error }}
      </div>
    </section>

    <!-- Grid -->
    <section class="container mt-6">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <UiSkeletonCard v-if="loading" v-for="i in 4" :key="'s' + i" />

        <div
          v-else-if="visible.length === 0"
          class="col-span-2 sm:col-span-3 lg:col-span-4 text-sm text-zinc-500"
        >
          Tidak ada produk yang cocok.
        </div>

        <UiProductCard v-else v-for="p in visible" :key="p.id" :p="p" />
      </div>

      <div v-if="!loading && hasMore" class="flex justify-center mt-6">
        <button class="btn" @click="loadMore">Muat lebih banyak</button>
      </div>
    </section>
  </main>
</template>
