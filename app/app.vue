<template>
  <div
    class="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100"
  >
    <LayoutNavbar>
      <template #search>
        <UiSearchBar v-model="q" @change="onSearch" />
      </template>
    </LayoutNavbar>

    <NuxtPage :page-key="route.fullPath" />

    <footer
      class="border-t mt-6 py-6 text-xs text-zinc-500 dark:border-zinc-800"
    >
      <div class="container flex items-center justify-between">
        <p>© 2025 Orange Store. All rights reserved.</p>
        <nav class="flex gap-6">
          <NuxtLink to="/">Privacy Policy</NuxtLink>
          <NuxtLink to="/">Terms of Service</NuxtLink>
          <NuxtLink to="/">Contact Us</NuxtLink>
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
