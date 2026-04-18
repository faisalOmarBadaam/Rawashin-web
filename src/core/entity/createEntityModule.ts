import type { EntityInvalidationMap, EntityModule } from './entity.types'

type EntityPermissions = Record<string, string | boolean>

export type EntityModuleConfig<
  TQuery extends Record<string, unknown>,
  TColumnsFactory,
  TFilters,
  TEndpoints,
  TQueryKeys,
> = {
  name: string
  /** canonical entity identifier (defaults to name for compatibility) */
  entity?: string
  endpoints: TEndpoints
  queryKeys: TQueryKeys
  permissions: EntityPermissions
  columns: TColumnsFactory
  filters: TFilters
  defaults: {
    query: TQuery
  }
  /** phase-5 extensions (optional, backward compatible) */
  invalidation?: EntityInvalidationMap
  routes?: {
    list?: string
    create?: string
    detail?: (id: string) => string
    edit?: (id: string) => string
  }
  store?: {
    key?: string
  }
}

export const createEntityModule = <
  TQuery extends Record<string, unknown>,
  TColumnsFactory,
  TFilters,
  TEndpoints,
  TQueryKeys,
>(
  config: EntityModuleConfig<TQuery, TColumnsFactory, TFilters, TEndpoints, TQueryKeys>,
): EntityModule<TQuery, TColumnsFactory, TFilters, TEndpoints, TQueryKeys> => ({
  ...config,
  entity: config.entity ?? config.name,
})

export type { EntityInvalidationMap, EntityInvalidationTarget, EntityModule } from './entity.types'
