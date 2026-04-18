'use client'

import { useEffect, useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import { toast } from 'react-toastify'

import { useSettlementsStore } from '@/contexts/settlements/settlements.store'
import type { SettlementDto } from '@/types/api/settlements'

import SettlementTimeline from '@/components/SettlementTimeline'
import ClientSettlementsPage from './ClientSettlementsPage'
import PrintSettlementDialog from './components/PrintSettlementDialog'
import SettlementStatusChip, { normalizeSettlementStatus } from './components/SettlementStatusChip'

const formatAmount = (amount?: number | null) =>
  amount === null || amount === undefined ? '—' : amount.toLocaleString()

const formatDateTime = (value?: string | null) => (value ? new Date(value).toLocaleString() : '—')

const buildTimeline = (settlement: SettlementDto) => {
  const status = normalizeSettlementStatus(settlement.status)

  return [
    {
      label: 'تم الطلب',
      date: settlement.requestedAt,
      icon: 'ri-send-plane-line',
      active: true,
    },
    {
      label: 'قيد المعالجة',
      date: settlement.processingStartedAt,
      icon: 'ri-loader-4-line',
      active: status === 'InProcess' || status === 'Completed',
    },
    {
      label: 'تم الإكمال',
      date: settlement.completedAt,
      icon: 'ri-checkbox-circle-line',
      active: status === 'Completed',
    },
    {
      label: 'تم الإغلاق بدون إتمام',
      date: settlement.completedAt,
      icon: 'ri-close-circle-line',
      active: status === 'ClosedWithoutCompletion',
    },
  ].filter(item => item.date)
}

type Props = {
  settlementId: string
}

export default function SettlementDetailsView({ settlementId }: Props) {
  const { selectedSettlement, loading, error, fetchSettlementById } = useSettlementsStore()

  const [openPrint, setOpenPrint] = useState(false)
  const [openPrintNotification, setOpenPrintNotification] = useState(false)

  useEffect(() => {
    fetchSettlementById(settlementId)
  }, [fetchSettlementById, settlementId])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const timeline = useMemo(
    () => (selectedSettlement ? buildTimeline(selectedSettlement) : []),
    [selectedSettlement],
  )

  if (loading && !selectedSettlement) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    )
  }

  if (!selectedSettlement) {
    return <Alert severity="error">{error || 'تعذر تحميل بيانات التسوية.'}</Alert>
  }

  const status = normalizeSettlementStatus(selectedSettlement.status)
  const canPrintPaymentOrder = status === 'InProcess' || status === 'Completed'
  const canPrintNotification = status === 'Completed'

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
            <Box>
              <Typography variant="h6" fontWeight={700}>
                تفاصيل التسوية
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {/* رقم التسوية: {selectedSettlement.id} */}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <SettlementStatusChip status={selectedSettlement.status} />

              <Tooltip title={canPrintPaymentOrder ? 'طباعة أمر صرف' : 'متاح بعد بدء المعالجة'}>
                <span>
                  <Button
                    variant="contained"
                    startIcon={<i className="ri-printer-line" />}
                    disabled={!canPrintPaymentOrder}
                    onClick={() => setOpenPrint(true)}
                  >
                    أمر صرف
                  </Button>
                </span>
              </Tooltip>

              {canPrintNotification && (
                <Button
                  variant="outlined"
                  startIcon={<i className="ri-receipt-line" />}
                  onClick={() => setOpenPrintNotification(true)}
                >
                  إشعار صرف
                </Button>
              )}
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            <InfoCard label="اسم نقطة البيع" value={selectedSettlement.clientName} />
            <InfoCard
              label="تاريخ التسوية"
              value={formatDateTime(selectedSettlement.settlementDate)}
            />
            <InfoCard label="تاريخ الطلب" value={formatDateTime(selectedSettlement.requestedAt)} />
          </Box>
        </CardContent>
      </Card>

      {/* Amounts */}
      <Card>
        <CardContent>
          <Typography variant="h6">تفاصيل المبالغ</Typography>
          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            <InfoCard label="إجمالي المبلغ" value={formatAmount(selectedSettlement.grossAmount)} />
            <InfoCard
              label="نسبة العمولة"
              value={`${selectedSettlement.commissionPercentage ?? 0}%`}
            />
            <InfoCard
              label="قيمة العمولة"
              value={formatAmount(selectedSettlement.commissionAmount)}
            />
            <InfoCard
              label="صافي المبلغ"
              value={formatAmount(selectedSettlement.netAmount)}
              highlight
            />
          </Box>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardContent>
          <Typography variant="h6">الخط الزمني</Typography>
          <Divider sx={{ my: 2 }} />

          <SettlementTimeline items={timeline} />
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardContent>
          <Typography variant="h6">العمليات المرتبطة</Typography>
          <Divider sx={{ my: 2 }} />

          {selectedSettlement.transactions?.length ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>التاريخ</TableCell>
                  <TableCell>الوصف</TableCell>
                  <TableCell align="right">المبلغ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedSettlement.transactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>{formatDateTime(tx.createdAt)}</TableCell>
                    <TableCell>{tx.description || '—'}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatAmount(tx.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Alert severity="info">لا توجد عمليات مرتبطة بهذه التسوية.</Alert>
          )}
        </CardContent>
      </Card>

      {selectedSettlement && <ClientSettlementsPage clientId={selectedSettlement.clientId} />}

      {canPrintPaymentOrder && (
        <PrintSettlementDialog
          open={openPrint}
          settlement={selectedSettlement}
          printType="voucher"
          onClose={() => setOpenPrint(false)}
          onPrinted={() => toast.success('تم طباعة أمر الصرف بنجاح')}
          onPrintError={() => toast.error('تعذر طباعة أمر الصرف. يرجى المحاولة مرة أخرى.')}
        />
      )}

      {canPrintNotification && (
        <PrintSettlementDialog
          open={openPrintNotification}
          settlement={selectedSettlement}
          printType="notification"
          onClose={() => setOpenPrintNotification(false)}
          onPrinted={() => toast.success('تم طباعة إشعار الصرف بنجاح')}
          onPrintError={() => toast.error('تعذر طباعة إشعار الصرف. يرجى المحاولة مرة أخرى.')}
        />
      )}
    </Stack>
  )
}

function InfoCard({
  label,
  value,
  highlight = false,
}: {
  label: string
  value?: string | null
  highlight?: boolean
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant={highlight ? 'h6' : 'body1'}
        fontWeight={highlight ? 700 : 500}
        color={highlight ? 'primary' : 'text.primary'}
      >
        {value || '—'}
      </Typography>
    </Box>
  )
}
