'use client'

import { useCallback, useEffect, useState } from 'react'

import { TransactionsApi } from '@/libs/api/modules/transactions.api'

type ClientDebtBalance = {
  totalDebt: number
  lastUpdated: string | null
}

export const useClientDebtBalance = (clientId?: string) => {
  const [debtBalance, setDebtBalance] = useState<ClientDebtBalance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshDebtBalance = useCallback(async () => {
    if (!clientId) return

    setLoading(true)
    setError(null)

    try {
      const totalDebt = await TransactionsApi.getClientDebtAmount(clientId)

      setDebtBalance({
        totalDebt: Number(totalDebt ?? 0),
        lastUpdated: null,
      })
    } catch (e: any) {
      setError(e?.message ?? 'فشل تحميل رصيد الدين')
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    if (!clientId) return
    refreshDebtBalance()
  }, [clientId, refreshDebtBalance])

  return {
    debtBalance,
    loading,
    error,
    refreshDebtBalance,
  }
}
