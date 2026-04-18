'use client'

import { useEffect, useState } from 'react'

import { ClientType } from '@/types/api/clients'
import { useClientsStore } from '@/contexts/clients/clients.store'
import { useTransactionsStore } from '@/contexts/transactions/transactions.store'

type DashboardStats = {
  clientsCount: number
  merchantsCount: number
  partnersCount: number
  clientTotalSum: number
  merchantTotalSum: number
}

export function useDashboardAnalytics() {
  const fetchClientsCount = useClientsStore(s => s.fetchStatisticsCount)
  const fetchTransactionsSum = useTransactionsStore(s => s.fetchStatisticsTotalSum)

  const [stats, setStats] = useState<DashboardStats>({
    clientsCount: 0,
    merchantsCount: 0,
    partnersCount: 0,
    clientTotalSum: 0,
    merchantTotalSum: 0
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadStatistics = async () => {
      setLoading(true)
      setError(null)

      try {
        const [
          clientsCount,
          merchantsCount,
          partnersCount,
          clientTotalSum,
          merchantTotalSum
        ] = await Promise.all([
          fetchClientsCount(ClientType.Client),
          fetchClientsCount(ClientType.Merchant),
          fetchClientsCount(ClientType.Partner),
          fetchTransactionsSum(ClientType.Client),
          fetchTransactionsSum(ClientType.Merchant)
        ])

        if (cancelled) return

        setStats({
          clientsCount,
          merchantsCount,
          partnersCount,
          clientTotalSum,
          merchantTotalSum
        })
      } catch (e: any) {
        if (cancelled) return
        setError(e?.message ?? 'فشل تحميل إحصائيات لوحة التحكم')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadStatistics()

    return () => {
      cancelled = true
    }
  }, [fetchClientsCount, fetchTransactionsSum])

  return {
    stats,
    loading,
    error
  }
}
