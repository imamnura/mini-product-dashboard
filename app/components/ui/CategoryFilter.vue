<template>
  <div class="relative">
    <select
      :value="modelValue"
      @change="
        $emit('update:modelValue', ($event.target as HTMLSelectElement).value)
      "
      class="h-10 rounded-xl border bg-white px-3 text-sm border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
    >
      <option value="">Categories</option>
      <option v-for="c in categories" :key="c" :value="c">
        {{ capitalize(c) }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
defineProps<{ categories: string[]; modelValue: string }>();
defineEmits(["update:modelValue"]);

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
</script>
