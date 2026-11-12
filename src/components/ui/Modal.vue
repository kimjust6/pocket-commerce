<template>
  <teleport to="body">
    <div v-if="isOpen" class="modal modal-open z-50">
      <div
        class="modal-box rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-base-100 shadow-2xl relative"
        :class="maxWidthClass"
        role="dialog"
        aria-modal="true"
      >
        <!-- Close Button -->
        <button
          type="button"
          @click="$emit('close')"
          class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-base-content/60 hover:text-base-content"
          aria-label="Close dialog"
        >
          ✕
        </button>

        <!-- Header / Title -->
        <div v-if="$slots.title || title" class="mb-4 pr-6">
          <slot name="title">
            <h3 class="font-extrabold text-lg text-base-content tracking-tight">
              {{ title }}
            </h3>
          </slot>
        </div>

        <!-- Body content -->
        <div class="space-y-4">
          <slot></slot>
        </div>

        <!-- Actions / Footer -->
        <div v-if="$slots.actions" class="modal-action mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <slot name="actions"></slot>
        </div>
      </div>

      <!-- Backdrop -->
      <div class="modal-backdrop bg-black/40 backdrop-blur-xs" @click="$emit('close')"></div>
    </div>
  </teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  maxWidth: {
    type: String,
    default: 'md', // sm, md, lg, xl
  },
})

const emit = defineEmits(['close'])

const maxWidthClass = computed(() => {
  switch (props.maxWidth) {
    case 'sm':
      return 'max-w-sm'
    case 'lg':
      return 'max-w-2xl'
    case 'xl':
      return 'max-w-4xl'
    case 'md':
    default:
      return 'max-w-md'
  }
})

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

watch(
  () => props.isOpen,
  (val) => {
    if (typeof document !== 'undefined') {
      if (val) {
        document.body.classList.add('overflow-hidden')
      } else {
        document.body.classList.remove('overflow-hidden')
      }
    }
  }
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (typeof document !== 'undefined') {
    document.body.classList.remove('overflow-hidden')
  }
})
</script>

