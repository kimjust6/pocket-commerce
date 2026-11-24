import { pb } from './pbClient'

export async function createStripeCheckoutSession(payload) {
  return await pb.send('/api/stripe/create-checkout-session', {
    method: 'POST',
    body: payload,
  })
}

export async function verifyStripeSession(sessionId) {
  return await pb.send(`/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`, {
    method: 'GET',
  })
}
