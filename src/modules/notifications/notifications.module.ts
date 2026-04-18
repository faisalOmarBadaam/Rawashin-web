import { createEntityModule } from '@/core/entity/createEntityModule'
import { NotificationsApi } from '@/libs/api/modules/notifications.api'
import { QueryKeys } from '@/libs/react-query/queryKeys'
import type { SendToAllNotificationRequestDto } from '@/types/api/notifications'

export const notificationsModule = createEntityModule({
  name: 'notifications',
  entity: 'notifications',
  endpoints: {
    list: async () => [],
    details: async () => undefined,
    create: (payload: SendToAllNotificationRequestDto) => NotificationsApi.sendToAll(payload),
    update: async () => undefined,
    remove: async () => undefined,
  },
  queryKeys: {
    all: QueryKeys.notifications.all,
    list: () => QueryKeys.notifications.all,
    details: () => QueryKeys.notifications.all,
    detail: () => QueryKeys.notifications.all,
  },
  permissions: {
    view: 'read',
    create: 'create',
  },
  columns: {
    key: 'notifications.columns',
  },
  filters: {
    key: 'notifications.filters',
    fields: [],
  },
  defaults: {
    query: {},
  },
  invalidation: {
    create: [['notifications']],
  },
})
