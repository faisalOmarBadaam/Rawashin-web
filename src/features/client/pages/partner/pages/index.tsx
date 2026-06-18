import { useMemo, useState } from 'react'
import type { GridRowSelectionModel } from '@mui/x-data-grid'
import { useSearchParams, useNavigate } from 'react-router'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

import GenericDataGrid, {
  type DataGridQueryState,
} from '@/shared/components/ui/dataGrid/GenericDataGrid'
import QueryFiltersBar from '@/shared/components/ui/filters/QueryFiltersBar'
import QuerySelectFilter from '@/shared/components/ui/filters/QuerySelectFilter'

import { ClientType } from '@/shared/types/ClientType'
import type { ClientListResponse } from '@/features/client/types/responses'
import { useClients } from '@/features/client/hooks'
import usePartnerColumns from '@/features/client/components/PartnerColumns'
import { accountStatusOptions } from '@/features/client/constants'

export default function PartnerPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const urlSearch = searchParams.get('search') ?? ''
  const accountStatusParam = searchParams.get('AccountStatus') ?? ''

  const [query, setQuery] = useState<DataGridQueryState>({
    PageNumber: 1,
    PageSize: 10,
    SortBy: 'createdAt',
    SortDir: 'desc',
    Search: urlSearch,
  })

  const [selectionModel, setSelectionModel] =
    useState<GridRowSelectionModel | undefined>(undefined)

  const accountStatusValue = useMemo(() => {
    if (!accountStatusParam) return undefined

    const parsed = Number(accountStatusParam)

    return Number.isNaN(parsed) ? undefined : parsed
  }, [accountStatusParam])

  const apiParams = useMemo(
    () => ({
      PageNumber: query.PageNumber,
      PageSize: query.PageSize,
      SortBy: query.SortBy,
      IsDesc: query.SortDir === 'desc',
      Search: urlSearch || query.Search,
      ClientType: ClientType.Partner,
      ParentsOnly: true,
      AccountStatus: accountStatusValue,
    }),
    [query, urlSearch, accountStatusValue]
  )

  const partners = useClients(apiParams)

  const rows = partners.data?.items ?? []
  const totalCount = partners.data?.totalCount ?? 0


  const columns = usePartnerColumns({
    editPath: (row) => String(row.id),

    // تقدر تضيف خيارات إضافية هنا إذا احتجت
    extraActions: [
      {
        label: 'عرض المستفيدين',
        onClick: (row) => {
          navigate(`${row.id}/beneficiaries`)
        },
      },
    ],
  })

  return (
    <>
      <QueryFiltersBar resetKeys={['AccountStatus']}>
        <QuerySelectFilter
          queryKey="AccountStatus"
          label="حالة الحساب"
          options={accountStatusOptions}
        />
      </QueryFiltersBar>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" onClick={() => navigate('new')}>
          إضافة شريك
        </Button>
      </Box>

      <GenericDataGrid<ClientListResponse>
        rows={rows}
        showToolbar={false}
        columns={columns}
        loading={partners.isLoading}
        totalCount={totalCount}
        query={query}
        setQuery={setQuery}
        getRowId={(row) => row.id}
        checkboxSelection
        selectionModel={selectionModel}
        onSelectionModelChange={setSelectionModel}
        onRowDoubleClick={(row) => navigate(String(row.id))}
        defaultDescFields={['createdAt']}
      />
    </>
  )
}