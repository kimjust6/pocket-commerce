<template>
  <div class="py-12 bg-base-100 min-h-screen">
    <div class="container mx-auto px-4 md:px-8 max-w-7xl">
      <!-- Breadcrumbs -->
      <Breadcrumbs :items="[{ label: 'Home', to: '/' }, { label: 'My Account' }]" />

      <!-- Account Header Banner -->
      <div class="bg-base-200/50 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
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

      <!-- Navigation Tabs -->
      <div class="flex gap-2 border-b border-slate-200 dark:border-slate-800 mb-8">
        <button
          type="button"
          @click="activeTab = 'orders'"
          :class="[
            'pb-3 px-4 font-bold text-sm border-b-2 transition-all',
            activeTab === 'orders' ? 'border-primary text-primary' : 'border-transparent text-base-content/60 hover:text-base-content'
          ]"
        >
          Order History ({{ orders.length }})
        </button>
        <button
          type="button"
          @click="activeTab = 'addresses'"
          :class="[
            'pb-3 px-4 font-bold text-sm border-b-2 transition-all',
            activeTab === 'addresses' ? 'border-primary text-primary' : 'border-transparent text-base-content/60 hover:text-base-content'
          ]"
        >
          Saved Addresses ({{ addresses.length }})
        </button>
      </div>

      <!-- Tab 1: Orders -->
      <div v-if="activeTab === 'orders'" class="space-y-4">
        <div v-if="loadingOrders" class="space-y-3">
          <div v-for="n in 3" :key="n" class="skeleton h-24 w-full rounded-2xl"></div>
        </div>

        <div v-else-if="orders.length === 0" class="text-center py-16 bg-base-200/40 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3">
          <Package class="w-10 h-10 text-base-content/30 mx-auto" />
          <h3 class="font-extrabold text-base text-base-content">No orders placed yet</h3>
          <p class="text-xs text-base-content/60">When you purchase cards, your order history and receipts will appear here.</p>
          <router-link to="/shop" class="btn btn-primary btn-sm rounded-xl font-bold mt-2">
            Start Shopping
          </router-link>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="order in orders"
            :key="order.id"
            class="bg-base-100 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div class="space-y-0.5">
                <span class="font-mono font-bold text-base-content">Order #{{ order.id }}</span>
                <span class="text-base-content/50 block">{{ formatDate(order.created) }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="badge badge-info badge-outline font-bold text-[10px] uppercase">
                  {{ order.status || 'Pending' }}
                </span>
                <span class="font-black text-sm text-base-content">
                  {{ formatPrice(order.total_amount) }}
                </span>
              </div>
            </div>

            <div class="text-xs text-base-content/70">
              <span class="font-bold text-base-content">Shipping to:</span> {{ order.shipping_address }}
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Addresses -->
      <div v-if="activeTab === 'addresses'" class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-extrabold text-lg text-base-content">Saved Shipping Addresses</h3>
            <p class="text-xs text-base-content/60">Manage your delivery destinations for quick checkout.</p>
          </div>
          <button
            type="button"
            @click="showAddressModal = true"
            class="btn btn-primary btn-sm rounded-xl font-bold text-xs"
          >
            + Add New Address
          </button>
        </div>

        <div v-if="loadingAddresses" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="n in 2" :key="n" class="skeleton h-32 w-full rounded-2xl"></div>
        </div>

        <div v-else-if="addresses.length === 0" class="text-center py-12 bg-base-200/40 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3">
          <MapPin class="w-10 h-10 text-base-content/30 mx-auto" />
          <h4 class="font-bold text-sm text-base-content">No saved addresses</h4>
          <p class="text-xs text-base-content/60">Save an address for faster checkout on future orders.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="addr in addresses"
            :key="addr.id"
            class="bg-base-100 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex justify-between items-start"
          >
            <div class="space-y-1 text-xs text-base-content/80">
              <h4 class="font-bold text-sm text-base-content">{{ addr.name }}</h4>
              <p>{{ addr.street }}</p>
              <p>{{ addr.city }}, {{ addr.state }} {{ addr.zip }}</p>
            </div>
            <button
              type="button"
              @click="handleDeleteAddress(addr.id)"
              class="btn btn-ghost btn-circle btn-xs text-error"
              aria-label="Delete address"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reusable Add Address Modal -->
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Package, MapPin } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import { formatPrice, formatDate } from '../utils/formatters'
import { getUserOrders, getUserAddresses, createAddress, deleteAddress } from '../services/pocketbase'
import Breadcrumbs from '../components/ui/Breadcrumbs.vue'
import Modal from '../components/ui/Modal.vue'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const activeTab = ref('orders')
const loadingOrders = ref(true)
const loadingAddresses = ref(true)
const orders = ref([])
const addresses = ref([])

const showAddressModal = ref(false)
const savingAddress = ref(false)
const newAddr = ref({
  name: '',
  street: '',
  city: '',
  state: '',
  zip: '',
})

async function loadData() {
  try {
    const [ordersRes, addressesRes] = await Promise.all([
      getUserOrders(),
      getUserAddresses(),
    ])
    orders.value = ordersRes
    addresses.value = addressesRes
  } catch (err) {
    console.error('Account data error:', err)
  } finally {
    loadingOrders.value = false
    loadingAddresses.value = false
  }
}

async function saveNewAddress() {
  savingAddress.value = true
  try {
    await createAddress(newAddr.value)
    toastStore.success('Address saved!')
    showAddressModal.value = false
    newAddr.value = { name: '', street: '', city: '', state: '', zip: '' }
    addresses.value = await getUserAddresses()
  } catch (e) {
    console.error('Error saving address:', e)
    toastStore.error('Could not save address.')
  } finally {
    savingAddress.value = false
  }
}

async function handleDeleteAddress(id) {
  try {
    await deleteAddress(id)
    addresses.value = addresses.value.filter((a) => a.id !== id)
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
