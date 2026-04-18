import type { QueryClient } from '@tanstack/react-query'

import type { EntityModule } from './entity.types'

const toQueryKey = (tokens: readonly string[]) => tokens as unknown as readonly unknown[]

export const invalidateByTokens = (queryClient: QueryClient, tokens: readonly string[]) =>
  queryClient.invalidateQueries({ queryKey: toQueryKey(tokens) })

export const runModuleInvalidation = async (
  queryClient: QueryClient,
  module: Pick<EntityModule<any, any, any, any, any>, 'invalidation'>,
  action: 'create' | 'update' | 'delete' | 'custom',
) => {
  const targets = module.invalidation?.[action] ?? []

  await Promise.all(targets.map(target => invalidateByTokens(queryClient, target)))
}
