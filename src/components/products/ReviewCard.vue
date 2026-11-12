<template>
  <div class="bg-base-100 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
    <div class="flex items-center justify-between">
      <RatingStars :value="review.rating || 5" size="sm" />
      <span
        v-if="review.is_verified_purchase"
        class="badge badge-success badge-outline text-[10px] font-bold py-2"
      >
        Verified Buyer
      </span>
    </div>

    <div>
      <h4 class="font-bold text-sm text-base-content">{{ review.title }}</h4>
      <p class="text-xs text-base-content/70 mt-1 leading-relaxed">{{ review.body }}</p>
    </div>

    <div class="flex items-center justify-between text-[11px] text-base-content/50 pt-2 border-t border-slate-100 dark:border-slate-800">
      <span class="font-semibold">{{ review.expand?.user?.username || review.expand?.user?.name || 'Verified Customer' }}</span>
      <span>{{ formatDate(review.created) }}</span>
    </div>
  </div>
</template>

<script setup>
import RatingStars from '../ui/RatingStars.vue'
import { formatDate } from '../../utils/formatters'

defineProps({
  review: {
    type: Object,
    required: true,
  },
})
</script>
