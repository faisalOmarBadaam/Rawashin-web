import { create } from 'zustand'

type EntityId = string | number

export type EntityPagination = {
  page: number
  pageSize: number
  total: number
}

export type EntityLoadingState = {
  list: boolean
  details: boolean
  create: boolean
  update: boolean
  delete: boolean
}

export type EntityAdapter<
  TListItem,
  TDetails,
  TCreateDto,
  TUpdateDto,
  TFilter,
  TCreateResult = TDetails,
  TUpdateResult = TDetails
> = {
  list: (
    filters: TFilter,
    pagination: Pick<EntityPagination, 'page' | 'pageSize'>
  ) => Promise<{ items: TListItem[]; total: number }>
  getById: (id: EntityId) => Promise<TDetails>
  create: (dto: TCreateDto) => Promise<TCreateResult>
  update: (id: EntityId, dto: TUpdateDto) => Promise<TUpdateResult>
  delete: (id: EntityId) => Promise<void>
}

export type EntityStoreState<
  TListItem,
  TDetails,
  TCreateDto,
  TUpdateDto,
  TFilter,
  TCreateResult = TDetails,
  TUpdateResult = TDetails
> = {
  list: TListItem[]
  detailsById: Record<EntityId, TDetails>
  filters: TFilter
  pagination: EntityPagination
  loading: EntityLoadingState
  error?: unknown
  setFilters: (filters: Partial<TFilter>) => void
  resetFilters: () => void
  setPagination: (pagination: Partial<EntityPagination>) => void
  fetchList: () => Promise<void>
  fetchById: (id: EntityId) => Promise<TDetails>
  create: (dto: TCreateDto) => Promise<TCreateResult>
  update: (id: EntityId, dto: TUpdateDto) => Promise<TUpdateResult>
  remove: (id: EntityId) => Promise<void>
}

export type CreateEntityStoreOptions<
  TListItem,
  TDetails,
  TCreateDto,
  TUpdateDto,
  TFilter,
  TCreateResult = TDetails,
  TUpdateResult = TDetails
> = {
  adapter: EntityAdapter<
    TListItem,
    TDetails,
    TCreateDto,
    TUpdateDto,
    TFilter,
    TCreateResult,
    TUpdateResult
  >
  initialFilters: TFilter
  initialPagination?: Pick<EntityPagination, 'page' | 'pageSize'>
  selectListItemId?: (item: TListItem) => EntityId
  selectDetailsId?: (details: TDetails) => EntityId
  toDetailsFromCreateResult?: (result: TCreateResult) => TDetails | null
  toDetailsFromUpdateResult?: (result: TUpdateResult) => TDetails | null
}

/**
 * Generic entity store factory.
 *
 * Integration approach:
 * - This store calls the injected adapter directly.
 * - React Query integration remains optional and external (inside the adapter or caller layer)
 *   to avoid coupling the core store to a specific cache implementation.
 */
export const createEntityStore = <
  TListItem,
  TDetails,
  TCreateDto,
  TUpdateDto,
  TFilter,
  TCreateResult = TDetails,
  TUpdateResult = TDetails
>(
  options: CreateEntityStoreOptions<
    TListItem,
    TDetails,
    TCreateDto,
    TUpdateDto,
    TFilter,
    TCreateResult,
    TUpdateResult
  >
) => {
  const initialPagination: EntityPagination = {
    page: options.initialPagination?.page ?? 1,
    pageSize: options.initialPagination?.pageSize ?? 10,
    total: 0
  }

  const initialLoading: EntityLoadingState = {
    list: false,
    details: false,
    create: false,
    update: false,
    delete: false
  }

  return create<
    EntityStoreState<
      TListItem,
      TDetails,
      TCreateDto,
      TUpdateDto,
      TFilter,
      TCreateResult,
      TUpdateResult
    >
  >((set, get) => ({
    list: [],
    detailsById: {},
    filters: { ...options.initialFilters },
    pagination: initialPagination,
    loading: initialLoading,
    error: undefined,

    setFilters: filters => {
      set(state => ({
        filters: { ...state.filters, ...filters },
        pagination: { ...state.pagination, page: 1 }
      }))
    },

    resetFilters: () => {
      set(state => ({
        filters: { ...options.initialFilters },
        pagination: { ...state.pagination, page: 1 }
      }))
    },

    setPagination: pagination => {
      set(state => ({
        pagination: {
          ...state.pagination,
          ...pagination
        }
      }))
    },

    fetchList: async () => {
      set(state => ({
        loading: { ...state.loading, list: true },
        error: undefined
      }))

      try {
        const { filters, pagination } = get()

        const result = await options.adapter.list(filters, {
          page: pagination.page,
          pageSize: pagination.pageSize
        })

        set(state => ({
          list: result.items,
          pagination: { ...state.pagination, total: result.total },
          loading: { ...state.loading, list: false }
        }))
      } catch (error) {
        set(state => ({
          loading: { ...state.loading, list: false },
          error
        }))
        throw error
      }
    },

    fetchById: async id => {
      set(state => ({
        loading: { ...state.loading, details: true },
        error: undefined
      }))

      try {
        const details = await options.adapter.getById(id)
        const detailsId = options.selectDetailsId?.(details) ?? id

        set(state => ({
          detailsById: { ...state.detailsById, [detailsId]: details },
          loading: { ...state.loading, details: false }
        }))

        return details
      } catch (error) {
        set(state => ({
          loading: { ...state.loading, details: false },
          error
        }))
        throw error
      }
    },

    create: async dto => {
      set(state => ({
        loading: { ...state.loading, create: true },
        error: undefined
      }))

      try {
        const result = await options.adapter.create(dto)
        const details = options.toDetailsFromCreateResult?.(result) ?? null

        if (details) {
          const detailsId = options.selectDetailsId?.(details)

          if (detailsId !== undefined) {
            set(state => ({
              detailsById: { ...state.detailsById, [detailsId]: details }
            }))
          }
        }

        set(state => ({
          loading: { ...state.loading, create: false }
        }))

        return result
      } catch (error) {
        set(state => ({
          loading: { ...state.loading, create: false },
          error
        }))
        throw error
      }
    },

    update: async (id, dto) => {
      set(state => ({
        loading: { ...state.loading, update: true },
        error: undefined
      }))

      try {
        const result = await options.adapter.update(id, dto)
        const details = options.toDetailsFromUpdateResult?.(result) ?? null

        if (details) {
          const detailsId = options.selectDetailsId?.(details) ?? id

          set(state => ({
            detailsById: { ...state.detailsById, [detailsId]: details }
          }))
        }

        set(state => ({
          loading: { ...state.loading, update: false }
        }))

        return result
      } catch (error) {
        set(state => ({
          loading: { ...state.loading, update: false },
          error
        }))
        throw error
      }
    },

    remove: async id => {
      set(state => ({
        loading: { ...state.loading, delete: true },
        error: undefined
      }))

      try {
        await options.adapter.delete(id)

        set(state => {
          const nextDetailsById = { ...state.detailsById }
          delete nextDetailsById[id]

          const nextList = options.selectListItemId
            ? state.list.filter(item => options.selectListItemId?.(item) !== id)
            : state.list

          return {
            list: nextList,
            detailsById: nextDetailsById,
            pagination: {
              ...state.pagination,
              total:
                options.selectListItemId && state.pagination.total > 0
                  ? state.pagination.total - 1
                  : state.pagination.total
            },
            loading: { ...state.loading, delete: false }
          }
        })
      } catch (error) {
        set(state => ({
          loading: { ...state.loading, delete: false },
          error
        }))
        throw error
      }
    }
  }))
}
