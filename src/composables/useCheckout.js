import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { useToastStore } from '../stores/toast'
import { createOrder } from '../services/orderService'
import { getUserAddresses, createAddress } from '../services/addressService'
import { PAYMENT_PROVIDERS } from '../services/paymentProviders'

export function useCheckout({ redirect = (url) => { window.location.href = url } } = {}) {
  const router = useRouter()
  const authStore = useAuthStore()
  const cartStore = useCartStore()
  const toastStore = useToastStore()

  const savedAddresses = ref([])
  const paymentMethod = ref('stripe')
  const processingOrder = ref(false)
  const errorMessage = ref('')

  const activePaymentProvider = computed(() => {
    return PAYMENT_PROVIDERS[paymentMethod.value] || PAYMENT_PROVIDERS.stripe
  })

  const form = ref({
    email: authStore.user?.email || '',
    fullName: authStore.user?.name || '',
    street: '',
    city: '',
    state: '',
    zip: '',
    saveAddress: false,
  })

  function selectSavedAddress(addressId) {
    const selected = savedAddresses.value.find((a) => a.id === addressId)
    if (selected) {
      form.value.fullName = selected.name || form.value.fullName
      form.value.street = selected.street || ''
      form.value.city = selected.city || ''
      form.value.state = selected.state || ''
      form.value.zip = selected.zip || ''
    }
  }

  async function loadSavedAddresses() {
    if (!authStore.isAuthenticated) return
    try {
      savedAddresses.value = await getUserAddresses()
      if (savedAddresses.value.length > 0) {
        selectSavedAddress(savedAddresses.value[0].id)
      }
    } catch (e) {
      console.warn('Could not load saved addresses:', e)
    }
  }

  async function placeOrder() {
    errorMessage.value = ''
    if (!form.value.email || !form.value.fullName || !form.value.street || !form.value.city || !form.value.zip) {
      errorMessage.value = 'Please complete all required shipping fields.'
      return
    }

    processingOrder.value = true
    try {
      const shippingString = `${form.value.fullName}, ${form.value.street}, ${form.value.city}, ${form.value.state} ${form.value.zip}`

      if (form.value.saveAddress && authStore.isAuthenticated) {
        try {
          await createAddress({
            name: form.value.fullName,
            street: form.value.street,
            city: form.value.city,
            state: form.value.state,
            zip: form.value.zip,
          })
        } catch (e) {
          console.warn('Address saving skipped:', e)
        }
      }

      const orderRecord = await createOrder(
        {
          totalAmount: cartStore.total,
          shippingAddress: shippingString,
          paymentMethod: paymentMethod.value,
          email: form.value.email,
        },
        cartStore.items
      )

      const provider = activePaymentProvider.value
      await provider.processOrder({
        order: orderRecord,
        email: form.value.email,
        couponCode: cartStore.coupon?.code || null,
        redirect,
        router,
        cartStore,
        toastStore,
      })
    } catch (err) {
      console.error('Checkout error:', err)
      errorMessage.value =
        err?.response?.error ||
        err?.message ||
        'We could not process your order. Please verify your details and try again.'
    } finally {
      processingOrder.value = false
    }
  }

  return {
    savedAddresses,
    paymentMethod,
    activePaymentProvider,
    processingOrder,
    errorMessage,
    form,
    selectSavedAddress,
    loadSavedAddresses,
    placeOrder,
  }
}
