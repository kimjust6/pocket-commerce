import { ref } from 'vue'
import { getUserAddresses, createAddress, deleteAddress } from '../services/addressService'

export function useAddresses() {
  const addresses = ref([])
  const loadingAddresses = ref(false)
  const savingAddress = ref(false)

  async function loadAddresses() {
    loadingAddresses.value = true
    try {
      addresses.value = await getUserAddresses()
      return addresses.value
    } finally {
      loadingAddresses.value = false
    }
  }

  async function addAddress(addressData) {
    savingAddress.value = true
    try {
      await createAddress(addressData)
      addresses.value = await getUserAddresses()
    } finally {
      savingAddress.value = false
    }
  }

  async function removeAddress(id) {
    await deleteAddress(id)
    addresses.value = addresses.value.filter((a) => a.id !== id)
  }

  return {
    addresses,
    loadingAddresses,
    savingAddress,
    loadAddresses,
    addAddress,
    removeAddress,
  }
}
