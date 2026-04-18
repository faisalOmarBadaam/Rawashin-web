import { createEntityModule } from '@/core/entity/createEntityModule'
import { ClientsApi } from '@/libs/api/modules/clients.api'
import { SettlementsApi } from '@/libs/api/modules/settlements.api'
import { QueryKeys } from '@/libs/react-query/queryKeys'
import type { SubMerchantRequestDto, UpdateSubMerchantRequestDto } from '@/types/api/clients'

export const merchantModule = createEntityModule({
  name: 'merchant',
  entity: 'merchant',
  endpoints: {
    list: SettlementsApi.getMerchantSettlements,
    details: SettlementsApi.getMerchantSettlements,
    create: ({ merchantId, payload }: { merchantId: string; payload: SubMerchantRequestDto }) =>
      ClientsApi.createSubMerchant(merchantId, payload),
    update: ({
      merchantId,
      subMerchantId,
      payload,
    }: {
      merchantId: string
      subMerchantId: string
      payload: UpdateSubMerchantRequestDto
    }) => ClientsApi.updateSubMerchant(merchantId, subMerchantId, payload),
    remove: ({ merchantId, subMerchantId }: { merchantId: string; subMerchantId: string }) =>
      ClientsApi.deleteSubMerchant(merchantId, subMerchantId),
    settleChildren: SettlementsApi.settleSubMerchants,
  },
  queryKeys: {
    all: QueryKeys.merchant.all,
    list: (merchantId: string) => QueryKeys.merchant.subMerchants(merchantId),
    details: (merchantId: string) => QueryKeys.merchant.settlements(merchantId),
    detail: (merchantId: string) => QueryKeys.merchant.settlements(merchantId),
  },
  permissions: {
    view: 'read',
    create: 'create',
    edit: 'update',
    delete: 'delete',
  },
  columns: {
    key: 'merchant.columns',
  },
  filters: {
    key: 'merchant.filters',
    fields: ['Search'],
  },
  defaults: {
    query: {
      PageNumber: 1,
      PageSize: 10,
    },
  },
  invalidation: {
    create: [['merchant'], ['clients']],
    update: [['merchant'], ['clients']],
    delete: [['merchant'], ['clients']],
  },
})
