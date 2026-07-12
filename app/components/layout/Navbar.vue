<template>
  <header
    class="sticky top-0 z-40 shadow-[0px_6px_12px_0px_#0000000D] bg-white/80 backdrop-blur dark:bg-zinc-900/80 dark:border-zinc-800"
  >
    <div class="container flex h-14 items-center justify-between gap-4">
      <div class="flex items-center gap-6">
        <NuxtLink
          to="/"
          class="font-semibold text-orange-500"
          @click.prevent="resetAll"
        >
          Orange Store
        </NuxtLink>

        <nav
          class="hidden md:flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-300"
        >
          <button
            v-for="c in cats"
            :key="c"
            class="hover:text-orange-500 hover:cursor-pointer"
            :class="{ 'text-orange-500 font-medium': c === selectedCat }"
            @click.prevent="selectCat(c)"
            :title="c"
            :aria-label="`Filter category ${c}`"
          >
            {{ capitalize(displayLabel(c)) }}
          </button>
        </nav>
      </div>

      <div class="hidden md:flex items-center gap-2">
        <slot name="search" />
        <NuxtLink to="/cart" class="btn relative" aria-label="View cart">
          🛒
          <ClientOnly>
            <span
              v-if="totalItems > 0"
              class="absolute -top-1.5 -right-1.5 grid place-items-center h-5 min-w-5 px-1 rounded-full bg-orange-500 text-white text-[10px] font-semibold"
            >
              {{ totalItems }}
            </span>
          </ClientOnly>
        </NuxtLink>
        <button class="btn" @click="toggle">
          <ClientOnly>
            <!-- next to change icon -->
            <span v-if="!isDark">🌙</span>
            <span v-else>☀️</span>
          </ClientOnly>
        </button>
      </div>

      <!-- Hamburger buat mobile -->
      <div class="md:hidden flex items-center gap-2">
        <NuxtLink to="/cart" class="btn relative" aria-label="View cart">
          🛒
          <ClientOnly>
            <span
              v-if="totalItems > 0"
              class="absolute -top-1.5 -right-1.5 grid place-items-center h-5 min-w-5 px-1 rounded-full bg-orange-500 text-white text-[10px] font-semibold"
            >
              {{ totalItems }}
            </span>
          </ClientOnly>
        </NuxtLink>
        <button
          class="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-700"
          @click="toggleMenu"
          :aria-expanded="isOpen ? 'true' : 'false'"
          aria-controls="mobile-menu"
          aria-label="Toggle navigation"
        >
          <span v-if="!isOpen">☰</span>
          <span v-else>✕</span>
        </button>
      </div>
    </div>

    <!-- Mobile panel -->
    <div v-show="isOpen" id="mobile-menu" class="md:hidden">
      <!-- backdrop -->
      <div
        class="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        @click="closeMenu"
      ></div>

      <!-- panel -->
      <div
        class="fixed left-0 right-0 top-14 z-50 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
      >
        <div class="container py-3 space-y-3">
          <!-- search slot -->
          <div class="w-full">
            <slot name="search" />
          </div>

          <!-- categories -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="c in cats"
              :key="'m-' + c"
              class="px-3 h-9 rounded-xl border text-sm transition border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              :class="{
                'text-orange-600 border-orange-300 dark:border-orange-400':
                  c === selectedCat,
              }"
              @click.prevent="selectCat(c, true)"
            >
              {{ displayLabel(c) }}
            </button>
          </div>

          <div class="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button class="btn w-full justify-center" @click="toggle">
              <ClientOnly>
                <!-- must hange icon moon and sun -->
                <span v-if="!isDark">🌙 Enable Dark Mode</span>
                <span v-else>☀️ Disable Dark Mode</span>
              </ClientOnly>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { isDark, toggle } = useTheme();
const { fetchCategories } = useProducts();
const { totalItems } = useCart();

const cats = ref<string[]>([]);
const selectedCat = useState<string>("nav:selectedCat", () => "");
const searchQuery = useState<string>("global:q", () => "");
const isOpen = ref(false);

const toFirstWord = (s: string) => {
  const firstWord = s.trim().split(/\s+/)[0] || ""; // ambil kata pertama, default ke string kosong jika undefined
  return firstWord
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // hapus diakritik (opsional)
    .replace(/['’]s$/i, "") // hapus 's atau ’s di akhir
    .replace(/[^a-z0-9]+/g, ""); // rapikan (hapus simbol)
};

const displayLabel = (s: string) => toFirstWord(s);

onMounted(async () => {
  try {
    cats.value = await fetchCategories();
  } catch {
    cats.value = [];
  }

  //hamburger
  // ESC untuk menutup
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") closeMenu();
  };
  window.addEventListener("keydown", onKey);
  onBeforeUnmount(() => window.removeEventListener("keydown", onKey));

  // Tutup saat pindah route
  const route = useRoute();
  watch(
    () => route.fullPath,
    () => closeMenu()
  );
});

function lockScroll(lock: boolean) {
  if (!process.client) return;
  document.documentElement.classList.toggle("overflow-hidden", lock);
}

function openMenu() {
  isOpen.value = true;
  lockScroll(true);
}
function closeMenu() {
  isOpen.value = false;
  lockScroll(false);
}
function toggleMenu() {
  isOpen.value ? closeMenu() : openMenu();
}

function selectCat(slug: string, fromMobile = false) {
  selectedCat.value = slug;
  if (fromMobile) closeMenu();
  navigateTo("/");
}
function resetAll() {
  selectedCat.value = "";
  searchQuery.value = "";
  navigateTo("/");
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
</script>
