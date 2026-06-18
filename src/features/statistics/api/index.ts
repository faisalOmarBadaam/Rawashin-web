import { http } from '@/lib/http'
import type { ClientType } from '@/shared/types/ClientType'

export const statisticsEndpoints = {
  clientsCount: 'clients/statistics/count',
  transactionsCount: 'transactions/statistics/count',
  transactionsTotalSum: 'transactions/statistics/totalSum',
} as const

export interface StatisticsQueryParams {
  clientType?: ClientType
}


export const statisticsApi = {
  getClientsCount: async (params?: StatisticsQueryParams): Promise<number> => {
    const response = await http.get<number>(statisticsEndpoints.clientsCount, { params })
    return response.data
  },

  getTransactionsCount: async (params?: StatisticsQueryParams): Promise<number> => {
    const response = await http.get<number>(statisticsEndpoints.transactionsCount, { params })
    return response.data
  },

  getTransactionsTotalSum: async (params?: StatisticsQueryParams): Promise<number> => {
    const response = await http.get<number>(statisticsEndpoints.transactionsTotalSum, { params })
    return response.data
  }
}
