import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircle'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircle'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'

import SettlementTimeline, {
} from '../components/SettlementTimeline'
import CompleteSettlementDialog from '../components/CompleteSettlementDialog'
import {
  getPaymentMethodLabel,
  getSettlementStatusMeta,
  normalizeSettlementStatus,
  SettlementStatus,
} from '../types'
import {
  useSettlement,
  useProcessSettlement,
  useCompleteSettlement,
  useCancelSettlement,
} from '../hooks'
import { DetailItem, InfoSection } from '@/features/client/components/ui'
import type { CompleteSettlementPayload } from '../types'
import { formatSettlementCurrency, formatSettlementDate } from '../utils'

type SummaryCardProps = {
  title: string
  value: string
  icon: ReactNode
  tone?: 'primary' | 'success' | 'warning'
}

function SummaryCard({
  title,
  value,
  icon,
  tone = 'primary',
}: SummaryCardProps) {
  const paletteMap = {
    primary: {
      bg: 'rgba(25, 118, 210, 0.08)',
      color: 'primary.main',
    },
    success: {
      bg: 'rgba(46, 125, 50, 0.08)',
      color: 'success.main',
    },
    warning: {
      bg: 'rgba(237, 108, 2, 0.08)',
      color: 'warning.main',
    },
  } as const

  const palette = paletteMap[tone]

  return (
    <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3, height: '100%' }}>
      <Stack spacing={1.5}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: palette.bg,
            color: palette.color,
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  )
}

export default function SettlementDetailsPage() {
  const { id } = useParams() as { id?: string }
  const navigate = useNavigate()
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)

  const settlementQuery = useSettlement(id)
  const processSettlementMutation = useProcessSettlement()
  const completeSettlementMutation = useCompleteSettlement()
  const cancelSettlementMutation = useCancelSettlement()

  const settlement = settlementQuery.data

  const statusMeta = useMemo(
    () => getSettlementStatusMeta(settlement?.status ?? 0),
    [settlement?.status]
  )

  const normalizedStatus = useMemo(
    () => normalizeSettlementStatus(settlement?.status),
    [settlement?.status]
  )

  const isNew = normalizedStatus === SettlementStatus.New
  const isInProcess = normalizedStatus === SettlementStatus.InProcess

  const isActionLoading =
    processSettlementMutation.isPending ||
    completeSettlementMutation.isPending ||
    cancelSettlementMutation.isPending

  const handleStartProcessing = async () => {
    if (!settlement?.id) return

    await processSettlementMutation.mutateAsync(settlement.id)
  }

  const handleCompleteSettlement = async () => {
    setCompleteDialogOpen(true)
  }

  const handleCompleteSettlementSubmit = async (
    payload: CompleteSettlementPayload,
  ) => {
    if (!settlement?.id) return

    await completeSettlementMutation.mutateAsync({
      settlementId: settlement.id,
      payload,
    })

    setCompleteDialogOpen(false)
  }

  const handleCancelSettlement = async () => {
    if (!settlement?.id) return

    await cancelSettlementMutation.mutateAsync(settlement.id)
  }

  if (!id) return <Alert severity="error">المعرف غير موجود</Alert>

  if (settlementQuery.isLoading) {
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

  if (settlementQuery.isError) {
    return (
      <Alert severity="error">
        {settlementQuery.error instanceof Error
          ? settlementQuery.error.message
          : 'تعذر تحميل تفاصيل التسوية'}
      </Alert>
    )
  }

  if (!settlement) {
    return <Alert severity="info">لا توجد بيانات لهذه التسوية</Alert>
  }

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          background:
            'linear-gradient(135deg, rgba(25,118,210,0.08) 0%, rgba(255,255,255,1) 48%, rgba(46,125,50,0.05) 100%)',
        }}
      >
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  mb: 1,
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 900 }}>
                  {settlement.clientName}
                </Typography>

                <Chip
                  size="small"
                  label={statusMeta.label}
                  color={statusMeta.color}
                />
              </Stack>

              <Typography variant="body1" color="text.secondary">
                {settlement.description || 'لا يوجد وصف مضاف لهذه التسوية.'}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 1 }}
              >
                رقم المرجع: {settlement.paymentReference || '—'}
              </Typography>
            </Box>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{
                width: { xs: '100%', md: 'auto' },
                justifyContent: 'flex-end',
              }}
            >
              {isNew ? (
                <>
                  <Button
                    variant="contained"
                    color="info"
                    startIcon={<PlayCircleOutlineIcon />}
                    onClick={handleStartProcessing}
                    disabled={isActionLoading}
                    sx={{
                      whiteSpace: 'nowrap',
                      fontWeight: 700,
                      borderRadius: 2,
                    }}
                  >
                    {processSettlementMutation.isPending
                      ? 'جاري بدء المعالجة...'
                      : 'بدء المعالجة'}
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelOutlinedIcon />}
                    onClick={handleCancelSettlement}
                    disabled={isActionLoading}
                    sx={{
                      whiteSpace: 'nowrap',
                      fontWeight: 700,
                      borderRadius: 2,
                    }}
                  >
                    {cancelSettlementMutation.isPending
                      ? 'جاري الإغلاق...'
                      : 'إغلاق بدون إتمام'}
                  </Button>
                </>
              ) : null}

              {isInProcess ? (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={handleCompleteSettlement}
                  disabled={isActionLoading}
                  sx={{
                    whiteSpace: 'nowrap',
                    fontWeight: 700,
                    borderRadius: 2,
                  }}
                >
                  {completeSettlementMutation.isPending
                    ? 'جاري الإتمام...'
                    : 'إتمام التسوية'}
                </Button>
              ) : null}

              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                disabled={isActionLoading}
                sx={{
                  whiteSpace: 'nowrap',
                  fontWeight: 700,
                  borderRadius: 2,
                }}
              >
                العودة
              </Button>
            </Stack>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <SummaryCard
                title="إجمالي مبلغ التسوية"
                value={formatSettlementCurrency(settlement.grossAmount)}
                icon={<AccountBalanceWalletOutlinedIcon />}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <SummaryCard
                title="صافي المبلغ"
                value={formatSettlementCurrency(settlement.netAmount)}
                icon={<ReceiptLongOutlinedIcon />}
                tone="success"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <SummaryCard
                title="قيمة العمولة"
                value={formatSettlementCurrency(settlement.commissionAmount)}
                icon={<PercentOutlinedIcon />}
                tone="warning"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <SummaryCard
                title="تاريخ التسوية"
                value={formatSettlementDate(settlement.settlementDate)}
                icon={<CalendarMonthOutlinedIcon />}
              />
            </Grid>
          </Grid>
        </Stack>
      </Paper>

      <SettlementTimeline settlement={settlement} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <InfoSection
              title="معلومات الطلب"
              description="البيانات الأساسية والمرجعية الخاصة بطلب التسوية."
            >
              <DetailItem label="معرف التسوية" value={settlement.id} />
              <DetailItem label="معرف التاجر" value={settlement.clientId} />
              <DetailItem label="اسم التاجر" value={settlement.clientName} />
              <DetailItem
                label="طريقة التسوية"
                value={getPaymentMethodLabel(settlement.method)}
              />
              <DetailItem
                label="المرجع المالي"
                value={settlement.paymentReference || '—'}
              />
              <DetailItem label="الوصف" value={settlement.description || '—'} />
            </InfoSection>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <InfoSection
              title="المبالغ والتواريخ"
              description="تفصيل القيم الزمنية والمالية المرتبطة بدورة الطلب."
            >
              <DetailItem
                label="إجمالي المبلغ"
                value={formatSettlementCurrency(settlement.grossAmount)}
              />
              <DetailItem
                label="نسبة العمولة"
                value={`${settlement.commissionPercentage}%`}
              />
              <DetailItem
                label="قيمة العمولة"
                value={formatSettlementCurrency(settlement.commissionAmount)}
              />
              <DetailItem
                label="صافي المبلغ"
                value={formatSettlementCurrency(settlement.netAmount)}
              />
              <DetailItem label="وقت الطلب" value={formatSettlementDate(settlement.requestedAt)} />
              <DetailItem
                label="وقت بدء المعالجة"
                value={formatSettlementDate(settlement.processingStartedAt)}
              />
              <DetailItem label="وقت الإكمال" value={formatSettlementDate(settlement.completedAt)} />
              <DetailItem label="ملاحظة إدارية" value={settlement.adminNote || '—'} />
            </InfoSection>
          </Paper>
        </Grid>
      </Grid>

      <CompleteSettlementDialog
        open={completeDialogOpen}
        loading={completeSettlementMutation.isPending}
        errorMessage={
          completeSettlementMutation.error instanceof Error
            ? completeSettlementMutation.error.message
            : undefined
        }
        onClose={() => setCompleteDialogOpen(false)}
        onSubmit={handleCompleteSettlementSubmit}
      />
    </Stack>
  )
}