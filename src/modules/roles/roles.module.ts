import { createEntityModule } from '@/core/entity/createEntityModule'
import { RolesApi } from '@/libs/api/modules/roles.api'
import { QueryKeys } from '@/libs/react-query/queryKeys'

export const rolesModule = createEntityModule({
  name: 'roles',
  entity: 'roles',
  endpoints: {
    list: RolesApi.list,
    details: RolesApi.getByClientId,
    create: ({ userId, roleName }: { userId: string; roleName: string }) =>
      RolesApi.assign(userId, roleName),
    update: ({ userId, roleName }: { userId: string; roleName: string }) =>
      RolesApi.assign(userId, roleName),
    remove: ({ userId, roleName }: { userId: string; roleName: string }) =>
      RolesApi.unassign(userId, roleName),
  },
  queryKeys: {
    all: QueryKeys.roles.all,
    list: () => QueryKeys.roles.all,
    details: (id: string) => QueryKeys.roles.byClient(id),
    detail: (id: string) => QueryKeys.roles.byClient(id),
    byUser: QueryKeys.roles.byUser,
  },
  permissions: {
    view: 'read',
    manage: 'update',
  },
  columns: {
    key: 'roles.columns',
  },
  filters: {
    key: 'roles.filters',
    fields: [],
  },
  defaults: {
    query: {},
  },
  invalidation: {
    create: [['roles']],
    update: [['roles']],
    delete: [['roles']],
  },
  routes: {
    list: '/roles',
  },
})
