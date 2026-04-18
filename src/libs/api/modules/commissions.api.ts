import { endpoints } from '../endpoints'
import { api } from '../service'

import type { CommissionsDto, CreateCommissionDto } from '@/types/api/finance'

export const CommissionsApi = {
  create(clientId: string, payload: CreateCommissionDto) {
    return api.post<void, CreateCommissionDto>(endpoints.commissions.client(clientId), payload)
  },

  getByClientId(clientId: string) {
    return api.get<CommissionsDto>(endpoints.commissions.client(clientId))
  },
}
