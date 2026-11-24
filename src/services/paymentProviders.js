import { CreditCard, Coins } from 'lucide-vue-next'
import { createStripeCheckoutSession } from './paymentService'
import StripePaymentInfo from '../components/checkout/StripePaymentInfo.vue'
import BananoPaymentInfo from '../components/checkout/BananoPaymentInfo.vue'

export const PAYMENT_PROVIDERS = {
  stripe: {
    value: 'stripe',
    label: 'Stripe Checkout',
    icon: CreditCard,
    iconClass: 'text-primary',
    infoComponent: StripePaymentInfo,
    async processOrder({ order, email, couponCode, redirect }) {
      const session = await createStripeCheckoutSession({
        orderId: order.id,
        email,
        couponCode: couponCode || null,
      })

      if (session?.url) {
        redirect(session.url)
        return
      }
      throw new Error('Stripe did not return a checkout URL.')
    },
  },
  banano: {
    value: 'banano',
    label: 'Banano Crypto',
    icon: Coins,
    iconClass: 'text-amber-500',
    infoComponent: BananoPaymentInfo,
    async processOrder({ order, cartStore, toastStore, router }) {
      cartStore.clearCart()
      toastStore.success('Your order has been placed!')
      router.push({
        path: '/checkout/success',
        query: { order_id: order.id },
      })
    },
  },
}

export const PAYMENT_OPTIONS = Object.values(PAYMENT_PROVIDERS)
