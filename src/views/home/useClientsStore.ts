import { useEffect, useState } from 'react'

import type { ClientType } from '@/types/api/clients'
import { useClientsStore } from '@/contexts/clients/clients.store'

export function useClientCounters(clientType: ClientType) {
  const fetchStatisticsCount = useClientsStore(
    state => state.fetchStatisticsCount
  )

  const [count, setCount] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    fetchStatisticsCount(clientType)
      .then(result => mounted && setCount(result))
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [clientType, fetchStatisticsCount])

  return { count, loading }
}
