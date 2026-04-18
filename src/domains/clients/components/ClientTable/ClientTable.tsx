'use client'

import type { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid'

import GenericDataGrid from '@/components/datagrid/GenericDataGrid'

import type { ClientDto, ClientQueryParams } from '@/types/api/clients'

type Props = {
  rows: ClientDto[]
  columns: GridColDef<ClientDto>[]
  loading: boolean
  totalCount: number
  query: ClientQueryParams
  setQuery: (query: Partial<ClientQueryParams>) => void
  error: string | null
  onRetry: () => void
  onRowDoubleClick: (client: ClientDto) => void
  selectionModel: GridRowSelectionModel
  onSelectionModelChange: (model: GridRowSelectionModel) => void
  defaultDescFields?: string[]
}

export default function ClientTable(props: Props) {
  const {
    rows,
    columns,
    loading,
    totalCount,
    query,
    setQuery,
    error,
    onRetry,
    onRowDoubleClick,
    selectionModel,
    onSelectionModelChange,
    defaultDescFields,
  } = props

  return (
    <GenericDataGrid<ClientDto>
      rows={rows}
      columns={columns}
      loading={loading}
      totalCount={totalCount}
      query={query}
      setQuery={setQuery}
      getRowId={row => row.id}
      error={error}
      onRetry={onRetry}
      onRowDoubleClick={onRowDoubleClick}
      selectionModel={selectionModel}
      onSelectionModelChange={onSelectionModelChange}
      defaultDescFields={defaultDescFields}
    />
  )
}
