import { createEntityModule } from '@/core/entity/createEntityModule'
import { ClientsApi } from '@/libs/api/modules/clients.api'
import { QueryKeys } from '@/libs/react-query/queryKeys'
import { normalizeListQuery } from '@/shared/api/listQuery'
import { ClientType, type ClientQueryParams } from '@/types/api/clients'

export const clientsModule = createEntityModule({
  name: 'clients',
  entity: 'clients',
  endpoints: {
    list: ClientsApi.getAll,
    details: ClientsApi.getById,
    create: ClientsApi.create,
    update: ClientsApi.update,
    remove: ClientsApi.delete,
  },
  queryKeys: {
    all: QueryKeys.clients.all,
    list: (query?: ClientQueryParams) =>
      QueryKeys.clients.list(normalizeListQuery('clients', query) as Record<string, unknown>),
    details: QueryKeys.clients.detail,
    detail: QueryKeys.clients.detail,
    children: QueryKeys.clients.children,
    lookup: QueryKeys.clients.lookup,
  },
  permissions: {
    view: 'read',
    create: 'create',
    update: 'update',
    delete: 'delete',
  },
  columns: {
    key: 'clients.columns',
  },
  filters: {
    key: 'clients.filters',
    fields: ['Search', 'ClientType', 'ParentClientId', 'IsActive', 'IsReceivedCard', 'ParentsOnly'],
  },
  defaults: {
    query: {
      PageNumber: 1,
      PageSize: 10,
      ClientType: ClientType.Client,
    },
  },
  invalidation: {
    create: [['clients']],
    update: [['clients']],
    delete: [['clients']],
  },
  routes: {
    list: '/clients',
    create: '/clients/add',
    detail: id => `/clients/${id}`,
    edit: id => `/clients/edit/${id}`,
  },
})
