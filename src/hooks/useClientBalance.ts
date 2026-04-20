'use client'

import { useCallback, useEffect } from 'react'

import { useTransactionsStore } from '@/contexts/transactions/transactions.store'

export const useClientBalance = (clientId?: string) => {
  const balanceData = useTransactionsStore(state => state.balance)
  const loading = useTransactionsStore(state => state.loading)
  const error = useTransactionsStore(state => state.error)
  const fetchBalance = useTransactionsStore(state => state.fetchBalance)

  const refreshBalance = useCallback(async () => {
    if (!clientId) return
    await fetchBalance(clientId)
  }, [clientId, fetchBalance])

  useEffect(() => {
    if (!clientId) return
    refreshBalance()
  }, [clientId, refreshBalance])

  return {
    balanceData,
    loading,
    error,
    refreshBalance,
  }
}
