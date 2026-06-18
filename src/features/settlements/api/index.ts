import { http } from "@/lib/http"
import type { PaginatedResponse } from '@/shared/types/BaseResponse'
import type {
  CompleteSettlementPayload,
  SettlementDetailsResponse,
  SettlementListItem,
  SettlementListParams,
} from '../types'

const settlementsApi = {
  list: '/settlements',
  details: (settlementId: string) => `/settlements/${settlementId}`,
  create: '/settlements',
  update: (settlementId: string) => `/settlements/${settlementId}`,
  statistics: '/settlements/statistics',
  complete: (settlementId: string) => `/settlements/${settlementId}/complete`,
  cancel: (settlementId: string) => `/settlements/${settlementId}/cancel`,
  process: (settlementId: string) => `/settlements/${settlementId}/process`,
} as const


export function getSettlementsStatistics() {
  return http.get(settlementsApi.statistics)
}

export async function getSettlements(
  params?: SettlementListParams,
): Promise<PaginatedResponse<SettlementListItem>> {
  const response = await http.get<PaginatedResponse<SettlementListItem>>(
    settlementsApi.list,
    { params },
  )

  return response.data
}

export async function getSettlementDetails(
  settlementId: string,
): Promise<SettlementDetailsResponse> {
  const response = await http.get<SettlementDetailsResponse>(
    settlementsApi.details(settlementId),
  )

  return response.data
}


export async function CompleteSettlement(
  settlementId: string,
  payload: CompleteSettlementPayload,
): Promise<void> {
  await http.post(
    settlementsApi.complete(settlementId),
    payload,
  )
}

export async function CancelSettlement(
  settlementId: string,
): Promise<void> {
  await http.get(
    settlementsApi.cancel(settlementId),
  )
}

export async function ProcessSettlement(
  settlementId: string,
): Promise<void> {
  await http.get(
    settlementsApi.process(settlementId),
  )
}
