import { createEntityModule } from '@/core/entity/createEntityModule'
import { AttachmentsApi } from '@/libs/api/modules/attachments.api'
import { QueryKeys } from '@/libs/react-query/queryKeys'
import { normalizeListQuery } from '@/shared/api/listQuery'
import type { ClientAttachmentsQueryParams } from '@/types/api/attachments'

export const attachmentsModule = createEntityModule({
  name: 'attachments',
  entity: 'attachments',
  endpoints: {
    list: (clientId: string, query?: ClientAttachmentsQueryParams) =>
      AttachmentsApi.getClientAttachments(clientId, query),
    create: AttachmentsApi.addClientAttachment,
    update: async () => undefined,
    remove: AttachmentsApi.deleteById,
  },
  queryKeys: {
    all: QueryKeys.attachments.all,
    list: (query?: ClientAttachmentsQueryParams) =>
      QueryKeys.attachments.byClient(
        'all',
        normalizeListQuery('attachmentsByClient', query) as Record<string, unknown>,
      ),
    byClient: (clientId: string, query?: ClientAttachmentsQueryParams) =>
      QueryKeys.attachments.byClient(
        clientId,
        normalizeListQuery('attachmentsByClient', query) as Record<string, unknown>,
      ),
    details: (id: string) => QueryKeys.attachments.byClient('download', { id }),
    detail: (id: string) => QueryKeys.attachments.byClient('download', { id }),
  },
  permissions: {
    view: 'read',
    upload: 'create',
    delete: 'delete',
  },
  columns: {
    key: 'attachments.columns',
  },
  filters: {
    key: 'attachments.filters',
    fields: ['Search'],
  },
  defaults: {
    query: {
      PageNumber: 1,
      PageSize: 20,
    },
  },
  invalidation: {
    create: [['attachments']],
    delete: [['attachments']],
  },
  routes: {
    detail: id => `/attachments/${id}`,
  },
})
