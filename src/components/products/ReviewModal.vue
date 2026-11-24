<template>
  <Modal
    :is-open="isOpen"
    title="Write a Review"
    @close="$emit('close')"
  >
    <form @submit.prevent="submitReview" id="review-form" class="space-y-4">
      <div>
        <label class="text-xs font-bold text-base-content block mb-1">Your Rating</label>
        <div class="flex items-center gap-2">
          <RatingStars
            v-model="form.rating"
            size="md"
            :interactive="true"
          />
          <span class="text-xs font-bold text-base-content/60">{{ form.rating }} of 5 Stars</span>
        </div>
      </div>

      <div>
        <label class="text-xs font-bold text-base-content block mb-1">Title</label>
        <input
          v-model="form.title"
          type="text"
          placeholder="e.g. Loved this hilarious card!"
          required
          class="input input-bordered input-sm w-full rounded-xl text-xs"
        />
      </div>

      <div>
        <label class="text-xs font-bold text-base-content block mb-1">Review</label>
        <textarea
          v-model="form.body"
          rows="3"
          placeholder="What made this greeting card special?"
          required
          class="textarea textarea-bordered w-full rounded-xl text-xs"
        ></textarea>
      </div>
    </form>

    <template #actions>
      <button
        type="button"
        @click="$emit('close')"
        class="btn btn-ghost btn-sm rounded-xl font-bold"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="review-form"
        :disabled="submitting"
        class="btn btn-primary btn-sm rounded-xl font-bold"
      >
        {{ submitting ? 'Submitting...' : 'Submit Review' }}
      </button>
    </template>
  </Modal>
</template>

<script setup>
import { ref } from 'vue'
import { createReview } from '../../services/catalogService'
import { useToastStore } from '../../stores/toast'
import Modal from '../ui/Modal.vue'
import RatingStars from '../ui/RatingStars.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close', 'submitted'])
const toastStore = useToastStore()

const submitting = ref(false)
const form = ref({
  rating: 5,
  title: '',
  body: '',
})

async function submitReview() {
  submitting.value = true
  try {
    await createReview({
      product: props.productId,
      rating: form.value.rating,
      title: form.value.title,
      body: form.value.body,
      is_verified_purchase: false,
    })
    toastStore.success('Thank you! Your review was submitted.')
    form.value = { rating: 5, title: '', body: '' }
    emit('submitted')
    emit('close')
  } catch (err) {
    console.error('Error submitting review:', err)
    toastStore.error('Could not submit review. Please try again.')
  } finally {
    submitting.value = false
  }
}
</script>
