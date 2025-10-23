<template>
  <div class="relative w-full md:w-96">
    <input
      v-model="q"
      @input="onInput"
      @keydown.enter.prevent="commit(q)"
      @focus="open = true"
      @blur="() => setTimeout(() => (open = false), 120)"
      type="search"
      placeholder="Cari di Orange Store"
      class="w-full rounded-xl border bg-white pl-10 pr-10 h-10 text-sm border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
    />
    <span class="absolute left-3 top-1/2 -translate-y-1/2">🔍</span>
    <button
      v-if="q"
      class="absolute right-3 top-1/2 -translate-y-1/2"
      @click="clear"
    >
      ✖️
    </button>

    <!-- HISTORY DROPDOWN -->
    <div
      v-if="open && historyToShow.length"
      class="absolute z-50 mt-1 w-full rounded-xl border bg-white text-sm border-zinc-200 shadow-sm overflow-hidden dark:bg-zinc-900 dark:border-zinc-700"
    >
      <div
        class="px-3 py-2 text-xs text-zinc-400 flex items-center justify-between"
      >
        <span>Recent searches</span>
        <button class="hover:underline" @click.stop="clearAll">
          Clear all
        </button>
      </div>
      <ul>
        <li
          v-for="item in historyToShow"
          :key="item"
          class="flex items-center justify-between px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <button class="truncate text-left flex-1" @click.stop="apply(item)">
            {{ item }}
          </button>
          <button
            class="ml-2 text-zinc-400 hover:text-red-500"
            @click.stop="remove(item)"
          >
            ✕
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const model = defineModel<string>({ default: "" });
const emit = defineEmits<{ (e: "change", v: string): void }>();

const q = ref(model.value);
const open = ref(false);

/** global state untuk konsistensi (opsional) */
const historyState = useState<string[]>("search:history", () => []);
const limit = 8;

onMounted(() => {
  try {
    const raw = localStorage.getItem("search:history");
    if (raw) historyState.value = JSON.parse(raw);
  } catch {}
});

watch(historyState, saveLocal, { deep: true });

function saveLocal() {
  try {
    localStorage.setItem("search:history", JSON.stringify(historyState.value));
  } catch {}
}

const debounce = useDebounce((v: string) => emit("change", v), 400);

function onInput() {
  model.value = q.value;
  debounce(q.value);
}
function clear() {
  q.value = "";
  emit("change", "");
}
function commit(term: string) {
  const v = term.trim();
  if (!v) return;
  // simpan unik, terbaru di depan
  historyState.value = [v, ...historyState.value.filter((x) => x !== v)].slice(
    0,
    limit
  );
  emit("change", v);
}
function apply(term: string) {
  q.value = term;
  model.value = term;
  emit("change", term);
  open.value = false;
}
function remove(term: string) {
  historyState.value = historyState.value.filter((x) => x !== term);
}
function clearAll() {
  historyState.value = [];
}

const historyToShow = computed(() =>
  historyState.value.filter((x) =>
    x.toLowerCase().includes(q.value.toLowerCase())
  )
);
</script>
