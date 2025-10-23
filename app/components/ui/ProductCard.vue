<template>
  <NuxtLink
    :to="`/products/${p.id}`"
    class="group block rounded-2xl border overflow-hidden hover:shadow-sm transition border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
  >
    <div
      class="aspect-square bg-zinc-50 dark:bg-zinc-800 grid place-items-center"
    >
      <img
        :src="p.image"
        :alt="p.title"
        loading="lazy"
        class="max-h-40 object-contain transition group-hover:scale-105"
      />
    </div>
    <div class="p-3 space-y-1">
      <p class="text-xs text-zinc-500">{{ capitalize(p.category) }}</p>
      <h3 class="line-clamp-2 text-sm font-medium">{{ p.title }}</h3>
      <p class="font-semibold text-orange-600">$ {{ p.price }}</p>
      <div class="badge">
        <span>⭐</span><span>{{ p.rating?.rate ?? "-" }}</span
        ><span class="text-zinc-400">({{ p.rating?.count ?? 0 }})</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type {} from "~/composables/useProducts";
defineProps<{ p: any }>();
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
</script>
