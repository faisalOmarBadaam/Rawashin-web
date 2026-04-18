import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions
} from '@tanstack/react-query'

type Params<TData, TVariables, TContext = unknown> = {
  mutationFn: (variables: TVariables) => Promise<TData>
  invalidateKeys?: QueryKey[]
  options?: Omit<UseMutationOptions<TData, unknown, TVariables, TContext>, 'mutationFn'>
}

export const useEntityMutation = <TData, TVariables, TContext = unknown>({
  mutationFn,
  invalidateKeys,
  options
}: Params<TData, TVariables, TContext>) => {
  const queryClient = useQueryClient()
  const userOnSuccess = options?.onSuccess

  return useMutation<TData, unknown, TVariables, TContext>({
    ...(options ?? {}),
    mutationFn,
    onSuccess: async (data, variables, onMutateResult, context) => {
      if (invalidateKeys?.length) {
        await Promise.all(invalidateKeys.map(key => queryClient.invalidateQueries({ queryKey: key })))
      }

      await userOnSuccess?.(data, variables, onMutateResult, context)
    }
  })
}
