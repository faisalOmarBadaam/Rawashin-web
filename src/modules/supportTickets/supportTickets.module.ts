import { createEntityModule } from '@/core/entity/createEntityModule'
import { SupportTicketsApi } from '@/libs/api/modules/supportTickets.api'
import { QueryKeys } from '@/libs/react-query/queryKeys'
import { normalizeListQuery } from '@/shared/api/listQuery'
import type { SupportTicketsQueryParams } from '@/types/api/supportTickets'
import { supportTicketsColumnsAdapter } from './supportTickets.columns.adapter'

export const supportTicketsModule = createEntityModule({
  name: 'supportTickets',
  entity: 'supportTickets',
  endpoints: {
    list: SupportTicketsApi.getAll,
    details: SupportTicketsApi.getById,
    create: SupportTicketsApi.create,
    update: SupportTicketsApi.updateStatus,
    remove: async () => undefined,
  },
  queryKeys: {
    all: QueryKeys.supportTickets.all,
    list: (query?: SupportTicketsQueryParams) =>
      QueryKeys.supportTickets.list(
        normalizeListQuery('supportTickets', query) as Record<string, unknown>,
      ),
    details: QueryKeys.supportTickets.detail,
    detail: QueryKeys.supportTickets.detail,
    byClient: (clientId: string, query?: SupportTicketsQueryParams) =>
      QueryKeys.supportTickets.byClient(
        clientId,
        normalizeListQuery('supportTickets', query) as Record<string, unknown>,
      ),
  },
  permissions: {
    view: 'read',
    create: 'create',
    updateStatus: 'update',
  },
  columns: {
    list: supportTicketsColumnsAdapter.list,
  },
  filters: {
    key: 'supportTickets.filters',
    fields: ['Search', 'Category', 'Status'],
  },
  defaults: {
    query: {
      PageNumber: 1,
      PageSize: 20,
    },
  },
  invalidation: {
    create: [['supportTickets']],
    update: [['supportTickets']],
  },
  routes: {
    list: '/support-ticket',
    detail: id => `/support-ticket/${id}`,
  },
})
