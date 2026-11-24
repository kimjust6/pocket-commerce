/**
 * Backward-compatible facade re-exporting focused domain services.
 * Prefer importing directly from the specific domain service module.
 */
export { pb, getFileUrl } from './pbClient'
export { getCategories, getProducts, getProduct, createReview } from './catalogService'
export { createOrder, getUserOrders } from './orderService'
export { getUserAddresses, createAddress, updateAddress, deleteAddress } from './addressService'
export { createStripeCheckoutSession, verifyStripeSession } from './paymentService'
export { loginWithPassword, loginWithOAuth2, registerUser, updateUserRecord } from './authService'
