import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query'
import { toast } from 'react-toastify'

import { invalidateAll, invalidateAllAndDetails } from './queryInvalidation'

type EntityKeys = {
  all: readonly unknown[]
  details?: (id: string) => readonly unknown[]
  detail?: (id: string) => readonly unknown[]
}

type MutationUiOptions = {
  successMessage?: string
  errorMessage?: string
}

export const createEntityMutation = <TData, TVariables>(params: {
  mutationFn: (variables: TVariables) => Promise<TData>
  queryKeys: EntityKeys
  options?: UseMutationOptions<TData, unknown, TVariables>
  ui?: MutationUiOptions
}): UseMutationResult<TData, unknown, TVariables> => {
  const queryClient = useQueryClient()
  const userOnSuccess = params.options?.onSuccess
  const userOnError = params.options?.onError

  return useMutation<TData, unknown, TVariables>({
    ...params.options,
    mutationFn: params.mutationFn,
    onSuccess: async (data, variables, context, mutationContext) => {
      await invalidateAll(queryClient, params.queryKeys)
      if (params.ui?.successMessage) toast.success(params.ui.successMessage)
      await userOnSuccess?.(data, variables, context, mutationContext)
    },
    onError: async (error, variables, context, mutationContext) => {
      const message = error instanceof Error ? error.message : undefined

      if (params.ui?.errorMessage) toast.error(params.ui.errorMessage)
      else if (message) toast.error(message)

      await userOnError?.(error, variables, context, mutationContext)
    },
  })
}

export const updateEntityMutation = <TData, TVariables extends { id: string }>(params: {
  mutationFn: (variables: TVariables) => Promise<TData>
  queryKeys: EntityKeys
  options?: UseMutationOptions<TData, unknown, TVariables>
  ui?: MutationUiOptions
}): UseMutationResult<TData, unknown, TVariables> => {
  const queryClient = useQueryClient()
  const userOnSuccess = params.options?.onSuccess
  const userOnError = params.options?.onError

  return useMutation<TData, unknown, TVariables>({
    ...params.options,
    mutationFn: params.mutationFn,
    onSuccess: async (data, variables, context, mutationContext) => {
      await invalidateAllAndDetails(queryClient, params.queryKeys, variables.id)
      if (params.ui?.successMessage) toast.success(params.ui.successMessage)
      await userOnSuccess?.(data, variables, context, mutationContext)
    },
    onError: async (error, variables, context, mutationContext) => {
      const message = error instanceof Error ? error.message : undefined

      if (params.ui?.errorMessage) toast.error(params.ui.errorMessage)
      else if (message) toast.error(message)

      await userOnError?.(error, variables, context, mutationContext)
    },
  })
}

export const deleteEntityMutation = <TVariables extends string>(params: {
  mutationFn: (id: TVariables) => Promise<void>
  queryKeys: EntityKeys
  options?: UseMutationOptions<void, unknown, TVariables>
  ui?: MutationUiOptions
}): UseMutationResult<void, unknown, TVariables> => {
  const queryClient = useQueryClient()
  const userOnSuccess = params.options?.onSuccess
  const userOnError = params.options?.onError

  return useMutation<void, unknown, TVariables>({
    ...params.options,
    mutationFn: params.mutationFn,
    onSuccess: async (data, id, context, mutationContext) => {
      await invalidateAllAndDetails(queryClient, params.queryKeys, id)
      if (params.ui?.successMessage) toast.success(params.ui.successMessage)
      await userOnSuccess?.(data, id, context, mutationContext)
    },
    onError: async (error, variables, context, mutationContext) => {
      const message = error instanceof Error ? error.message : undefined

      if (params.ui?.errorMessage) toast.error(params.ui.errorMessage)
      else if (message) toast.error(message)

      await userOnError?.(error, variables, context, mutationContext)
    },
  })
}
