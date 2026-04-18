import { createEntityModule } from '@/core/entity/createEntityModule'
import { CommissionsApi } from '@/libs/api/modules/commissions.api'
import { QueryKeys } from '@/libs/react-query/queryKeys'

export const commissionsModule = createEntityModule({
  name: 'commissions',
  entity: 'commissions',
  endpoints: {
    list: CommissionsApi.getByClientId,
    details: CommissionsApi.getByClientId,
    create: CommissionsApi.create,
    update: async () => undefined,
    remove: async () => undefined,
  },
  queryKeys: {
    all: QueryKeys.commissions.all,
    list: (clientId: string) => QueryKeys.commissions.byClient(clientId),
    details: (id: string) => QueryKeys.commissions.byClient(id),
    detail: (id: string) => QueryKeys.commissions.byClient(id),
  },
  permissions: {
    view: 'read',
    create: 'create',
  },
  columns: {
    key: 'commissions.columns',
  },
  filters: {
    key: 'commissions.filters',
    fields: [],
  },
  defaults: {
    query: {},
  },
  invalidation: {
    create: [['commissions'], ['clients']],
  },
})
