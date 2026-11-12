import { createRouter, createWebHistory } from 'vue-router'
import { pb } from '../services/pocketbase'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'Handcrafted Greeting Cards' },
  },
  {
    path: '/shop',
    name: 'shop',
    component: () => import('../views/ShopView.vue'),
    meta: { title: 'Shop All Cards' },
  },
  {
    path: '/shop/card/:slug',
    name: 'product-detail',
    component: () => import('../views/ProductDetailView.vue'),
    meta: { title: 'Card Details' },
  },
  {
    path: '/product/:slug',
    redirect: (to) => `/shop/card/${to.params.slug}`,
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('../views/CartView.vue'),
    meta: { title: 'Your Shopping Cart' },
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('../views/CheckoutView.vue'),
    meta: { title: 'Secure Checkout' },
  },
  {
    path: '/checkout/success',
    name: 'checkout-success',
    component: () => import('../views/CheckoutSuccessView.vue'),
    meta: { title: 'Order Confirmed' },
  },
  {
    path: '/account',
    name: 'account',
    component: () => import('../views/AccountView.vue'),
    meta: { requiresAuth: true, title: 'My Account' },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true, title: 'Profile Settings' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: 'Sign In' },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
    meta: { title: 'Create Account' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: 'Page Not Found' },
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
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !pb.authStore.isValid) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

// Dynamically update document title
router.afterEach((to) => {
  const baseTitle = 'Pocket Commerce'
  document.title = to.meta.title ? `${to.meta.title} | ${baseTitle}` : baseTitle
})
