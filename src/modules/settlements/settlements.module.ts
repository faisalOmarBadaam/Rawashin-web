import { createEntityModule } from '@/core/entity/createEntityModule'
import { SettlementsApi } from '@/libs/api/modules/settlements.api'
import { QueryKeys } from '@/libs/react-query/queryKeys'
import { normalizeListQuery } from '@/shared/api/listQuery'
import type { SettlementsQueryParams } from '@/types/api/settlements'
import { settlementsColumnsAdapter } from './settlements.columns.adapter'

export const settlementsModule = createEntityModule({
  name: 'settlements',
  entity: 'settlements',
  endpoints: {
    list: SettlementsApi.getAll,
    details: SettlementsApi.getById,
    create: SettlementsApi.create,
    update: SettlementsApi.update,
    remove: SettlementsApi.cancel,
  },
  queryKeys: {
    all: QueryKeys.settlements.all,
    list: (query?: SettlementsQueryParams) =>
      QueryKeys.settlements.list(
        normalizeListQuery('settlements', query) as Record<string, unknown>,
      ),
    details: QueryKeys.settlements.detail,
    detail: QueryKeys.settlements.detail,
    byClient: (clientId: string, query?: SettlementsQueryParams) =>
      QueryKeys.settlements.byClient(
        clientId,
        normalizeListQuery('settlements', query) as Record<string, unknown>,
      ),
  },
  permissions: {
    view: 'read',
    create: 'create',
    process: 'update',
    complete: 'update',
    cancel: 'update',
  },
  columns: {
    list: settlementsColumnsAdapter.list,
    clientList: settlementsColumnsAdapter.clientList,
  },
  filters: {
    key: 'settlements.filters',
    fields: ['Search', 'Status', 'FromDate', 'ToDate'],
  },
  defaults: {
    query: {
      PageNumber: 1,
      PageSize: 10,
    },
  },
  invalidation: {
    create: [['settlements'], ['clients']],
    update: [['settlements']],
    delete: [['settlements']],
  },
  routes: {
    list: '/settlements',
    detail: id => `/settlements/${id}`,
  },
})
