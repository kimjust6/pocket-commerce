<template>
  <nav aria-label="Breadcrumbs" class="text-xs breadcrumbs text-base-content/60 mb-6">
    <ul>
      <li v-for="(item, index) in items" :key="index">
        <router-link
          v-if="item.to && index < items.length - 1"
          :to="item.to"
          class="hover:text-primary transition-colors font-medium"
        >
          {{ item.label }}
        </router-link>
        <span
          v-else
          :class="index === items.length - 1 ? 'font-bold text-base-content' : 'font-medium'"
        >
          {{ item.label }}
        </span>
      </li>
    </ul>
  </nav>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
})
</script>

