import { pb } from './pbClient'

export async function getUserAddresses() {
  if (!pb.authStore.isValid || !pb.authStore.model) return []
  return await pb.collection('addresses').getFullList({
    filter: pb.filter('user = {:userId}', { userId: pb.authStore.model.id }),
    sort: '-created',
  })
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
