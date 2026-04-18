import { normalizeListQuery, toApiQueryParams } from '@/shared/listing/listQuery.normalize'
import { endpoints } from '../endpoints'
import { api } from '../service'

import type {
  CancelSettlementRequest,
  FinalizeSettlementDto,
  SettlementDto,
  SettlementListResult,
  SettlementPagedResult,
  SettlementRequestDto,
  SettlementsQueryParams,
  SubMerchantsSettlementResult,
} from '@/types/api/settlements'

export const SettlementsApi = {
  getAll(params?: SettlementsQueryParams) {
    return api.get<SettlementPagedResult>(
      endpoints.settlements.base,
      toApiQueryParams(normalizeListQuery(params, 'settlements'), 'settlements'),
    )
  },

  getById(id: string) {
    return api.get<SettlementDto>(endpoints.settlements.byId(id))
  },

  create(clientId: string, data: SettlementRequestDto) {
    return api.post<string, SettlementRequestDto>(
      endpoints.settlements.createByClient(clientId),
      data,
    )
  },

  update(id: string, data: SettlementRequestDto) {
    return api.put<string, SettlementRequestDto>(endpoints.settlements.update(id), data)
  },

  getClientSettlements(clientId: string, params?: SettlementsQueryParams) {
    return api.get<SettlementPagedResult>(
      endpoints.settlements.clientSettlementsPaged(clientId),
      toApiQueryParams(normalizeListQuery(params, 'clientSettlements'), 'clientSettlements'),
    )
  },

  getMerchantSettlements(merchantId: string) {
    return api.get<SettlementListResult>(endpoints.settlements.merchantSettlements(merchantId))
  },

  settleSubMerchants(merchantId: string) {
    return api.request<SubMerchantsSettlementResult>(
      'POST',
      endpoints.merchant.subMerchantsSettlement(merchantId),
      undefined,
    )
  },

  process(id: string) {
    return api.request<SettlementDto>('PUT', endpoints.settlements.process(id), undefined)
  },

  complete(id: string, payload: FinalizeSettlementDto) {
    return api.request<void>('POST', endpoints.settlements.complete(id), {
      method: payload.method,
      paymentReference: payload.paymentReference ?? '',
      adminNote: payload.adminNote ?? null,
    })
  },
  cancel(id: string, payload: CancelSettlementRequest) {
    return api.put<SettlementDto, CancelSettlementRequest>(
      endpoints.settlements.cancel(id),
      payload,
    )
  },

  getSettlementDetailsByReference(referenceId: string) {
    return api.get<SettlementDto['transactions']>(
      endpoints.settlements.settlementDetailsByReference(referenceId),
    )
  },
}
