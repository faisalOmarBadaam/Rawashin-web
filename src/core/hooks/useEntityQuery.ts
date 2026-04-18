import { useQuery, type QueryKey, type UseQueryOptions } from '@tanstack/react-query'

type Params<TQueryFnData, TData = TQueryFnData, TKey extends QueryKey = QueryKey> = {
  key: TKey
  queryFn: () => Promise<TQueryFnData>
  enabled?: boolean
  options?: Omit<UseQueryOptions<TQueryFnData, unknown, TData, TKey>, 'queryKey' | 'queryFn' | 'enabled'>
}

export const useEntityQuery = <TQueryFnData, TData = TQueryFnData, TKey extends QueryKey = QueryKey>({
  key,
  queryFn,
  enabled = true,
  options
}: Params<TQueryFnData, TData, TKey>) => {
  return useQuery<TQueryFnData, unknown, TData, TKey>({
    queryKey: key,
    queryFn,
    enabled,
    ...(options ?? {})
  })
}
