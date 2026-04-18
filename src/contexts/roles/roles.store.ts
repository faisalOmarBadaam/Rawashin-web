import { create } from 'zustand'

import { RolesApi } from '@/libs/api/modules/roles.api'
import { queryClient } from '@/libs/react-query/queryClient'
import { QueryKeys } from '@/libs/react-query/queryKeys'

const ROLES_KEY = QueryKeys.roles.all
const CLIENT_ROLES_KEY = (clientId: string) => QueryKeys.roles.byClient(clientId)

type RolesState = {
  list: string[]
  clientRoles: string[]
  loading: boolean
  error: string | null

  fetchRoles: () => Promise<void>
  fetchClientRoles: (clientId: string) => Promise<void>
  assignRole: (userId: string, roleName: string) => Promise<void>
  unassignRole: (userId: string, roleName: string) => Promise<void>
}

export const useRolesStore = create<RolesState>(set => ({
  list: [],
  clientRoles: [],
  loading: false,
  error: null,

  fetchRoles: async () => {
    set({ loading: true, error: null })
    try {
      const roles = await queryClient.fetchQuery({
        queryKey: ROLES_KEY,
        queryFn: () => RolesApi.list(),
      })

      set({
        list: roles ?? [],
        loading: false,
      })
    } catch (e: any) {
      set({
        loading: false,
        error: e?.message ?? 'Failed to load roles',
      })
    }
  },

  fetchClientRoles: async clientId => {
    set({ loading: true, error: null })
    try {
      const roles = await queryClient.fetchQuery({
        queryKey: CLIENT_ROLES_KEY(clientId),
        queryFn: () => RolesApi.getByClientId(clientId),
      })

      set({
        clientRoles: roles ?? [],
        loading: false,
      })
    } catch (e: any) {
      set({
        loading: false,
        error: e?.message ?? 'Failed to load client roles',
      })
    }
  },

  assignRole: async (userId, roleName) => {
    set({ loading: true, error: null })
    try {
      await RolesApi.assign(userId, roleName)

      queryClient.invalidateQueries({ queryKey: ROLES_KEY })
      queryClient.invalidateQueries({ queryKey: CLIENT_ROLES_KEY(userId) })
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to assign role' })
      throw e
    } finally {
      set({ loading: false })
    }
  },

  unassignRole: async (userId, roleName) => {
    set({ loading: true, error: null })
    try {
      await RolesApi.unassign(userId, roleName)

      queryClient.invalidateQueries({ queryKey: ROLES_KEY })
      queryClient.invalidateQueries({ queryKey: CLIENT_ROLES_KEY(userId) })
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to unassign role' })
      throw e
    } finally {
      set({ loading: false })
    }
  },
}))
