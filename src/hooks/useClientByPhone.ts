import { useState } from 'react'

import { toast } from 'react-toastify'

import { useClientsStore } from '@/contexts/clients/clients.store'
import { ClientType } from '@/types/api/clients'

export const useClientByPhone = () => {
  const fetchClients = useClientsStore(s => s.fetchClients)
  const setQuery = useClientsStore(s => s.setQuery)

  const [loading, setLoading] = useState(false)

  const fetchByPhone = async (phoneNumber: string) => {
    if (phoneNumber.length !== 9) {
    toast.error('الرجاء إدخال رقم الهاتف كاملًا')
    return null
  }

    const previousQuery = useClientsStore.getState().query

    setLoading(true)

    try {
      setQuery(
        {
          Search: phoneNumber,
          PageSize: 1,
          ClientType: ClientType.Client
        },
        { resetPage: true }
      )

      await fetchClients()

      const client = useClientsStore
  .getState()
  .list
  .find(c => c.phoneNumber === phoneNumber)

      if (!client) {
        toast.error('لم يتم العثور على مستفيد بهذا الرقم')
        return null
      }

      return client.fullName || client.organizationName || '—'
    } catch {
      toast.error('فشل في جلب بيانات المستفيد')
      return null
    } finally {
      setQuery(previousQuery)
      setLoading(false)
    }
  }

  return {
    fetchByPhone,
    loading
  }
}
