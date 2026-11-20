import { createRouter, createWebHistory } from 'vue-router'
import { pb } from '../services/pocketbase'
import { updateSeoMeta, buildWebsiteJsonLd } from '../utils/seo'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: {
      title: 'Handcrafted Greeting Cards',
      description: 'Explore our collection of funny, thoughtful, and custom-illustrated cards printed locally on 100% recycled paper stock.',
    },
  },
  {
    path: '/shop',
    name: 'shop',
    component: () => import('../views/ShopView.vue'),
    meta: {
      title: 'Shop All Cards',
      description: 'Browse handcrafted greeting cards for birthdays, thank you notes, love, foodies, and animal lovers.',
    },
  },
  {
    path: '/shop/card/:slug',
    name: 'product-detail',
    component: () => import('../views/ProductDetailView.vue'),
    meta: {
      title: 'Card Details',
      description: 'Handcrafted greeting card printed on 100% recycled cotton paper stock.',
    },
  },
  {
    path: '/product/:slug',
    redirect: (to) => `/shop/card/${to.params.slug}`,
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('../views/CartView.vue'),
    meta: { title: 'Your Shopping Cart', robots: 'noindex, nofollow' },
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('../views/CheckoutView.vue'),
    meta: { title: 'Secure Checkout', robots: 'noindex, nofollow' },
  },
  {
    path: '/checkout/success',
    name: 'checkout-success',
    component: () => import('../views/CheckoutSuccessView.vue'),
    meta: { title: 'Order Confirmed', robots: 'noindex, nofollow' },
  },
  {
    path: '/account',
    name: 'account',
    component: () => import('../views/AccountView.vue'),
    meta: { requiresAuth: true, title: 'My Account', robots: 'noindex, nofollow' },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true, title: 'Profile Settings', robots: 'noindex, nofollow' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: 'Sign In', robots: 'noindex, nofollow' },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
    meta: { title: 'Create Account', robots: 'noindex, nofollow' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: 'Page Not Found', robots: 'noindex, nofollow' },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0, behavior: 'smooth' }
  },
})

// Route navigation guard for authenticated routes
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !pb.authStore.isValid) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  return true
})

// Dynamically update document title and SEO metadata
router.afterEach((to) => {
  const jsonLd = to.name === 'home' && typeof window !== 'undefined'
    ? buildWebsiteJsonLd(window.location.origin)
    : null

  updateSeoMeta({
    title: to.meta.title,
    description: to.meta.description,
    robots: to.meta.robots || 'index, follow',
    canonicalPath: to.path,
    jsonLd,
  })
})
