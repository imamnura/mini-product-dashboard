<template>
  <div
    class="min-h-screen flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100"
  >
    <LayoutNavbar>
      <template #search>
        <UiSearchBar v-model="q" @change="onSearch" />
      </template>
    </LayoutNavbar>

    <div class="flex-1">
      <NuxtPage :page-key="route.fullPath" />
    </div>

    <footer class="mt-auto text-xs text-white bg-[#2C2C2C] dark:bg-zinc-900/80">
      <div
        class="container py-6 text-xs text-zinc-500 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p>© 2025 Orange Store. All rights reserved.</p>
        <nav class="flex gap-6">
          <NuxtLink to="/" class="hover:underline">Privacy Policy</NuxtLink>
          <NuxtLink to="/" class="hover:underline">Terms of Service</NuxtLink>
          <NuxtLink to="/" class="hover:underline">Contact Us</NuxtLink>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const qState = useState("global:q", () => "");
const q = ref(qState.value);
function onSearch(v: string) {
  qState.value = v;
}
</script>
