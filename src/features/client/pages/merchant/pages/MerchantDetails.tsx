import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import dayjs from 'dayjs'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'

import type { ChipProps } from '@mui/material/Chip'

import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircle'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BadgeIcon from '@mui/icons-material/Badge'
import ContactPhoneIcon from '@mui/icons-material/ContactPhone'
import EditIcon from '@mui/icons-material/Edit'
import GroupIcon from '@mui/icons-material/Group'
import HistoryIcon from '@mui/icons-material/History'
import PercentIcon from '@mui/icons-material/Percent'
import PersonIcon from '@mui/icons-material/Person'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'


import ClientTransactionsTable from '@/features/client/components/ClientTransactionsTable'
import MerchantCommissionDialog from '@/features/client/components/MerchantCommissionDialog'
import {
  CashiersSection,
  type CashierRow,
} from '@/features/client/components/cashiresSection'
import {
  DetailItem,
  InfoSection,
  TabPanel,
} from '@/features/client/components/ui'
import {
  useClient,
  useDeleteMerchantSub,
  useMerchantSubs,
  useSettleMerchantSub,
} from '@/features/client/hooks'

import type { MerchantCommissionDialogValues } from '@/features/client/components/MerchantCommissionDialog'
import type { MerchantSubResponse } from '@/features/client/types/responses'
import PageDetailsHeader from '@/features/client/components/PageDetailsHeader'

type CommissionRow = MerchantCommissionDialogValues & {
  id: string
  createdAt: string
}

export default function MerchantDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState(0)
  const [commissionDialogOpen, setCommissionDialogOpen] = useState(false)
  const [commissions, setCommissions] = useState<CommissionRow[]>([])

  const merchantQuery = useClient(id)
  const merchantSubsQuery = useMerchantSubs(id)
  const deleteMerchantSubMutation = useDeleteMerchantSub()
  const settleMerchantSubMutation = useSettleMerchantSub()

  const details = merchantQuery.data

  const cashiers = useMemo<CashierRow[]>(() => {
    const detailsCashiers = Array.isArray(
      (details as { cashiers?: CashierRow[] } | undefined)?.cashiers,
    )
      ? (details as { cashiers?: CashierRow[] }).cashiers!
      : []

    const subsCashiers: CashierRow[] = Array.isArray(
      merchantSubsQuery.data,
    )
      ? merchantSubsQuery.data.map((sub: MerchantSubResponse) => ({
          id: sub.id,
          name: sub.name,
          status: typeof sub.status === 'number' ? sub.status : 0,
          totalAmount: sub.totalAmount,
        }))
      : []

    return [...detailsCashiers, ...subsCashiers]
  }, [details, merchantSubsQuery.data])

  const getAccountStatus = (
  status: number | null | undefined,
): {
  label: string
  color: ChipProps['color']
} => {
  switch (status) {
    case 0:
      return {
        label: 'غير نشط',
        color: 'default',
      }

    case 1:
      return {
        label: 'نشط',
        color: 'success',
      }

    case 2:
      return {
        label: 'قيد الانتظار',
        color: 'warning',
      }

    default:
      return {
        label: status != null ? String(status) : '—',
        color: 'default',
      }
  }
}

  const errorMessage =
    merchantQuery.error instanceof Error
      ? merchantQuery.error.message
      : 'خطأ في جلب البيانات'

  const openCommissionDialog = () => {
    setCommissionDialogOpen(true)
  }

  const closeCommissionDialog = () => {
    setCommissionDialogOpen(false)
  }

  const handleSubmitCommission = async (
    values: MerchantCommissionDialogValues,
  ) => {
    const nextCommission: CommissionRow = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      clientName: values.clientName,
      commission: values.commission,
      description: values.description.trim(),
      createdAt: dayjs().format('YYYY/MM/DD HH:mm'),
    }

    setCommissions((previous) => [
      nextCommission,
      ...previous,
    ])

    closeCommissionDialog()

    // عند توفر API للعمولات، استبدل الحفظ المؤقت بالـ mutation:
    //
    // await createMerchantCommissionMutation.mutateAsync({
    //   merchantId: details.id,
    //   commission: Number(values.commission),
    //   description: values.description.trim(),
    // })
  }

  if (!id) {
    return <Alert severity="error">المعرف غير موجود</Alert>
  }

  if (merchantQuery.isLoading) {
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

  if (merchantQuery.isError) {
    return <Alert severity="error">{errorMessage}</Alert>
  }

  if (!details) {
    return <Alert severity="info">لا توجد بيانات لهذا التاجر</Alert>
  }

  const createdAt = details.createdAt
    ? dayjs(details.createdAt).format('YYYY/MM/DD HH:mm')
    : '—'

  const clientName = details.fullName ?? 'بدون اسم'

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
        title={clientName}
        subtitle={`تاريخ الإنشاء: ${createdAt}`}
        avatar={<PersonIcon fontSize="large" />}
        status={
          <Chip
            size="small"
            label={getAccountStatus(details?.accountStatus).label}
            color={getAccountStatus(details?.accountStatus).color}
          />
        }
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              العودة
            </Button>

            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              onClick={openCommissionDialog}
              sx={{
                borderRadius: 2,
                fontWeight: 800,
                px: 2.5,
                whiteSpace: 'nowrap',
                boxShadow:
                  '0 8px 18px rgba(25, 118, 210, 0.22)',
              }}
            >
              إضافة عمولة
            </Button>

            <Button
              variant="contained"
              color="secondary"
              startIcon={<EditIcon />}
              onClick={() => navigate('edit')}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                px: 2.5,
                whiteSpace: 'nowrap',
              }}
            >
              تعديل
            </Button>
          </>
        }
      />

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
            icon={<ContactPhoneIcon />}
            iconPosition="start"
            label="التواصل"
          />

          <Tab
            icon={<AccountBalanceIcon />}
            iconPosition="start"
            label="الحساب والمنظمة"
          />

          <Tab
            icon={<GroupIcon />}
            iconPosition="start"
            label="الكاشيرات"
          />

          <Tab
            icon={<PercentIcon />}
            iconPosition="start"
            label="العمولات"
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
              description="معلومات التعريف الرئيسية الخاصة بالتاجر."
            >
              <DetailItem
                label="الاسم الكامل"
                value={details.fullName}
              />

              <DetailItem
                label="المعرف"
                value={details.id}
              />

              <DetailItem
                label="الهوية الوطنية"
                value={details.nationalId}
              />

              <DetailItem
                label="نوع الهوية"
                value={details.nationalIdTypeName}
              />
            </InfoSection>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <InfoSection
              title="بيانات التواصل"
              description="بيانات الاتصال والعنوان المسجلة للتاجر."
            >
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
            </InfoSection>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <InfoSection
              title="الحساب والمنظمة"
              description="حالة الحساب والبيانات المرتبطة بالمنظمة والبطاقة."
            >
              <DetailItem
                label="حالة الحساب"
                value={
                  <Chip
                    size="small"
                    label={getAccountStatus(details?.accountStatus).label}
                    color={getAccountStatus(details?.accountStatus).color}
                  />
                }
              />

              <DetailItem
                label="الجهة"
                value={details.organizationName}
              />
            </InfoSection>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <CashiersSection
              cashiers={cashiers}
              onAdd={() => navigate('cashiers/new')}
              onView={(cashier) =>
                navigate(`cashiers/${cashier.id}`)
              }
              onEdit={(cashier) =>
                navigate(`cashiers/${cashier.id}/edit`)
              }
              onDelete={async (cashier) => {
                await deleteMerchantSubMutation.mutateAsync({
                  merchantId: details.id,
                  subMerchantId: String(cashier.id),
                })
              }}
              onSettle={async (cashier) => {
                await settleMerchantSubMutation.mutateAsync({
                  merchantId: details.id,
                  subMerchantId: String(cashier.id),
                })
              }}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
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
                    flexDirection: {
                      xs: 'column',
                      sm: 'row',
                    },
                    gap: 1.5,
                    alignItems: {
                      xs: 'stretch',
                      sm: 'center',
                    },
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
                      العمولات
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                      }}
                    >
                      يمكنك إضافة عمولة جديدة لهذا التاجر أو
                      عرض العمولات المسجلة عند توفرها.
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={openCommissionDialog}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 800,
                      px: 2.5,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    إضافة عمولة
                  </Button>
                </Box>

                {commissions.length > 0 ? (
                  <Box
                    sx={{
                      mt: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.25,
                    }}
                  >
                    {commissions.map((commission) => (
                      <Box
                        key={commission.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'background.paper',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: {
                              xs: 'column',
                              sm: 'row',
                            },
                            justifyContent: 'space-between',
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 800,
                            }}
                          >
                            {commission.clientName}
                          </Typography>

                          <Chip
                            size="small"
                            color="primary"
                            label={`الكوميشن: ${commission.commission}`}
                            sx={{
                              fontWeight: 700,
                            }}
                          />
                        </Box>

                        {commission.description ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 1,
                            }}
                          >
                            {commission.description}
                          </Typography>
                        ) : null}

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            mt: 1,
                          }}
                        >
                          تاريخ الإضافة: {commission.createdAt}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      border: '1px dashed',
                      borderColor: 'divider',
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      لا توجد عمولات متاحة حاليًا لهذا التاجر.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={activeTab} index={5}>
            <ClientTransactionsTable
              clientId={details.id}
              title="معاملات التاجر"
              description="عرض معاملات التاجر مع فلترة حسب نوع العملية والتاريخ."
            />
          </TabPanel>

          <TabPanel value={activeTab} index={6}>
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
                  لا توجد بيانات سجل متاحة حاليًا لهذا التاجر.
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>
        </Box>
      </Paper>

      <MerchantCommissionDialog
        open={commissionDialogOpen}
        clientName={clientName}
        onClose={closeCommissionDialog}
        onSubmit={handleSubmitCommission}
      />
    </Box>
  )
}