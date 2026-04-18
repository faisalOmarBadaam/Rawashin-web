'use client'

import { useEffect, useMemo, useState, type JSX } from 'react'

import type { SxProps, Theme } from '@mui/material/styles'
import {
  type GridColDef,
  type GridPaginationModel,
  type GridRowClassNameParams,
  type GridSortModel,
  type GridValidRowModel,
} from '@mui/x-data-grid'

import { mapGridStateToListQuery } from '@/shared/datagrid/serverGrid.adapter'
import type { ListQueryInput } from '@/shared/listing/listQuery.types'
import BaseDataGrid from './BaseDataGrid'

type ServerDataGridInitialState = {
  page?: number
  pageSize?: number
  sortModel?: GridSortModel
}

type Props<T extends GridValidRowModel> = {
  columns: GridColDef<T>[]
  rows: T[]
  totalCount: number
  loading: boolean
  getRowId?: (row: T) => string | number
  initialState?: ServerDataGridInitialState
  query?: ListQueryInput
  sortFieldMap?: Record<string, string>
  filters?: Omit<ListQueryInput, 'PageNumber' | 'PageSize' | 'SortBy' | 'IsDesc' | 'Search'>
  onQueryChange: (query: ListQueryInput) => void
  onRowDoubleClick?: (row: T) => void
  getRowClassName?: (params: GridRowClassNameParams<T>) => string
  error?: string | null
  onRetry?: () => void
  sx?: SxProps<Theme>
}

const toSortModel = (query?: ListQueryInput): GridSortModel => {
  const sortBy = typeof query?.SortBy === 'string' ? query.SortBy : undefined
  if (!sortBy) return []

  return [{ field: sortBy, sort: query?.IsDesc ? 'desc' : 'asc' }]
}

export default function ServerDataGrid<T extends GridValidRowModel>({
  columns,
  rows,
  totalCount,
  loading,
  getRowId,
  initialState,
  query,
  filters,
  sortFieldMap,
  onQueryChange,
  onRowDoubleClick,
  getRowClassName,
  error,
  onRetry,
  sx,
}: Props<T>): JSX.Element {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: initialState?.page ?? 0,
    pageSize: initialState?.pageSize ?? 10,
  })
  const [sortModel, setSortModel] = useState<GridSortModel>(initialState?.sortModel ?? [])

  useEffect(() => {
    if (!query) return

    const nextPage = Math.max(0, Number(query.PageNumber ?? 1) - 1)
    const nextPageSize = Math.max(1, Number(query.PageSize ?? 10))
    const nextSortModel = toSortModel(query)

    setPaginationModel(prev =>
      prev.page === nextPage && prev.pageSize === nextPageSize
        ? prev
        : { page: nextPage, pageSize: nextPageSize },
    )
    setSortModel(prev =>
      JSON.stringify(prev) === JSON.stringify(nextSortModel) ? prev : nextSortModel,
    )
  }, [query])

  const resolvedRowId = useMemo(
    () => getRowId ?? ((row: T) => String((row as { id?: string | number }).id ?? '')),
    [getRowId],
  )

  const emitQuery = (nextPage: number, nextPageSize: number, nextSort: GridSortModel) => {
    onQueryChange(
      mapGridStateToListQuery({
        page: nextPage,
        pageSize: nextPageSize,
        sortModel: nextSort,
        search: typeof query?.Search === 'string' ? query.Search : undefined,
        filters,
        sortFieldMap,
      }),
    )
  }

  const handlePaginationChange = (next: GridPaginationModel) => {
    const pageSizeChanged = next.pageSize !== paginationModel.pageSize
    const resolvedNext = pageSizeChanged ? { page: 0, pageSize: next.pageSize } : next

    setPaginationModel(resolvedNext)
    emitQuery(resolvedNext.page, resolvedNext.pageSize, sortModel)
  }

  const handleSortChange = (next: GridSortModel) => {
    setSortModel(next)
    if (paginationModel.page !== 0) {
      const reset = { page: 0, pageSize: paginationModel.pageSize }
      setPaginationModel(reset)
      emitQuery(0, reset.pageSize, next)
      return
    }

    emitQuery(paginationModel.page, paginationModel.pageSize, next)
  }

  return (
    <BaseDataGrid<T>
      rows={rows}
      columns={columns}
      loading={loading}
      totalCount={totalCount}
      getRowId={resolvedRowId}
      onRowDoubleClick={onRowDoubleClick}
      getRowClassName={getRowClassName}
      error={error}
      onRetry={onRetry}
      sx={sx}
      dataGridProps={{
        paginationMode: 'server',
        sortingMode: 'server',
        pageSizeOptions: [10, 20, 50],
        paginationModel,
        sortModel,
        onPaginationModelChange: handlePaginationChange,
        onSortModelChange: handleSortChange,
      }}
    />
  )
}
