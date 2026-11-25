import { pb } from './pbClient'

export async function createOrder(orderPayload, items) {
  const currentUserId = pb.authStore.model?.id || null

  const orderRecord = await pb.collection('orders').create({
    user: currentUserId,
    total_amount: orderPayload.totalAmount,
    status: 'pending',
    shipping_address: orderPayload.shippingAddress,
    payment_method: orderPayload.paymentMethod || 'card',
    contact_email: orderPayload.email,
  })

  for (const item of items) {
    try {
      await pb.collection('order_items').create({
        order: orderRecord.id,
        variant: item.variantId && item.variantId !== 'default' ? item.variantId : null,
        product: item.productId || null,
        quantity: item.quantity,
        price: item.price,
      })
    } catch (e) {
      try {
        await pb.collection('orders').delete(orderRecord.id)
      } catch {}
      throw e
    }
  }

  return orderRecord
}

export async function getUserOrders() {
  if (!pb.authStore.isValid || !pb.authStore.model) return []
  return await pb.collection('orders').getFullList({
    filter: pb.filter('user = {:userId}', { userId: pb.authStore.model.id }),
    sort: '-created',
  })
}
