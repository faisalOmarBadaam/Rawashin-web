import { useCallback, useMemo } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'
import {
  DataGrid,
  GridOverlay,
  type DataGridProps,
  type GridColDef,
  type GridRowClassNameParams,
  type GridRowParams,
  type GridValidRowModel,
} from '@mui/x-data-grid'

type BaseDataGridProps<T extends GridValidRowModel> = {
  rows: T[]
  columns: GridColDef<T>[]
  loading: boolean
  totalCount: number
  getRowId?: (row: T) => string | number
  onRowDoubleClick?: (row: T, eventTarget?: EventTarget | null) => void
  getRowClassName?: (params: GridRowClassNameParams<T>) => string
  error?: string | null
  onRetry?: () => void
  sx?: SxProps<Theme>
  wrapperSx?: SxProps<Theme>
  height?: number | string
  autoHeight?: boolean
  checkboxSelection?: boolean
  keepNonExistentRowsSelected?: boolean
  disableRowSelectionOnClick?: boolean
  dataGridProps?: Omit<
    DataGridProps<T>,
    | 'rows'
    | 'columns'
    | 'loading'
    | 'rowCount'
    | 'getRowId'
    | 'onRowDoubleClick'
    | 'getRowClassName'
    | 'autoHeight'
    | 'sx'
    | 'slots'
    | 'checkboxSelection'
    | 'keepNonExistentRowsSelected'
    | 'disableRowSelectionOnClick'
  >
}

const DEFAULT_PAGE_SIZE = 10

export default function BaseDataGrid<T extends GridValidRowModel>({
  rows,
  columns,
  loading,
  totalCount,
  getRowId,
  onRowDoubleClick,
  getRowClassName,
  error,
  onRetry,
  sx,
  wrapperSx,
  height = 300,
  autoHeight = true,
  checkboxSelection,
  keepNonExistentRowsSelected,
  disableRowSelectionOnClick = true,
  dataGridProps,
}: BaseDataGridProps<T>) {
  const effectiveGetRowId = useMemo(
    () =>
      getRowId ??
      ((row: T) => {
        const id = (row as { id?: string | number }).id

        if (id === undefined || id === null) {
          throw new Error('BaseDataGrid: row.id is missing. Pass getRowId prop.')
        }

        return id
      }),
    [getRowId],
  )

  const pageSize =
    dataGridProps?.paginationModel?.pageSize ??
    dataGridProps?.initialState?.pagination?.paginationModel?.pageSize ??
    DEFAULT_PAGE_SIZE

  const skeletonRows = useMemo(() => Array.from({ length: pageSize }, (_, i) => i), [pageSize])

  const LoadingOverlay = useCallback(
    () => (
      <GridOverlay>
        <Box sx={{ width: '100%', px: 2, py: 1 }}>
          <Stack spacing={1}>
            {skeletonRows.map(i => (
              <Skeleton key={i} height={32} animation="wave" />
            ))}
          </Stack>
        </Box>
      </GridOverlay>
    ),
    [skeletonRows],
  )

  const EmptyOverlay = useCallback(
    () => (
      <GridOverlay>
        <Stack sx={{ spacing: 1.5, alignItems: 'center' }}>
          <i className="ri-inbox-2-line" style={{ fontSize: 36, opacity: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            لا توجد بيانات لعرضها
          </Typography>
        </Stack>
      </GridOverlay>
    ),
    [],
  )

  return (
    <Box sx={wrapperSx}>
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            onRetry ? (
              <Button size="small" color="inherit" onClick={onRetry}>
                إعادة المحاولة
              </Button>
            ) : undefined
          }
        >
          {error}
        </Alert>
      )}

      <Box sx={{ height: autoHeight ? 'auto' : height, width: '100%' }}>
        <DataGrid<T>
          rows={rows}
          columns={columns}
          loading={loading}
          rowCount={totalCount}
          getRowId={effectiveGetRowId}
          checkboxSelection={checkboxSelection}
          keepNonExistentRowsSelected={keepNonExistentRowsSelected}
          disableRowSelectionOnClick={disableRowSelectionOnClick}
          onRowDoubleClick={(params: GridRowParams<T>, event) =>
            onRowDoubleClick?.(params.row, event?.target ?? null)
          }
          getRowClassName={getRowClassName}
          slots={{
            loadingOverlay: LoadingOverlay,
            noRowsOverlay: EmptyOverlay,
            noResultsOverlay: EmptyOverlay,
          }}
          autoHeight={autoHeight}
          initialState={{
            pagination: {
              paginationModel: {
                page: 0,
                pageSize: DEFAULT_PAGE_SIZE,
              },
            },
            ...dataGridProps?.initialState,
          }}
          pageSizeOptions={dataGridProps?.pageSizeOptions ?? [10, 25, 50]}
          sx={{
            minHeight: 360,
            ...(sx as object),
          }}
          {...dataGridProps}
        />
      </Box>
    </Box>
  )
}