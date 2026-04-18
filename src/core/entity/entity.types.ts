export type EntityInvalidationTarget = readonly string[]

export type EntityInvalidationMap = Partial<{
  create: EntityInvalidationTarget[]
  update: EntityInvalidationTarget[]
  delete: EntityInvalidationTarget[]
  custom: EntityInvalidationTarget[]
}>

export type EntityModule<
  TQuery extends Record<string, unknown>,
  TColumnsFactory,
  TFilters,
  TEndpoints,
  TQueryKeys,
> = {
  name: string
  entity: string
  endpoints: TEndpoints
  queryKeys: TQueryKeys
  permissions: Record<string, string | boolean>
  columns: TColumnsFactory
  filters: TFilters
  defaults: {
    query: TQuery
  }
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
