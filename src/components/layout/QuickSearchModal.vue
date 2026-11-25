<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4"
    role="dialog"
    aria-modal="true"
    aria-label="Search greeting cards"
  >
    <div class="fixed inset-0 bg-black/50 backdrop-blur-xs" @click="$emit('close')"></div>

    <div class="relative z-10 w-full max-w-lg bg-base-100 border border-stone-200/80 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden">
      <form @submit.prevent="submitFullSearch" class="flex items-center gap-3 px-4 py-3 border-b border-stone-200/70 dark:border-stone-800">
        <Search class="w-4 h-4 text-base-content/50 flex-shrink-0" />
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          placeholder="Search greeting cards by name or occasion..."
          class="w-full bg-transparent text-sm text-base-content focus:outline-none"
        />
        <button type="button" @click="$emit('close')" class="btn btn-ghost btn-xs rounded-lg text-xs">
          Esc
        </button>
      </form>

      <div class="max-h-80 overflow-y-auto p-3 space-y-1">
        <div v-if="loading" class="py-8 text-center text-xs text-base-content/60">
          Searching cards...
        </div>

        <div v-else-if="query.trim() && results.length === 0" class="py-8 text-center text-xs text-base-content/60">
          No cards found for "{{ query }}".
        </div>

        <router-link
          v-for="card in results"
          :key="card.id"
          :to="`/shop/card/${card.slug}`"
          @click="$emit('close')"
          class="flex items-center gap-3 p-2 rounded-xl hover:bg-base-200/70 transition-colors"
        >
          <img :src="card.primaryImage" :alt="card.name" class="w-11 h-14 object-cover rounded-lg border border-stone-200/60 dark:border-stone-700 flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="font-serif font-bold text-sm text-base-content truncate">{{ card.name }}</p>
            <p class="text-[11px] text-base-content/60 truncate">{{ card.categoryName }}</p>
          </div>
          <span class="text-xs font-extrabold text-primary">{{ formatPrice(card.price) }}</span>
        </router-link>

        <div v-if="!query.trim()" class="py-6 text-center text-xs text-base-content/55">
          Type to preview cards, or press Enter to browse all results.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from 'lucide-vue-next'
import { getProducts } from '../../services/catalogService'
import { formatPrice } from '../../utils/formatters'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close'])
const router = useRouter()

const inputRef = ref(null)
const query = ref('')
const results = ref([])
const loading = ref(false)
let debounceTimer = null

watch(
  () => props.isOpen,
  async (open) => {
    if (open) {
      await nextTick()
      inputRef.value?.focus()
    } else {
      query.value = ''
      results.value = []
    }
  }
)

watch(query, (val) => {
  clearTimeout(debounceTimer)
  const trimmed = val.trim()
  if (!trimmed) {
    results.value = []
    loading.value = false
    return
  }
  loading.value = true
  debounceTimer = setTimeout(async () => {
    try {
      const res = await getProducts({ search: trimmed, perPage: 6 })
      results.value = res.items || []
    } finally {
      loading.value = false
    }
  }, 200)
})

function submitFullSearch() {
  const trimmed = query.value.trim()
  emit('close')
  if (trimmed) {
    router.push({ path: '/shop', query: { search: trimmed } })
  }
}
</script>
