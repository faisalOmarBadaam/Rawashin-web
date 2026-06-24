import {useMemo, useState } from 'react'
import type { GridRowSelectionModel } from '@mui/x-data-grid'
import { useSearchParams, useNavigate } from 'react-router'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'

import GenericDataGrid, {
  type DataGridQueryState,
} from '@/shared/components/dataGrid/GenericDataGrid'
import QueryFiltersBar from '@/shared/components/filters/QueryFiltersBar'
import QuerySelectFilter from '@/shared/components/filters/QuerySelectFilter'

import { ClientType } from '@/shared/types/ClientType'
import { useAssignClientCard, useClients } from '../../hooks'
import type { ClientListResponse } from '../../types/responses'
import { accountStatusOptions } from '../../constants'
import AssignCardDialog from '../../components/AssignCardDialog'
import { toast } from 'sonner'
import { useBeneficiaryColumns } from '../../columns/beneficiaryColumns'

type SelectedBeneficiary = {
  id: string
  name: string
}




export default function BeneficiaryPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const urlSearch = searchParams.get('search') ?? ''
  const accountStatusParam = searchParams.get('AccountStatus') ?? ''
  const isReceivedCardParam = searchParams.get('IsReceivedCard') ?? ''

  const [query, setQuery] = useState<DataGridQueryState>({
    PageNumber: 1,
    PageSize: 10,
    SortBy: 'createdAt',
    SortDir: 'desc',
    Search: urlSearch,
  })

  const [selectionModel, setSelectionModel] =
    useState<GridRowSelectionModel | undefined>(undefined)

  const [assignCardOpen, setAssignCardOpen] = useState(false)
  const [selectedBeneficiary, setSelectedBeneficiary] =
    useState<SelectedBeneficiary | null>(null)

  const accountStatusValue = useMemo(() => {
    if (!accountStatusParam) return undefined

    const parsed = Number(accountStatusParam)

    return Number.isNaN(parsed) ? undefined : parsed
  }, [accountStatusParam])

  const isReceivedCardValue = useMemo(() => {
    if (isReceivedCardParam === '') return undefined

    const value = String(isReceivedCardParam).toLowerCase()

    if (value === '1' || value === 'true') return true
    if (value === '0' || value === 'false') return false

    return undefined
  }, [isReceivedCardParam])

  const apiParams = useMemo(
    () => ({
      PageNumber: query.PageNumber,
      PageSize: query.PageSize,
      SortBy: query.SortBy,
      IsDesc: query.SortDir === 'desc',
      Search: urlSearch || query.Search,
      ClientType: ClientType.Client,
      AccountStatus: accountStatusValue,
      IsReceivedCard: isReceivedCardValue,
    }),
    [query, urlSearch, accountStatusValue, isReceivedCardValue]
  )

  const beneficiaries = useClients(apiParams)
  const {mutateAsync : assignCardAsync , isPending : loodingAssignCard} = useAssignClientCard()
  const rows = beneficiaries.data?.items ?? []
  const totalCount = beneficiaries.data?.totalCount ?? 0

  const cardStatusOptions = useMemo(
    () => [
      { label: 'استلم', value: 1 },
      { label: 'لم يتسلم', value: 0 },
    ],
    []
  )


  const columns = useBeneficiaryColumns({
    editPath: (row) => `${String(row.id)}/edit`,

    extraActions: [
      {
        label: 'إسناد البطاقة',
        onClick: (row)=>{
          setSelectedBeneficiary({id:row.id,name:row.fullName as string})
          setAssignCardOpen(true)
        },
        icon: <CardGiftcardIcon fontSize="small" />,
      },
    ],
  })

  return (
    <>
      <QueryFiltersBar resetKeys={['AccountStatus', 'IsReceivedCard']}>
        <QuerySelectFilter
          queryKey="AccountStatus"
          label="حالة الحساب"
          options={accountStatusOptions}
        />

        <QuerySelectFilter
          queryKey="IsReceivedCard"
          label="حالة البطاقة"
          options={cardStatusOptions}
        />
      </QueryFiltersBar>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" onClick={() => navigate('new')}>
          إضافة مستفيد
        </Button>
      </Box>

      <GenericDataGrid<ClientListResponse>
        rows={rows}
        showToolbar={false}
        columns={columns}
        loading={beneficiaries.isLoading}
        totalCount={totalCount}
        query={query}
        setQuery={setQuery}
        getRowId={(row) => row.id}
        checkboxSelection
        selectionModel={selectionModel}
        onSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
        onRowDoubleClick={(row) => navigate(String(row.id))}
        defaultDescFields={['createdAt']}
      />

      <AssignCardDialog
        open={assignCardOpen}
        clientName={selectedBeneficiary?.name ?? ''}
        loading={loodingAssignCard}
        onClose={()=>{
          setSelectedBeneficiary(null)
          setAssignCardOpen(false)
        }}
        onSave={async(values)=>{
         await assignCardAsync({id:selectedBeneficiary?.id as string,customCardNumber:values.cardNumber})
         toast.success("تم اسناد البطاقة بنجاح")
         setSelectedBeneficiary(null)
          setAssignCardOpen(false)
        }}
      />
    </>
  )
}