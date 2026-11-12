<template>
  <div class="store-card bg-base-100 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
    <!-- Image placeholder -->
    <div class="skeleton aspect-4/3 w-full rounded-none"></div>

    <!-- Content placeholder -->
    <div class="p-4 flex flex-col flex-1 justify-between gap-3">
      <div class="space-y-2">
        <div class="skeleton h-3 w-1/3 rounded-full"></div>
        <div class="skeleton h-4 w-3/4 rounded-md"></div>
        <div class="skeleton h-3 w-full rounded-md"></div>
        <div class="skeleton h-3 w-2/3 rounded-md"></div>
      </div>

      <!-- Price & Button placeholder -->
      <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div class="skeleton h-5 w-16 rounded-md"></div>
        <div class="skeleton h-8 w-16 rounded-xl"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

