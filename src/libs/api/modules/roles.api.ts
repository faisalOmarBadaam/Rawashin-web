import { api } from '../service'
import { endpoints } from '../endpoints'

export const RolesApi = {
  list() {
    return api.get<string[]>(endpoints.roles.list)
  },

  getByClientId(clientId: string) {
    return api.get<string[]>(endpoints.roles.byClientId(clientId))
  },

  assign(userId: string, roleName: string) {
    return api.request<void>(
      'POST',
      endpoints.roles.assign,
      undefined,
      { userId, roleName }
    )
  },

  unassign(userId: string, roleName: string) {
    return api.request<void>(
      'POST',
      endpoints.roles.unassign,
      undefined,
      { userId, roleName }
    )
  }
}
