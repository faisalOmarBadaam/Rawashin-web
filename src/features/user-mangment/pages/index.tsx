import { useCallback, useMemo, useState } from 'react'
import type { GridColDef } from '@mui/x-data-grid'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useNavigate, useSearchParams } from 'react-router'

import GenericDataGrid, {
  type DataGridQueryState,
} from '@/shared/components/dataGrid/GenericDataGrid'
import QueryFiltersBar from '@/shared/components/filters/QueryFiltersBar'
import QuerySelectFilter from '@/shared/components/filters/QuerySelectFilter'
import { ClientType } from '@/shared/types/ClientType'
import { formatDate } from '@/shared/utils'

import {
  createClientAccountStatusColumn,
  createClientActionsColumn,
} from '@/features/client/columns/commonColumns'
import { useClients } from '@/features/client/hooks'
import type { ClientListResponse } from '@/features/client/types/responses'

type UserManagementRow = ClientListResponse & {
  clientType: number
  clientTypeName?: string | null
}

const userAccountTypeOptions = [
  {
    label: 'مدير النظام',
    value: ClientType.Admin,
  },
  {
    label: 'حسابات الأرباح',
    value: ClientType.ProfitAccount,
  },
  {
    label: 'حسابات الشحن',
    value: ClientType.Charger,
  },
  {
    label: 'حسابات الادخالات',
    value: ClientType.Employee,
  },
] as const

export default function UsersManagementPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlSearch = searchParams.get('search') ?? ''
  const clientTypeParam = searchParams.get('ClientType') ?? ''
  const querySuffix = searchParams.toString()

  const [query, setQuery] = useState<DataGridQueryState>({
    PageNumber: 1,
    PageSize: 10,
    SortBy: 'createdAt',
    SortDir: 'desc',
    Search: urlSearch,
  })

  const clientTypeValue = useMemo(() => {
    if (!clientTypeParam) return undefined

    const parsed = Number(clientTypeParam)

    return Number.isNaN(parsed) ? undefined : parsed
  }, [clientTypeParam])


  const buildUsersPath = useCallback((path: string, clientType: number | undefined) => {
    const nextParams = new URLSearchParams(querySuffix)
    nextParams.set('ClientType', String(clientType))

    const serialized = nextParams.toString()

    return serialized ? `${path}?${serialized}` : path
  }, [querySuffix])

  const apiParams = useMemo(
    () => ({
      PageNumber: query.PageNumber,
      PageSize: query.PageSize,
      SortBy: query.SortBy,
      IsDesc: query.SortDir === 'desc',
      Search: urlSearch || query.Search,
      ClientType: clientTypeValue,
    }),
    [query, urlSearch, clientTypeValue],
  )





  const usersQuery = useClients(apiParams)
  const rows = (usersQuery.data?.items ?? []) as UserManagementRow[]
  const totalCount = usersQuery.data?.totalCount ?? 0

  const columns = useMemo<GridColDef<UserManagementRow>[]>(
    () => [
      {
        field: 'fullName',
        headerName: 'الاسم',
          flex: 1,
        minWidth: 220,
        valueGetter: (_value, row) => row.fullName ?? '—',
      },
      {
        field: 'phoneNumber',
        headerName: 'رقم الجوال',
        minWidth: 150,
        valueGetter: (_value, row) => row.phoneNumber ?? '—',
      },
      createClientAccountStatusColumn<UserManagementRow>(),
      {
        field: 'createdAt',
        headerName: 'تاريخ الإضافة',
        minWidth: 150,
        valueGetter: (_value, row) => formatDate(row.createdAt),
      },
      createClientActionsColumn<UserManagementRow>({
        editPath: (row) => {
          return buildUsersPath(`${String(row.id)}/edit`, row.clientType)
        },
      }),
    ],
    [buildUsersPath],
  )

  return (
    <>
      <QueryFiltersBar resetKeys={['ClientType']}>
        <QuerySelectFilter
          queryKey="ClientType"
          label="نوع الحساب"
          options={userAccountTypeOptions}
          defaultValue={ClientType.Admin}
          width={200}
        />
      </QueryFiltersBar>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => navigate(buildUsersPath('new', clientTypeValue))}
        >
          إضافة مستخدم
        </Button>
      </Box>

      <GenericDataGrid<UserManagementRow>
        rows={rows}
        showToolbar={false}
        columns={columns}
        loading={usersQuery.isLoading}
        totalCount={totalCount}
        query={query}
        setQuery={setQuery}
        getRowId={(row) => row.id}
        defaultDescFields={['createdAt']}
        error={
          usersQuery.error instanceof Error
            ? usersQuery.error.message
            : null
        }
        onRowDoubleClick={(row) => {
          const rowClientType =
            typeof row.clientType === 'number'
              ? row.clientType
              : undefined

          navigate(buildUsersPath(`${String(row.id)}/edit`, rowClientType))
        }}
        onRetry={() => {
          void usersQuery.refetch()
        }}
      />
    </>
  )
}