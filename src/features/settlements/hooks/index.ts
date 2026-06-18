
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { keepPreviousData } from '@tanstack/react-query'

import { CancelSettlement, CompleteSettlement, getSettlementDetails, getSettlements, getSettlementsStatistics, ProcessSettlement } from '../api'
import type { PaginatedResponse } from '@/shared/types/BaseResponse'
import type {
  CompleteSettlementPayload,
  SettlementDetailsResponse,
  SettlementListItem,
  SettlementListParams,
} from '../types'


export type SettlementsStatisticsResponse = {
  total: number
  new: number
  inProcess: number
  completed: number
  closedWithoutCompletion: number
  totalAmount: number
}

export function useSettlementsStatistics() {
  return useQuery({
    queryKey: ['settlements', 'statistics'],
    queryFn: async (): Promise<SettlementsStatisticsResponse> => {
      const response = await getSettlementsStatistics()
      return response.data
    },
  })
}

export function useSettlements(params?: SettlementListParams) {
  return useQuery<PaginatedResponse<SettlementListItem>, Error>({
    queryKey: ['settlements', params],
    queryFn: () => getSettlements(params),
    placeholderData: keepPreviousData,
  })
}

export function useSettlement(id?: string) {
  return useQuery<SettlementDetailsResponse, Error>({
    queryKey: ['settlements', 'details', id],
    queryFn: () => getSettlementDetails(id!),
    enabled: Boolean(id),
  })
}

export function useProcessSettlement() {
const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (settlementId: string) => {
      await ProcessSettlement(settlementId)

    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['settlements'] })
    },
  })
}

export function useCompleteSettlement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      settlementId,
      payload,
    }: {
      settlementId: string
      payload: CompleteSettlementPayload
    }) => {
      await CompleteSettlement(settlementId, payload)
    },
    onSuccess: async (_data, { settlementId }) => {
      await queryClient.invalidateQueries({ queryKey: ['settlements'] })
      await queryClient.invalidateQueries({ queryKey: ['settlements', 'details', settlementId] })
    },
  })
}


export function useCancelSettlement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settlementId: string) => {
             await CancelSettlement(settlementId)
    },
    onSuccess: async (_data, settlementId) => {
      await queryClient.invalidateQueries({ queryKey: ['settlements', 'details', settlementId] })
    },
  })
}