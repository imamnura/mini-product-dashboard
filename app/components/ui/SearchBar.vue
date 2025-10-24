<template>
  <div class="relative w-full md:w-96">
    <input
      v-model="q"
      @input="onInput"
      @keydown.enter.prevent="commit(q)"
      @focus="open = true"
      @blur="onBlur"
      type="search"
      placeholder="Cari di Orange Store"
      class="w-full rounded-xl border bg-white pl-10 pr-10 h-10 text-sm border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
    />
    <span class="absolute left-3 top-1/2 -translate-y-1/2"
      ><svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M13.848 15.0267C12.565 16.053 10.9375 16.6667 9.16663 16.6667C5.02449 16.6667 1.66663 13.3089 1.66663 9.16675C1.66663 5.02461 5.02449 1.66675 9.16663 1.66675C13.3088 1.66675 16.6666 5.02461 16.6666 9.16675C16.6666 10.9376 16.0529 12.5651 15.0265 13.8482L18.0892 16.9108C18.4146 17.2363 18.4146 17.7639 18.0892 18.0894C17.7638 18.4148 17.2361 18.4148 16.9107 18.0894L13.848 15.0267ZM3.33329 9.16675C3.33329 5.94509 5.94496 3.33341 9.16663 3.33341C12.3883 3.33341 15 5.94509 15 9.16675C15 10.7384 14.3784 12.1649 13.3677 13.2138C13.3392 13.2357 13.3118 13.2597 13.2857 13.2858C13.2596 13.312 13.2356 13.3394 13.2137 13.3679C12.1647 14.3785 10.7383 15.0001 9.16663 15.0001C5.94496 15.0001 3.33329 12.3884 3.33329 9.16675Z"
          fill="#2C2C2C"
        />
      </svg>
    </span>
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

function onBlur() {
  setTimeout(() => (open.value = false), 120);
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
