import { useQuery, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query'

import { ClientsApi } from '@/libs/api/modules'
import { normalizeListQuery } from '@/shared/api/listQuery'
import type {
  ClientDto,
  ClientPagedResult,
  ClientQueryParams,
  CreateClientRequestDto,
  UpdateClientRequestDto,
} from '@/types/api/clients'
import { createEntityMutation, deleteEntityMutation, updateEntityMutation } from './mutationHelpers'
import { QueryKeys } from './queryKeys'

const normalizeClientsQuery = (query?: ClientQueryParams) => normalizeListQuery('clients', query)

export const clientsQueryKeys = {
  all: QueryKeys.clients.all,
  list: (query?: ClientQueryParams) =>
    QueryKeys.clients.list(normalizeClientsQuery(query) as Record<string, unknown>),
  details: (id: string) => QueryKeys.clients.detail(id),
  /** compatibility alias */
  detail: (id: string) => QueryKeys.clients.detail(id),
}

export const useClientListQuery = (
  query?: ClientQueryParams,
  options?: Omit<
    UseQueryOptions<
      ClientPagedResult,
      unknown,
      ClientPagedResult,
      ReturnType<typeof clientsQueryKeys.list>
    >,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: clientsQueryKeys.list(query),
    queryFn: () => ClientsApi.getAll(query),
    ...options,
  })

export const useClientDetailsQuery = (
  id: string,
  options?: Omit<
    UseQueryOptions<ClientDto, unknown, ClientDto, ReturnType<typeof clientsQueryKeys.details>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: clientsQueryKeys.details(id),
    queryFn: () => ClientsApi.getById(id),
    enabled: Boolean(id) && (options?.enabled ?? true),
    ...options,
  })

export const useCreateClientMutation = (
  options?: UseMutationOptions<ClientDto, unknown, CreateClientRequestDto>,
) => {
  return createEntityMutation<ClientDto, CreateClientRequestDto>({
    mutationFn: payload => ClientsApi.create(payload),
    queryKeys: clientsQueryKeys,
    options,
  })
}

export const useUpdateClientMutation = (
  options?: UseMutationOptions<ClientDto, unknown, { id: string; payload: UpdateClientRequestDto }>,
) => {
  return updateEntityMutation<ClientDto, { id: string; payload: UpdateClientRequestDto }>({
    mutationFn: ({ id, payload }) => ClientsApi.update(id, payload),
    queryKeys: clientsQueryKeys,
    options,
  })
}

export const useDeleteClientMutation = (options?: UseMutationOptions<void, unknown, string>) => {
  return deleteEntityMutation<string>({
    mutationFn: id => ClientsApi.delete(id),
    queryKeys: clientsQueryKeys,
    options,
  })
}
