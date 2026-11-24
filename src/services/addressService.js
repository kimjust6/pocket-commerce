import { pb } from './pbClient'

export async function getUserAddresses() {
  if (!pb.authStore.isValid || !pb.authStore.model) return []
  try {
    return await pb.collection('addresses').getFullList({
      filter: `user = '${pb.authStore.model.id}'`,
      sort: '-created',
    })
  } catch (err) {
    console.error('Error fetching addresses:', err)
    return []
  }
}

export async function createAddress(addressData) {
  return await pb.collection('addresses').create({
    ...addressData,
    user: pb.authStore.model?.id,
  })
}

export async function updateAddress(id, addressData) {
  return await pb.collection('addresses').update(id, addressData)
}

export async function deleteAddress(id) {
  return await pb.collection('addresses').delete(id)
}
