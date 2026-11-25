<template>
  <div
    :class="[
      'join border border-stone-200 dark:border-stone-700 bg-base-100',
      sizeClasses.container,
    ]"
  >
    <template v-for="item in controls" :key="item.key">
      <button
        v-if="item.type === 'button'"
        type="button"
        @click="$emit('update', Math.max(min, quantity + item.delta))"
        :class="['join-item btn btn-ghost', sizeClasses.button]"
        :aria-label="item.ariaLabel"
      >
        {{ item.label }}
      </button>
      <span
        v-else
        :class="['join-item font-bold flex items-center text-xs', sizeClasses.value]"
      >
        {{ quantity }}
      </span>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const SIZE_CLASSES = {
  xs: {
    container: 'rounded-lg',
    button: 'btn-xs px-2',
    value: 'px-2 py-0.5',
  },
  sm: {
    container: 'rounded-xl',
    button: 'btn-sm px-3',
    value: 'px-3 py-1',
  },
}

const controls = [
  { key: 'decrease', type: 'button', label: '-', ariaLabel: 'Decrease quantity', delta: -1 },
  { key: 'quantity', type: 'value' },
  { key: 'increase', type: 'button', label: '+', ariaLabel: 'Increase quantity', delta: 1 },
]

const props = defineProps({
  quantity: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    default: 'sm',
    validator: (v) => ['xs', 'sm'].includes(v),
  },
  min: {
    type: Number,
    default: 0,
  },
})

defineEmits(['update'])

const sizeClasses = computed(() => SIZE_CLASSES[props.size])
</script>

