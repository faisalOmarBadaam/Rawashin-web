import { useMemo } from 'react'

import type { SxProps, Theme } from '@mui/material/styles'

import {
  type GridColDef,
  type GridFilterModel,
  type GridPaginationModel,
  type GridRowClassNameParams,
  type GridRowSelectionModel,
  type GridSortModel,
  type GridValidRowModel,
} from '@mui/x-data-grid'

import BaseDataGrid from './BaseDataGrid'

const isInteractiveTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false

  return Boolean(
    target.closest(
      [
        'button',
        'a',
        'input',
        'textarea',
        'select',
        '[role="button"]',
        '.MuiDataGrid-actionsCell',
        '.MuiDataGrid-checkboxInput',
      ].join(', '),
    ),
  )
}

export type DataGridQueryState = {
  PageNumber?: number
  PageSize?: number
  SortBy?: string
  SortDir?: 'asc' | 'desc'

  // خلها مفتوحة للفلاتر
  Search?: string
  Status?: string
  Type?: string
  [key: string]: unknown
}

type GenericDataGridProps<T extends GridValidRowModel, Q extends DataGridQueryState> = {
  rows: T[]
  columns: GridColDef<T>[]
  loading: boolean
  totalCount: number

  query: Q
  setQuery: React.Dispatch<React.SetStateAction<Q>>

  getRowId: (row: T) => string | number

  selectionModel?: GridRowSelectionModel
  onSelectionModelChange?: (model: GridRowSelectionModel) => void

  onRowDoubleClick?: (row: T) => void
  getRowClassName?: (params: GridRowClassNameParams<T>) => string

  error?: string | null
  onRetry?: () => void
  sx?: SxProps<Theme>

  checkboxSelection?: boolean
  keepNonExistentRowsSelected?: boolean
  disableRowSelectionOnClick?: boolean

  showToolbar?: boolean
  pageSizeOptions?: number[]
    defaultDescFields?: string[]


  filterModel?: GridFilterModel
  onFilterModelChange?: (model: GridFilterModel) => void
}

export default function GenericDataGrid<
  T extends GridValidRowModel,
  Q extends DataGridQueryState = DataGridQueryState,
>({
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
  checkboxSelection = false,
  keepNonExistentRowsSelected = true,
  disableRowSelectionOnClick = true,
  showToolbar = true,
  pageSizeOptions = [10, 20, 50],
  defaultDescFields = [],
  filterModel,
  onFilterModelChange,
}: GenericDataGridProps<T, Q>) {
  const pageSize = query.PageSize ?? 10
  const page = Math.max((query.PageNumber ?? 1) - 1, 0)

  const effectiveColumns = useMemo<GridColDef<T>[]>(() => {
    if (!defaultDescFields.length) return columns

    return columns.map(column => {
      if (!defaultDescFields.includes(column.field)) return column
      if (column.sortingOrder) return column

      return {
        ...column,
        sortingOrder: ['desc', 'asc', null],
      }
    })
  }, [columns, defaultDescFields])

  const sortModel: GridSortModel = useMemo(() => {
    if (!query.SortBy || !query.SortDir) return []

    return [
      {
        field: query.SortBy,
        sort: query.SortDir,
      },
    ]
  }, [query.SortBy, query.SortDir])

  const handleSortChange = (model: GridSortModel) => {
    const field = model[0]?.field
    const dir = model[0]?.sort ?? undefined

    setQuery(prev => ({
      ...prev,
      SortBy: field,
      SortDir: dir || undefined,
      PageNumber: 1,
    }))
  }

  const handlePaginationChange = (model: GridPaginationModel) => {
    setQuery(prev => {
      const pageSizeChanged = model.pageSize !== (prev.PageSize ?? 10)

      return {
        ...prev,
        PageNumber: pageSizeChanged ? 1 : model.page + 1,
        PageSize: model.pageSize,
      }
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
      columns={effectiveColumns}
      getRowId={getRowId}
      loading={loading}
      totalCount={totalCount}
      checkboxSelection={checkboxSelection}
      keepNonExistentRowsSelected={keepNonExistentRowsSelected}
      disableRowSelectionOnClick={disableRowSelectionOnClick}
      error={error}
      onRetry={onRetry}
      onRowDoubleClick={(row, eventTarget) => {
        if (!onRowDoubleClick) return
        if (isInteractiveTarget(eventTarget ?? null)) return

        onRowDoubleClick(row)
      }}
      getRowClassName={getRowClassName}
      sx={mergedSx}
      wrapperSx={{ width: '100%' }}
      dataGridProps={{
        showToolbar,

        paginationMode: 'server',
        sortingMode: 'server',
        filterMode: filterModel ? 'server' : 'client',

        pageSizeOptions,

        paginationModel: {
          page,
          pageSize,
        },

        sortModel,
        onPaginationModelChange: handlePaginationChange,
        onSortModelChange: handleSortChange,

        filterModel,
        onFilterModelChange,

        rowSelectionModel: selectionModel,
        onRowSelectionModelChange: model => onSelectionModelChange?.(model),

        disableRowSelectionExcludeModel: true,
      }}
    />
  )
}