<template>
  <div class="flex items-center gap-1" :class="interactive ? 'cursor-pointer' : ''">
    <button
      v-for="star in maxStars"
      :key="star"
      type="button"
      :disabled="!interactive"
      @click="interactive && $emit('update:modelValue', star)"
      class="transition-transform duration-150 focus:outline-hidden"
      :class="[
        sizeClass,
        interactive ? 'hover:scale-125' : '',
        star <= Math.round(rating) ? 'text-amber-500' : 'text-slate-300 dark:text-slate-700'
      ]"
      :aria-label="`${star} star rating`"
    >
      ★
    </button>
    <span v-if="showScore" class="text-xs font-bold text-amber-500 ml-1">
      {{ Number(rating).toFixed(1) }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 5,
  },
  value: {
    type: Number,
    default: null,
  },
  maxStars: {
    type: Number,
    default: 5,
  },
  size: {
    type: String,
    default: 'sm', // xs, sm, md, lg
  },
  interactive: {
    type: Boolean,
    default: false,
  },
  showScore: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])

const rating = computed(() => {
  return props.value !== null ? props.value : props.modelValue
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'text-xs'
    case 'md':
      return 'text-lg'
    case 'lg':
      return 'text-2xl'
    case 'sm':
    default:
      return 'text-sm'
  }
})
</script>

