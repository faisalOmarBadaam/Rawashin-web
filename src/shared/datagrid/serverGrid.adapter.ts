import type { GridSortModel } from '@mui/x-data-grid'

import type { ListQueryInput } from '@/shared/listing/listQuery.types'

type GridToQueryArgs = {
  page: number
  pageSize: number
  sortModel: GridSortModel
  search?: string
  filters?: Omit<ListQueryInput, 'PageNumber' | 'PageSize' | 'SortBy' | 'IsDesc' | 'Search'>
  sortFieldMap?: Record<string, string>
}

export const mapGridStateToListQuery = ({
  page,
  pageSize,
  sortModel,
  search,
  filters,
  sortFieldMap,
}: GridToQueryArgs): ListQueryInput => {
  const sortField = sortModel[0]?.field
  const mappedSortField = sortField ? (sortFieldMap?.[sortField] ?? sortField) : undefined

  return {
    ...(filters ?? {}),
    PageNumber: page + 1,
    PageSize: pageSize,
    SortBy: mappedSortField,
    IsDesc: sortModel[0]?.sort ? sortModel[0]?.sort === 'desc' : undefined,
    Search: search,
  }
}
