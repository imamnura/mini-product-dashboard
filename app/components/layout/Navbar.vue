<template>
  <header
    class="sticky top-0 z-40 border-b bg-white/80 backdrop-blur dark:bg-zinc-900/80 dark:border-zinc-800"
  >
    <div class="container flex h-14 items-center justify-between gap-4">
      <NuxtLink
        to="/"
        class="font-semibold text-orange-500"
        @click.prevent="resetAll"
        >Orange Store</NuxtLink
      >

      <nav
        class="hidden md:flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-300"
      >
        <button
          v-for="c in cats"
          :key="c"
          class="hover:text-orange-500 hover:cursor-pointer"
          :class="{ 'text-orange-500 font-medium': c === selectedCat }"
          @click.prevent="selectCat(c)"
        >
          {{ capitalize(c) }}
        </button>
      </nav>

      <div class="flex items-center gap-2">
        <slot name="search" />
        <button class="btn" @click="toggle">
          <ClientOnly>
            <span v-if="!isDark">🌙</span>
            <span v-else>☀️</span>
          </ClientOnly>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { isDark, toggle } = useTheme();
const { fetchCategories } = useProducts();

const cats = ref<string[]>([]);
const selectedCat = useState<string>("nav:selectedCat", () => ""); // global

onMounted(async () => {
  try {
    cats.value = await fetchCategories();
  } catch {}
});

function selectCat(slug: string) {
  selectedCat.value = slug;
  navigateTo("/");
}
function resetAll() {
  selectedCat.value = "";
  searchQuery.value = "";
  navigateTo("/");
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
</script>
