import type { QueryClient, QueryKey } from '@tanstack/react-query'

import { QueryKeys, withTenantScope } from './queryKeys'

type EntityQueryKeys = {
  all: QueryKey
  list?: (...args: any[]) => QueryKey
  details?: (id: string) => QueryKey
  detail?: (id: string) => QueryKey
}

const resolveDetailsKey = (keys: EntityQueryKeys, id: string): QueryKey | null => {
  if (typeof keys.details === 'function') return keys.details(id)
  if (typeof keys.detail === 'function') return keys.detail(id)
  return null
}

export const invalidateQueryKey = (queryClient: QueryClient, queryKey: QueryKey) =>
  queryClient.invalidateQueries({ queryKey })

export const invalidateList = (
  queryClient: QueryClient,
  keys: EntityQueryKeys,
  ...listArgs: any[]
) => {
  const listKey = typeof keys.list === 'function' ? keys.list(...listArgs) : keys.all
  return invalidateQueryKey(queryClient, listKey)
}

export const invalidateDetails = (queryClient: QueryClient, keys: EntityQueryKeys, id: string) => {
  const detailsKey = resolveDetailsKey(keys, id)
  if (!detailsKey) return Promise.resolve()

  return invalidateQueryKey(queryClient, detailsKey)
}

export const invalidateAll = (queryClient: QueryClient, keys: EntityQueryKeys) =>
  invalidateQueryKey(queryClient, keys.all)

/**
 * Entity-name level invalidation helper (tenant-scoped).
 */
export const invalidateEntity = (queryClient: QueryClient, entity: string) =>
  invalidateQueryKey(queryClient, withTenantScope([entity] as const))

export const invalidateAllAndDetails = async (
  queryClient: QueryClient,
  keys: EntityQueryKeys,
  id?: string,
) => {
  await invalidateAll(queryClient, keys)

  if (id) {
    await invalidateDetails(queryClient, keys, id)
  }
}

export const invalidateClients = (queryClient: QueryClient) =>
  invalidateQueryKey(queryClient, QueryKeys.clients.all)

export const invalidateClient = (queryClient: QueryClient, clientId: string) =>
  invalidateQueryKey(queryClient, QueryKeys.clients.detail(clientId))

export const invalidateTransactions = (queryClient: QueryClient) =>
  invalidateQueryKey(queryClient, QueryKeys.transactions.all)

export const invalidateTransaction = (queryClient: QueryClient, id: string) =>
  invalidateQueryKey(queryClient, QueryKeys.transactions.detail(id))

export const invalidateSettlements = (queryClient: QueryClient) =>
  invalidateQueryKey(queryClient, QueryKeys.settlements.all)

export const invalidateSettlement = (queryClient: QueryClient, id: string) =>
  invalidateQueryKey(queryClient, QueryKeys.settlements.detail(id))

export const invalidateSupportTickets = (queryClient: QueryClient) =>
  invalidateQueryKey(queryClient, QueryKeys.supportTickets.all)

export const invalidateSupportTicketMessages = (queryClient: QueryClient, id: string) =>
  invalidateQueryKey(queryClient, QueryKeys.supportTickets.messages(id))
