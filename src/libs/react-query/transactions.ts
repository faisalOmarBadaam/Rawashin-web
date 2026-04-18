import { useQuery, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query'

import { TransactionsApi } from '@/libs/api/modules'
import { normalizeListQuery } from '@/shared/api/listQuery'
import type {
  ClientTransactionsPagedResult,
  TransactionDto,
  TransactionRequestDto,
  TransactionResultDto,
  TransactionsQueryParams,
} from '@/types/api/transaction'
import { createEntityMutation, deleteEntityMutation, updateEntityMutation } from './mutationHelpers'
import { QueryKeys } from './queryKeys'

const normalizeTransactionsQuery = (query?: TransactionsQueryParams) =>
  normalizeListQuery('transactions', query)

export const transactionsQueryKeys = {
  all: QueryKeys.transactions.all,
  list: (query?: TransactionsQueryParams) =>
    QueryKeys.transactions.list(normalizeTransactionsQuery(query) as Record<string, unknown>),
  details: (id: string) => QueryKeys.transactions.detail(id),
  /** compatibility alias */
  detail: (id: string) => QueryKeys.transactions.detail(id),
}

export const useTransactionListQuery = (
  query?: TransactionsQueryParams,
  options?: Omit<
    UseQueryOptions<
      ClientTransactionsPagedResult,
      unknown,
      ClientTransactionsPagedResult,
      ReturnType<typeof transactionsQueryKeys.list>
    >,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: transactionsQueryKeys.list(query),
    queryFn: () => TransactionsApi.getAll(query),
    ...options,
  })

export const useTransactionDetailsQuery = (
  id: string,
  options?: Omit<
    UseQueryOptions<
      TransactionDto,
      unknown,
      TransactionDto,
      ReturnType<typeof transactionsQueryKeys.details>
    >,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: transactionsQueryKeys.details(id),
    queryFn: () => TransactionsApi.getById(id),
    enabled: Boolean(id) && (options?.enabled ?? true),
    ...options,
  })

export const useCreateTransactionMutation = (
  options?: UseMutationOptions<TransactionResultDto, unknown, TransactionRequestDto>,
) => {
  return createEntityMutation<TransactionResultDto, TransactionRequestDto>({
    mutationFn: payload => TransactionsApi.create(payload),
    queryKeys: transactionsQueryKeys,
    options,
  })
}

export const useUpdateTransactionMutation = (
  options?: UseMutationOptions<
    TransactionResultDto,
    unknown,
    { id: string; payload: TransactionRequestDto }
  >,
) => {
  return updateEntityMutation<TransactionResultDto, { id: string; payload: TransactionRequestDto }>(
    {
      // NOTE: backend contract does not expose PUT /api/Transactions/{id}; reject explicitly instead of creating.
      mutationFn: async ({ id, payload }) => {
        void id
        void payload
        throw new Error('Transaction update is not supported by backend contract')
      },
      queryKeys: transactionsQueryKeys,
      options,
    },
  )
}

export const useDeleteTransactionMutation = (
  options?: UseMutationOptions<void, unknown, string>,
) => {
  return deleteEntityMutation<string>({
    mutationFn: id => TransactionsApi.delete(id),
    queryKeys: transactionsQueryKeys,
    options,
  })
}
