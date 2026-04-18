import { create } from 'zustand'

import { TransactionsApi } from '@/libs/api/modules/transactions.api'
import { queryClient } from '@/libs/react-query/queryClient'
import { QueryKeys } from '@/libs/react-query/queryKeys'
import { transactionsModule } from '@/modules/transactions/transactions.module'
import { normalizeListQuery } from '@/shared/api/listQuery'

import type { ClientType } from '@/types/api/clients'
import type {
  ChargerChargeCustomerRequestDto,
  ChargerStatisticsDto,
  ClientBalanceDto,
  DepositDto,
  GetClientsBalancesSumRequestDto,
  RefundTransactionRequestDto,
  TransactionBalanceSummaryDto,
  TransactionChargeDto,
  TransactionForClientDto,
  TransactionsQueryParams,
  UploadBatchFileResultDto,
  UploadBatchResultDto,
} from '@/types/api/transaction'

type TransactionsState = {
  list: TransactionForClientDto[]
  totalCount: number
  loading: boolean
  error: string | null
  balance: ClientBalanceDto | number | null
  fetchBalance: (clientId: string) => Promise<ClientBalanceDto | number>
  query: TransactionsQueryParams
  setQuery: (q: Partial<TransactionsQueryParams>, options?: { resetPage?: boolean }) => void

  /* 🔴 statistics */
  statisticsCount: Record<ClientType, number>
  statisticsTotalSum: Record<ClientType, number>

  fetchTransactions: () => Promise<void>
  fetchClientTransactions: (clientId: string) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  chargeCreditAccount(payload: TransactionChargeDto): Promise<void>
  debtCreditAccount: (clientId: string, payload: TransactionChargeDto) => Promise<void>

  /* 🔴 statistics APIs */
  fetchStatisticsCount: (clientType?: ClientType) => Promise<number>
  fetchStatisticsTotalSum: (clientType?: ClientType) => Promise<number>
  deposit: (clientId: string, payload: DepositDto) => Promise<void>
  chargerChargeCustomer: (
    clientId: string,
    payload: ChargerChargeCustomerRequestDto,
  ) => Promise<void>

  fetchChargerStatistics: (
    clientId: string,
    params?: TransactionsQueryParams,
  ) => Promise<ChargerStatisticsDto>

  refillCharger: (chargerId: string, amount: number, adminLiquidityId: string) => Promise<void>
  uploadBatch: (partnerId: string, file: File) => Promise<UploadBatchResultDto>
  uploadAccountChargesBatch: (file: File) => Promise<UploadBatchFileResultDto>
  refund: (payload: RefundTransactionRequestDto) => Promise<void>
  getByReference: (
    clientId: string,
    referenceId: string,
  ) => Promise<import('@/types/api/transaction').TransactionDto[]>
  getBalancesTotal: (payload: GetClientsBalancesSumRequestDto) => Promise<number>
  reset: () => void
}

const initialQuery: TransactionsQueryParams = {
  // TODO: legacy adapter - removable after migration verification.
  ...(transactionsModule.defaults.query as TransactionsQueryParams),
}

const EMPTY_STATISTICS: Record<ClientType, number> = {
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  list: [],
  totalCount: 0,
  loading: false,
  error: null,
  balance: null,

  query: initialQuery,

  statisticsCount: { ...EMPTY_STATISTICS },
  statisticsTotalSum: { ...EMPTY_STATISTICS },

  setQuery: (q, options) =>
    set(state => {
      const nextQuery = { ...state.query, ...q }
      if (options?.resetPage) nextQuery.PageNumber = 1
      return { query: nextQuery }
    }),

  fetchTransactions: async () => {
    set({ loading: true, error: null })
    try {
      const normalizedQuery = normalizeListQuery(
        'transactions',
        get().query,
      ) as TransactionsQueryParams

      // TODO: legacy adapter - removable after migration verification.
      const data = await queryClient.fetchQuery({
        queryKey: QueryKeys.transactions.list(normalizedQuery as Record<string, unknown>),
        queryFn: () => transactionsModule.endpoints.list(normalizedQuery),
        staleTime: 0,
      })

      set({
        list: data.items ?? [],
        totalCount: data.totalCount,
        loading: false,
      })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? 'فشل تحميل العمليات' })
    }
  },

  fetchClientTransactions: async clientId => {
    set({ loading: true, error: null })
    try {
      const normalizedQuery = normalizeListQuery(
        'clientTransactions',
        get().query,
      ) as TransactionsQueryParams

      // TODO: legacy adapter - removable after migration verification.
      const data = await queryClient.fetchQuery({
        queryKey: QueryKeys.clients.transactions(
          clientId,
          normalizedQuery as Record<string, unknown>,
        ),
        queryFn: () => TransactionsApi.getClientTransactions(clientId, normalizedQuery),
        staleTime: 0,
      })

      set({
        list: data.items ?? [],
        totalCount: data.totalCount,
        loading: false,
      })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? 'فشل تحميل عمليات المستفيد' })
    }
  },

  deleteTransaction: async id => {
    await TransactionsApi.delete(id)

    queryClient.invalidateQueries({ queryKey: QueryKeys.transactions.all })
    queryClient.invalidateQueries({ queryKey: QueryKeys.transactions.detail(id) })
    queryClient.invalidateQueries({ queryKey: QueryKeys.clients.all })

    set(state => ({
      list: state.list.filter(t => t.id !== id),
      totalCount: Math.max(0, state.totalCount - 1),
    }))
  },

  chargeCreditAccount: async payload => {
    await TransactionsApi.chargeCreditAccount(payload)

    queryClient.invalidateQueries({ queryKey: QueryKeys.transactions.all })
    queryClient.invalidateQueries({ queryKey: QueryKeys.clients.all })
  },
  debtCreditAccount: async (clientId, payload) => {
    await TransactionsApi.debtCreditAccount(payload)

    queryClient.invalidateQueries({ queryKey: QueryKeys.transactions.all })
    queryClient.invalidateQueries({ queryKey: QueryKeys.clients.all })
    queryClient.invalidateQueries({ queryKey: QueryKeys.clients.transactions(clientId) })
    queryClient.invalidateQueries({ queryKey: QueryKeys.transactions.balance(clientId) })
  },
  fetchBalance: async clientId => {
    try {
      const value = await queryClient.fetchQuery({
        queryKey: QueryKeys.transactions.balance(clientId),
        queryFn: () => TransactionsApi.getBalance(clientId),
        staleTime: 0,
      })

      set({ balance: value })
      return value
    } catch (e: any) {
      set({
        error: e?.message ?? 'فشل تحميل الرصيد',
      })
      throw e
    }
  },

  fetchStatisticsCount: async clientType => {
    const value = await queryClient.fetchQuery({
      queryKey: QueryKeys.transactions.statsCount(
        clientType !== undefined ? String(clientType) : undefined,
      ),
      queryFn: () => TransactionsApi.getStatisticsCount(clientType),
      staleTime: 0,
    })

    set(state => ({
      statisticsCount: {
        ...state.statisticsCount,
        [clientType!]: value,
      },
    }))
    return value
  },

  fetchStatisticsTotalSum: async clientType => {
    const value = await queryClient.fetchQuery({
      queryKey: QueryKeys.transactions.totalSum(
        clientType !== undefined ? String(clientType) : undefined,
      ),
      queryFn: () => TransactionsApi.getStatisticsTotalSum(clientType),
      staleTime: 0,
    })

    const totalSum = (value as TransactionBalanceSummaryDto).balanceAvailable

    set(state => ({
      statisticsTotalSum: {
        ...state.statisticsTotalSum,
        [clientType!]: totalSum,
      },
    }))
    return totalSum
  },

  deposit: async (clientId, payload) => {
    await TransactionsApi.deposit(payload)
    queryClient.invalidateQueries({ queryKey: QueryKeys.transactions.all })
    queryClient.invalidateQueries({ queryKey: QueryKeys.transactions.balance(clientId) })
    queryClient.invalidateQueries({ queryKey: QueryKeys.clients.transactions(clientId) })
    queryClient.invalidateQueries({ queryKey: QueryKeys.clients.all })
    await get().fetchBalance(clientId)
  },

  chargerChargeCustomer: async (clientId, payload) => {
    await TransactionsApi.chargerChargeCustomer(clientId, payload)
    queryClient.invalidateQueries({ queryKey: QueryKeys.transactions.all })
    queryClient.invalidateQueries({ queryKey: QueryKeys.transactions.balance(clientId) })
    queryClient.invalidateQueries({ queryKey: QueryKeys.clients.transactions(clientId) })
    queryClient.invalidateQueries({ queryKey: QueryKeys.clients.all })
    await Promise.all([get().fetchBalance(clientId), get().fetchClientTransactions(clientId)])
  },
  refillCharger: async (chargerId, amount, adminLiquidityId) => {
    await TransactionsApi.refillCharger({
      chargerId,
      amount,
      adminLiquidityId,
    })

    queryClient.invalidateQueries({ queryKey: QueryKeys.transactions.all })
    queryClient.invalidateQueries({ queryKey: QueryKeys.transactions.balance(chargerId) })
    queryClient.invalidateQueries({ queryKey: QueryKeys.clients.all })

    await get().fetchBalance(chargerId)
  },

  uploadBatch: async (partnerId, file) => {
    return await TransactionsApi.uploadBatch(partnerId, file)
  },

  uploadAccountChargesBatch: async file => {
    return await TransactionsApi.uploadAccountChargesBatch(file)
  },

  refund: async payload => {
    await TransactionsApi.refund(payload)
    queryClient.invalidateQueries({ queryKey: QueryKeys.transactions.all })
    queryClient.invalidateQueries({ queryKey: QueryKeys.clients.all })
  },

  getByReference: async (clientId, referenceId) => {
    return await TransactionsApi.getByReference(clientId, referenceId)
  },

  getBalancesTotal: async payload => {
    return await TransactionsApi.getBalancesTotal(payload)
  },

  fetchChargerStatistics: async (clientId, params) => {
    const normalizedQuery = normalizeListQuery('transactions', params) as TransactionsQueryParams

    return await queryClient.fetchQuery({
      queryKey: QueryKeys.transactions.clientStats(
        clientId,
        normalizedQuery as Record<string, unknown>,
      ),
      queryFn: () => TransactionsApi.getChargerStatistics(clientId, normalizedQuery),
      staleTime: 0,
    })
  },

  reset: () =>
    set({
      list: [],
      totalCount: 0,
      loading: false,
      error: null,
      balance: null,
      query: initialQuery,
      // chargerStatistics: null,
      statisticsCount: { ...EMPTY_STATISTICS },
      statisticsTotalSum: { ...EMPTY_STATISTICS },
    }),
}))
