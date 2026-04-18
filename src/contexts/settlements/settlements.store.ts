import { create } from 'zustand'

import { SettlementsApi } from '@/libs/api/modules/settlements.api'
import { queryClient } from '@/libs/react-query/queryClient'
import { QueryKeys } from '@/libs/react-query/queryKeys'
import { settlementsModule } from '@/modules/settlements/settlements.module'
import { unwrapApiResponse } from '@/shared/listing/apiResponse.unwrap'
import { normalizeListQuery } from '@/shared/listing/listQuery.normalize'

import type {
  CancelSettlementRequest,
  FinalizeSettlementDto,
  SettlementDto,
  SettlementPagedResult,
  SettlementRequestDto,
  SettlementsQueryParams,
  SubMerchantsSettlementResult,
} from '@/types/api/settlements'

const SETTLEMENTS_KEY = (query: SettlementsQueryParams) =>
  QueryKeys.settlements.list(normalizeListQuery(query, 'settlements') as Record<string, unknown>)

const CLIENT_SETTLEMENTS_KEY = (clientId: string, query: SettlementsQueryParams) =>
  QueryKeys.settlements.byClient(
    clientId,
    normalizeListQuery(query, 'clientSettlements') as Record<string, unknown>,
  )

const SETTLEMENT_KEY = (id: string) => QueryKeys.settlements.detail(id)

type SettlementsState = {
  list: SettlementDto[]
  totalCount: number
  loading: boolean
  error: string | null

  selectedSettlement: SettlementDto | null
  query: SettlementsQueryParams

  setQuery: (query: Partial<SettlementsQueryParams>, options?: { resetPage?: boolean }) => void

  fetchSettlements: () => Promise<void>
  fetchSettlementById: (id: string) => Promise<void>

  createSettlement: (clientId: string, payload: SettlementRequestDto) => Promise<string>
  updateSettlement: (id: string, payload: SettlementRequestDto) => Promise<string>

  getClientSettlements: (
    clientId: string,
    params?: SettlementsQueryParams,
  ) => Promise<SettlementPagedResult>

  getMerchantSettlements: (merchantId: string) => Promise<SettlementDto[]>
  settleSubMerchants: (
    merchantId: string,
    payload: { subMerchantId?: string[] | null },
  ) => Promise<SubMerchantsSettlementResult>

  processSettlement: (id: string) => Promise<SettlementDto>

  completeSettlement: (id: string, payload: FinalizeSettlementDto) => Promise<void>

  cancelSettlement: (id: string, payload: CancelSettlementRequest) => Promise<SettlementDto>
}

export const useSettlementsStore = create<SettlementsState>((set, get) => ({
  list: [],
  totalCount: 0,
  loading: false,
  error: null,

  selectedSettlement: null,

  query: {
    // TODO: legacy adapter - removable after migration verification.
    ...(settlementsModule.defaults.query as SettlementsQueryParams),
  },

  setQuery: (q, options) => {
    set(state => {
      const nextQuery = { ...state.query, ...q }
      if (options?.resetPage) nextQuery.PageNumber = 1
      return { query: nextQuery }
    })
  },

  fetchSettlements: async () => {
    set({ loading: true, error: null })
    try {
      const query = get().query
      const data = await queryClient.fetchQuery({
        queryKey: SETTLEMENTS_KEY(query),
        // TODO: legacy adapter - removable after migration verification.
        queryFn: () =>
          settlementsModule.endpoints.list(
            normalizeListQuery(query, 'settlements') as SettlementsQueryParams,
          ),
        staleTime: 0,
      })

      set({
        list: data.items ?? [],
        totalCount: data.totalCount,
        loading: false,
      })
    } catch (e: any) {
      set({
        loading: false,
        error: e?.message ?? 'Failed to load settlements',
      })
    }
  },

  fetchSettlementById: async id => {
    set({ loading: true, error: null })
    try {
      const settlement = await queryClient.fetchQuery<SettlementDto>({
        queryKey: SETTLEMENT_KEY(id),
        // TODO: legacy adapter - removable after migration verification.
        queryFn: async () =>
          unwrapApiResponse<SettlementDto>(await settlementsModule.endpoints.details(id)),
      })
      set({ selectedSettlement: settlement, loading: false })
    } catch (e: any) {
      set({
        loading: false,
        error: e?.message ?? 'Failed to load settlement',
      })
    }
  },

  createSettlement: async (clientId: string, payload: SettlementRequestDto) => {
    const settlementId = await SettlementsApi.create(clientId, payload)
    queryClient.invalidateQueries({ queryKey: QueryKeys.settlements.all })
    return settlementId
  },

  updateSettlement: async (id: string, payload: SettlementRequestDto) => {
    const settlementId = await SettlementsApi.update(id, payload)
    queryClient.invalidateQueries({ queryKey: QueryKeys.settlements.all })
    queryClient.invalidateQueries({ queryKey: SETTLEMENT_KEY(id) })
    return settlementId
  },

  getClientSettlements: async (clientId, params) => {
    const normalizedQuery = normalizeListQuery(
      params,
      'clientSettlements',
    ) as SettlementsQueryParams

    return queryClient.fetchQuery({
      queryKey: CLIENT_SETTLEMENTS_KEY(clientId, normalizedQuery),
      queryFn: () => SettlementsApi.getClientSettlements(clientId, normalizedQuery),
      staleTime: 0,
    })
  },

  getMerchantSettlements: merchantId => SettlementsApi.getMerchantSettlements(merchantId),

  settleSubMerchants: async merchantId => {
    const result = await SettlementsApi.settleSubMerchants(merchantId)
    queryClient.invalidateQueries({ queryKey: QueryKeys.settlements.all })
    return result
  },

  processSettlement: async id => {
    const settlement = await SettlementsApi.process(id)

    queryClient.invalidateQueries({ queryKey: QueryKeys.settlements.all })
    queryClient.invalidateQueries({ queryKey: SETTLEMENT_KEY(id) })

    set({ selectedSettlement: settlement })
    return settlement
  },

  completeSettlement: async (id, payload) => {
    set({ loading: true })
    try {
      await SettlementsApi.complete(id, payload)
      queryClient.invalidateQueries({ queryKey: QueryKeys.settlements.all })
      queryClient.invalidateQueries({ queryKey: SETTLEMENT_KEY(id) })
    } finally {
      set({ loading: false })
    }
  },

  cancelSettlement: async (id, payload) => {
    const settlement = await SettlementsApi.cancel(id, payload)

    queryClient.invalidateQueries({ queryKey: QueryKeys.settlements.all })
    queryClient.invalidateQueries({ queryKey: SETTLEMENT_KEY(id) })

    set({ selectedSettlement: settlement })
    return settlement
  },
}))
