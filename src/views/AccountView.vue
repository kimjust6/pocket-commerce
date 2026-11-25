<template>
  <div class="py-12 bg-base-100 min-h-screen">
    <div class="container mx-auto px-4 md:px-8 max-w-7xl">
      <Breadcrumbs :items="[{ label: 'Home', to: '/' }, { label: 'My Account' }]" />

      <div class="bg-base-200/50 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="avatar">
            <div class="w-16 rounded-full ring-2 ring-primary/40 bg-base-100">
              <img :src="authStore.avatarUrl" :alt="authStore.user?.username || 'User'" />
            </div>
          </div>
          <div>
            <h1 class="text-2xl font-black text-base-content">
              Welcome back, {{ authStore.user?.name || authStore.user?.username || 'Customer' }}!
            </h1>
            <p class="text-xs text-base-content/60 font-medium">
              {{ authStore.user?.email }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <router-link to="/profile" class="btn btn-outline btn-sm rounded-xl font-bold text-xs">
            Edit Profile
          </router-link>
          <button
            type="button"
            @click="handleLogout"
            class="btn btn-ghost btn-sm rounded-xl text-error font-bold text-xs"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div class="flex gap-2 border-b border-stone-200 dark:border-stone-800 mb-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          @click="activeTab = tab.id"
          :class="[
            'pb-3 px-4 font-bold text-sm border-b-2 transition-all',
            activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-base-content/60 hover:text-base-content'
          ]"
        >
          {{ tab.label }} ({{ tab.count }})
        </button>
      </div>

      <OrderHistoryList
        v-if="activeTab === 'orders'"
        :orders="orders"
        :loading="loadingOrders"
      />

      <SavedAddressesPanel
        v-if="activeTab === 'addresses'"
        :addresses="addresses"
        :loading="loadingAddresses"
        @open-modal="showAddressModal = true"
        @delete="handleDeleteAddress"
      />
    </div>

    <Modal
      :is-open="showAddressModal"
      title="Add Shipping Address"
      @close="showAddressModal = false"
    >
      <form @submit.prevent="saveNewAddress" id="address-form" class="space-y-3">
        <div>
          <label class="text-xs font-bold text-base-content block mb-1">Full Name</label>
          <input
            v-model="newAddr.name"
            type="text"
            required
            placeholder="Recipient Name"
            class="input input-sm input-bordered w-full rounded-xl text-xs"
          />
        </div>

        <div>
          <label class="text-xs font-bold text-base-content block mb-1">Street Address</label>
          <input
            v-model="newAddr.street"
            type="text"
            required
            placeholder="123 Example Street"
            class="input input-sm input-bordered w-full rounded-xl text-xs"
          />
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="text-xs font-bold text-base-content block mb-1">City</label>
            <input
              v-model="newAddr.city"
              type="text"
              required
              placeholder="City"
              class="input input-sm input-bordered w-full rounded-xl text-xs"
            />
          </div>
          <div>
            <label class="text-xs font-bold text-base-content block mb-1">State</label>
            <input
              v-model="newAddr.state"
              type="text"
              required
              placeholder="NY"
              class="input input-sm input-bordered w-full rounded-xl text-xs"
            />
          </div>
          <div>
            <label class="text-xs font-bold text-base-content block mb-1">ZIP</label>
            <input
              v-model="newAddr.zip"
              type="text"
              required
              placeholder="10001"
              class="input input-sm input-bordered w-full rounded-xl text-xs"
            />
          </div>
        </div>
      </form>

      <template #actions>
        <button
          type="button"
          @click="showAddressModal = false"
          class="btn btn-ghost btn-sm rounded-xl font-bold"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="address-form"
          :disabled="savingAddress"
          class="btn btn-primary btn-sm rounded-xl font-bold"
        >
          {{ savingAddress ? 'Saving...' : 'Save Address' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import { getUserOrders } from '../services/orderService'
import { useAddresses } from '../composables/useAddresses'
import Breadcrumbs from '../components/ui/Breadcrumbs.vue'
import Modal from '../components/ui/Modal.vue'
import OrderHistoryList from '../components/account/OrderHistoryList.vue'
import SavedAddressesPanel from '../components/account/SavedAddressesPanel.vue'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const activeTab = ref('orders')
const loadingOrders = ref(true)
const orders = ref([])

const {
  addresses,
  loadingAddresses,
  savingAddress,
  loadAddresses,
  addAddress,
  removeAddress,
} = useAddresses()

const tabs = computed(() => [
  { id: 'orders', label: 'Order History', count: orders.value.length },
  { id: 'addresses', label: 'Saved Addresses', count: addresses.value.length },
])

const showAddressModal = ref(false)
const newAddr = ref({
  name: '',
  street: '',
  city: '',
  state: '',
  zip: '',
})

async function loadData() {
  try {
    const [ordersRes] = await Promise.all([
      getUserOrders(),
      loadAddresses(),
    ])
    orders.value = ordersRes
  } catch (err) {
    console.error('Account data error:', err)
  } finally {
    loadingOrders.value = false
  }
}

async function saveNewAddress() {
  try {
    await addAddress(newAddr.value)
    toastStore.success('Address saved!')
    showAddressModal.value = false
    newAddr.value = { name: '', street: '', city: '', state: '', zip: '' }
  } catch (e) {
    console.error('Error saving address:', e)
    toastStore.error('Could not save address.')
  }
}

async function handleDeleteAddress(id) {
  try {
    await removeAddress(id)
    toastStore.success('Address deleted.')
  } catch (e) {
    console.error('Error deleting address:', e)
    toastStore.error('Could not delete address.')
  }
}

function handleLogout() {
  authStore.logout()
  toastStore.show('Signed out successfully.')
  router.push('/')
}

onMounted(() => {
  loadData()
})
</script>
