import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

import type { ChipProps } from '@mui/material/Chip'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import PersonIcon from '@mui/icons-material/Person'
import BadgeIcon from '@mui/icons-material/Badge'
import ContactPhoneIcon from '@mui/icons-material/ContactPhone'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import HistoryIcon from '@mui/icons-material/History'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import GroupIcon from '@mui/icons-material/Group'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircle'
import PercentIcon from '@mui/icons-material/Percent'

import dayjs from 'dayjs'

import { DetailItem, InfoSection, TabPanel } from '@/features/client/components/ui'
import { useClient, useMerchantSubs, useDeleteMerchantSub, useSettleMerchantSub } from '@/features/client/hooks'
import { CashiersSection, type CashierRow } from '@/features/client/components/cashiresSection'

import type { MerchantSubResponse } from '@/features/client/types/responses'
import type { MerchantCommissionDialogValues } from '@/features/client/components/MerchantCommissionDialog'
import MerchantCommissionDialog from '@/features/client/components/MerchantCommissionDialog'

type CommissionRow = MerchantCommissionDialogValues & {
  id: string
  createdAt: string
}

export default function MerchantDetailsPage() {
  const { id } = useParams() as { id?: string }
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [commissionDialogOpen, setCommissionDialogOpen] = useState(false)
  const [commissions, setCommissions] = useState<CommissionRow[]>([])

  const MerchantQuery = useClient(id)
  const merchantSubsQuery = useMerchantSubs(id)
  const deleteMerchantSubMutation = useDeleteMerchantSub()
  const settleMerchantSubMutation = useSettleMerchantSub()
  const details = MerchantQuery.data

  const cashiers = useMemo<CashierRow[]>(() => {
    const detailsCashiers = Array.isArray((details as { cashiers?: CashierRow[] } | undefined)?.cashiers)
      ? (details as { cashiers?: CashierRow[] }).cashiers!
      : []

    const subsCashiers: CashierRow[] = Array.isArray(merchantSubsQuery.data)
      ? merchantSubsQuery.data.map((sub: MerchantSubResponse) => ({
          id: sub.id,
          name: sub.name,
          status: typeof sub.status === 'number' ? sub.status : 0,
          totalAmount: sub.totalAmount,
        }))
      : []

    return [...detailsCashiers, ...subsCashiers]
  }, [details, merchantSubsQuery.data])

  const accountStatusValue = details?.accountStatus

  const accountStatus: {
    label: string
    color: ChipProps['color']
  } = (() => {
    switch (accountStatusValue) {
      case 0:
        return { label: 'غير نشط', color: 'default' }
      case 1:
        return { label: 'نشط', color: 'success' }
      case 2:
        return { label: 'قيد الانتظار', color: 'warning' }
      default:
        return {
          label: accountStatusValue !== undefined ? String(accountStatusValue) : '—',
          color: 'default',
        }
    }
  })()

  const errorMessage =
    MerchantQuery.error instanceof Error ? MerchantQuery.error.message : 'خطأ في جلب البيانات'

  if (!id) return <Alert severity="error">المعرف غير موجود</Alert>

  if (MerchantQuery.isLoading)
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

  if (MerchantQuery.isError) return <Alert severity="error">{errorMessage}</Alert>

  if (!details) return <Alert severity="info">لا توجد بيانات لهذا التاجر</Alert>

  const createdAt = details.createdAt ? dayjs(details.createdAt).format('YYYY/MM/DD HH:mm') : '—'
  const clientName = details.fullName ?? 'بدون اسم'

  const openCommissionDialog = () => setCommissionDialogOpen(true)

  const handleSubmitCommission = async (values: MerchantCommissionDialogValues) => {
    const nextCommission: CommissionRow = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      clientName: values.clientName,
      commission: values.commission,
      description: values.description.trim(),
      createdAt: dayjs().format('YYYY/MM/DD HH:mm'),
    }

    setCommissions((previous) => [nextCommission, ...previous])
    setCommissionDialogOpen(false)

    // عند توفر API للعمولات استبدل الحفظ المؤقت أعلاه بالـ mutation المناسب، مثل:
    // await createMerchantCommissionMutation.mutateAsync({
    //   merchantId: details.id,
    //   commission: Number(values.commission),
    //   description: values.description.trim(),
    // })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
              <PersonIcon fontSize="large" />
            </Avatar>

            <Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 1,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {clientName}
                </Typography>

                <Chip size="small" label={accountStatus.label} color={accountStatus.color} />
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                تاريخ الإنشاء: {createdAt}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1,
              justifyContent: 'flex-end',
              alignItems: { xs: 'stretch', sm: 'center' },
            }}
          >
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
                boxShadow: '0 8px 18px rgba(25, 118, 210, 0.22)',
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
          </Box>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, value: number) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Tab icon={<BadgeIcon />} iconPosition="start" label="البيانات الأساسية" />
          <Tab icon={<ContactPhoneIcon />} iconPosition="start" label="التواصل" />
          <Tab icon={<AccountBalanceIcon />} iconPosition="start" label="الحساب والمنظمة" />
          <Tab icon={<GroupIcon />} iconPosition="start" label="الكاشيرات" />
          <Tab icon={<PercentIcon />} iconPosition="start" label="العمولات" />
          <Tab icon={<ReceiptLongIcon />} iconPosition="start" label="المعاملات" />
          <Tab icon={<HistoryIcon />} iconPosition="start" label="السجل" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          <TabPanel value={activeTab} index={0}>
            <InfoSection title="البيانات الأساسية" description="معلومات التعريف الرئيسية الخاصة بالتاجر.">
              <DetailItem label="الاسم الكامل" value={details.fullName} />
              <DetailItem label="المعرف" value={details.id} />
              <DetailItem label="الهوية الوطنية" value={details.nationalId} />
              <DetailItem label="نوع الهوية" value={details.nationalIdTypeName} />
            </InfoSection>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <InfoSection title="بيانات التواصل" description="بيانات الاتصال والعنوان المسجلة للتاجر.">
              <DetailItem label="رقم الهاتف" value={details.phoneNumber} />
              <DetailItem label="المدينة" value={details.city} />
              <DetailItem label="العنوان" value={details.address} />
            </InfoSection>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <InfoSection
              title="الحساب والمنظمة"
              description="حالة الحساب والبيانات المرتبطة بالمنظمة والبطاقة."
            >
              <DetailItem
                label="حالة الحساب"
                value={<Chip size="small" label={accountStatus.label} color={accountStatus.color} />}
              />
              <DetailItem label="الجهة" value={details.organizationName} />
              <DetailItem label="استلم البطاقة" value={details.isReceivedCard ? 'نعم' : 'لا'} />
            </InfoSection>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <CashiersSection
              cashiers={cashiers}
              onAdd={() => navigate('cashiers/new')}
              onView={(cashier) => navigate(`cashiers/${cashier.id}`)}
              onEdit={(cashier) => navigate(`cashiers/${cashier.id}/edit`)}
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
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1.5,
                    alignItems: { xs: 'stretch', sm: 'center' },
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      العمولات
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      يمكنك إضافة عمولة جديدة لهذا التاجر أو عرض العمولات المسجلة عند توفرها.
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
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
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
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: 'space-between',
                            gap: 1,
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            {commission.clientName}
                          </Typography>

                          <Chip
                            size="small"
                            color="primary"
                            label={`الكوميشن: ${commission.commission}`}
                            sx={{ fontWeight: 700 }}
                          />
                        </Box>

                        {commission.description ? (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {commission.description}
                          </Typography>
                        ) : null}

                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
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
                    <Typography variant="body2" color="text.secondary">
                      لا توجد عمولات متاحة حاليًا لهذا التاجر.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={activeTab} index={5}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  المعاملات
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  لا توجد معاملات متاحة حاليًا لهذا التاجر.
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={activeTab} index={6}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  السجل
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
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
        onClose={() => setCommissionDialogOpen(false)}
        onSubmit={handleSubmitCommission}
      />
    </Box>
  )
}
