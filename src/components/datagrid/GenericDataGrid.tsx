'use client'

import { useMemo } from 'react'

import {
  type GridColDef,
  type GridRowClassNameParams,
  type GridRowSelectionModel,
  type GridSortModel,
  type GridValidRowModel,
} from '@mui/x-data-grid'

import type { SxProps, Theme } from '@mui/material/styles'

import BaseDataGrid from './BaseDataGrid'

const isInteractiveTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false

  return Boolean(
    target.closest(
      'button, a, input, textarea, select, [role="button"], .MuiDataGrid-actionsCell, .MuiDataGrid-checkboxInput',
    ),
  )
}

type QueryState = {
  PageNumber?: number
  PageSize?: number
  SortBy?: string
  SortDir?: 'asc' | 'desc'
}

type GenericDataGridProps<T extends GridValidRowModel> = {
  rows: T[]
  columns: GridColDef<T>[]
  loading: boolean
  totalCount: number
  query: QueryState
  setQuery: (q: QueryState) => void
  getRowId: (row: T) => string | number
  selectionModel?: GridRowSelectionModel
  onSelectionModelChange?: (model: GridRowSelectionModel) => void
  onRowDoubleClick?: (row: T) => void
  getRowClassName?: (params: GridRowClassNameParams<T>) => string
  error?: string | null
  onRetry?: () => void
  sx?: SxProps<Theme>
  /** Fields that should default to descending on first sort click */
  defaultDescFields?: string[]
}

export default function GenericDataGrid<T extends GridValidRowModel>({
  rows,
  columns,
  loading,
  totalCount,
  query,
  setQuery,
  getRowId,
  selectionModel,
  onSelectionModelChange,
  onRowDoubleClick,
  getRowClassName,
  error,
  onRetry,
  sx,
  defaultDescFields,
}: GenericDataGridProps<T>) {
  const pageSize = query.PageSize ?? 10
  const page = (query.PageNumber ?? 1) - 1

  const handleSortChange = (model: GridSortModel) => {
    const field = model[0]?.field
    let dir = model[0]?.sort ?? undefined

    // If this field prefers descending-first and direction is being set for the first time
    if (field && dir === 'asc' && defaultDescFields?.includes(field)) {
      dir = 'desc'
    }

    setQuery({
      SortBy: field,
      SortDir: dir,
      PageNumber: 1,
    })
  }

  // Controlled sort model — keeps MUI arrow in sync with actual query state
  const sortModel: GridSortModel = useMemo(() => {
    if (!query.SortBy) return []
    return [{ field: query.SortBy, sort: query.SortDir ?? null }]
  }, [query.SortBy, query.SortDir])

  const handlePaginationChange = (model: { page: number; pageSize: number }) => {
    setQuery({
      PageNumber: model.page + 1,
      PageSize: model.pageSize,
    })
  }

  const mergedSx = useMemo(
    () => ({
      '& .MuiDataGrid-columnHeaders': {
        fontWeight: 600,
      },
      ...(onRowDoubleClick && {
        '& .MuiDataGrid-row': {
          cursor: 'pointer',
        },
      }),
      ...(sx as object),
    }),
    [onRowDoubleClick, sx],
  )

  return (
    <BaseDataGrid<T>
      rows={rows}
      columns={columns}
      getRowId={getRowId}
      loading={loading}
      totalCount={totalCount}
      checkboxSelection
      keepNonExistentRowsSelected
      error={error}
      onRetry={onRetry}
      onRowDoubleClick={(row, eventTarget) => {
        if (!onRowDoubleClick) return
        if (isInteractiveTarget(eventTarget ?? null)) return
        onRowDoubleClick(row)
      }}
      getRowClassName={getRowClassName}
      sx={mergedSx}
      dataGridProps={{
        paginationMode: 'server',
        sortingMode: 'server',
        pageSizeOptions: [10, 20, 50],
        paginationModel: { page, pageSize },
        sortModel,
        onPaginationModelChange: handlePaginationChange,
        onSortModelChange: handleSortChange,
        rowSelectionModel: selectionModel,
        onRowSelectionModelChange: model => onSelectionModelChange?.(model),
      }}
    />
  )
}
