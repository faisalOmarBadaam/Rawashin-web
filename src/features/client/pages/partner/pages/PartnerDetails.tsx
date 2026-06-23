import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import dayjs from 'dayjs'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { GridColDef } from '@mui/x-data-grid'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BadgeIcon from '@mui/icons-material/Badge'
import EditIcon from '@mui/icons-material/Edit'
import GroupIcon from '@mui/icons-material/Group'
import HistoryIcon from '@mui/icons-material/History'
import PersonIcon from '@mui/icons-material/Person'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import SearchIcon from '@mui/icons-material/Search'

import GenericDataGrid, {
  type DataGridQueryState,
} from '@/shared/components/dataGrid/GenericDataGrid'
import { ClientType } from '@/shared/types/ClientType'

import ClientCreditAccountSummary from '@/features/client/components/ClientCreditAccountSummary'
import ClientTransactionsTable from '@/features/client/components/ClientTransactionsTable'
import {
  DetailItem,
  InfoSection,
  TabPanel,
} from '@/features/client/components/ui'
import { useClient, useClients } from '@/features/client/hooks'
import PageDetailsHeader from '@/features/client/components/PageDetailsHeader'
import type { ClientListResponse } from '@/features/client/types/responses'
import { getAccountStatusInfo } from '@/features/client/utils/account-status'

export default function PartnerDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState(0)
  const [beneficiariesQuery, setBeneficiariesQuery] = useState<DataGridQueryState>({
    PageNumber: 1,
    PageSize: 10,
    SortBy: 'createdAt',
    SortDir: 'desc',
    Search: '',
  })

  const partnerQuery = useClient(id)
  const details = partnerQuery.data

  const beneficiariesParams = useMemo(
    () => ({
      PageNumber: beneficiariesQuery.PageNumber,
      PageSize: beneficiariesQuery.PageSize,
      SortBy: beneficiariesQuery.SortBy,
      IsDesc: beneficiariesQuery.SortDir === 'desc',
      Search: String(beneficiariesQuery.Search ?? ''),
      ClientType: ClientType.Client,
      ParentClientId: id,
    }),
    [beneficiariesQuery, id]
  )

  const partnerBeneficiariesQuery = useClients(beneficiariesParams)
  const beneficiaryRows = partnerBeneficiariesQuery.data?.items ?? []
  const beneficiariesTotalCount = partnerBeneficiariesQuery.data?.totalCount ?? 0

  const beneficiariesColumns = useMemo<GridColDef<ClientListResponse>[]>(
    () => [
      {
        field: 'fullName',
        headerName: 'الاسم',
        flex: 1.2,
        minWidth: 220,
      },
      {
        field: 'phoneNumber',
        headerName: 'رقم الجوال',
        flex: 0.8,
        minWidth: 150,
      },
      {
        field: 'accountStatus',
        headerName: 'حالة الحساب',
        flex: 0.7,
        minWidth: 140,
        sortable: false,
        renderCell: (params) => {
          const status = getAccountStatusInfo(params.row.accountStatus)

          return (
            <Chip
              size="small"
              label={status.label}
              color={status.color}
            />
          )
        },
      },
      {
        field: 'isReceivedCard',
        headerName: 'البطاقة',
        flex: 0.6,
        minWidth: 110,
        sortable: false,
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.row.isReceivedCard ? 'مستلمة' : 'غير مستلمة'}
            color={params.row.isReceivedCard ? 'success' : 'default'}
            variant={params.row.isReceivedCard ? 'filled' : 'outlined'}
          />
        ),
      },
    ],
    []
  )

  const accountStatus = getAccountStatusInfo(details?.accountStatus)

  const handleBeneficiariesSearchChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const search = event.target.value

    setBeneficiariesQuery((prev) => ({
      ...prev,
      Search: search,
      PageNumber: 1,
    }))
  }

  const errorMessage =
    partnerQuery.error instanceof Error
      ? partnerQuery.error.message
      : 'خطأ في جلب البيانات'

  if (!id) {
    return <Alert severity="error">المعرف غير موجود</Alert>
  }

  if (partnerQuery.isLoading) {
    return (
      <Box
        sx={{
          minHeight: 320,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (partnerQuery.isError) {
    return <Alert severity="error">{errorMessage}</Alert>
  }

  if (!details) {
    return <Alert severity="info">لا توجد بيانات لهذا الشريك</Alert>
  }

  const createdAt = details.createdAt
    ? dayjs(details.createdAt).format('YYYY/MM/DD HH:mm')
    : '—'

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <PageDetailsHeader
        title={details.fullName ?? 'بدون اسم'}
        subtitle={`تاريخ الإنشاء: ${createdAt}`}
        avatar={<PersonIcon fontSize="large" />}
        status={
          <Chip
            size="small"
            label={accountStatus.label}
            color={accountStatus.color}
          />
        }
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate('edit')}
            >
              تعديل
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
            >
              العودة
            </Button>
          </>
        }
      />

      <ClientCreditAccountSummary clientId={details.id} />

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, value: number) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            px: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Tab
            icon={<BadgeIcon />}
            iconPosition="start"
            label="البيانات الأساسية"
          />

          <Tab
            icon={<GroupIcon />}
            iconPosition="start"
            label="التابعين"
          />

          <Tab
            icon={<ReceiptLongIcon />}
            iconPosition="start"
            label="المعاملات"
          />

          <Tab
            icon={<HistoryIcon />}
            iconPosition="start"
            label="السجل"
          />
        </Tabs>

        <Box sx={{ p: 2 }}>
          <TabPanel value={activeTab} index={0}>
            <InfoSection
              title="البيانات الأساسية"
              description="معلومات التعريف الرئيسية الخاصة بالشريك."
            >
              <DetailItem
                label="الاسم الكامل"
                value={details.fullName}
              />


              <DetailItem
                label="الهوية الوطنية"
                value={details.nationalId}
              />

              <DetailItem
                label="نوع الهوية"
                value={details.nationalIdTypeName}
              />
              <DetailItem
                label="رقم الهاتف"
                value={details.phoneNumber}
              />

              <DetailItem
                label="المدينة"
                value={details.city}
              />

              <DetailItem
                label="العنوان"
                value={details.address}
              />
              <DetailItem
                label="الجهة"
                value={details.organizationName}
              />
            </InfoSection>
          </TabPanel>
          
          <TabPanel value={activeTab} index={1}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    mb: 2,
                    alignItems: { xs: 'stretch', md: 'center' },
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 800,
                      }}
                    >
                      المستفيدون التابعون
                    </Typography>

                  </Box>

                  <TextField
                    value={String(beneficiariesQuery.Search ?? '')}
                    onChange={handleBeneficiariesSearchChange}
                    size="small"
                    placeholder="ابحث بالاسم أو رقم الجوال"
                    sx={{ minWidth: { xs: '100%', md: 320 } }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>

                <GenericDataGrid<ClientListResponse>
                  rows={beneficiaryRows}
                  columns={beneficiariesColumns}
                  loading={partnerBeneficiariesQuery.isLoading}
                  totalCount={beneficiariesTotalCount}
                  query={beneficiariesQuery}
                  setQuery={setBeneficiariesQuery}
                  getRowId={(row) => row.id}
                  showToolbar={false}
                  checkboxSelection={false}
                  defaultDescFields={['createdAt']}
                  onRowDoubleClick={(row) => navigate(`/beneficiaries/${String(row.id)}`)}
                />
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <ClientTransactionsTable
              clientId={details.id}
              title="معاملات الشريك"
            />
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  السجل
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                  }}
                >
                  لا توجد بيانات سجل متاحة حاليًا لهذا الشريك.
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>
        </Box>  
      </Paper>
    </Box>
  )
  }
