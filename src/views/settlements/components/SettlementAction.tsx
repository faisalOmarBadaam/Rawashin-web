'use client'

import { useCallback, useMemo, useState, type ReactElement } from 'react'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { toast } from 'react-toastify'

import { getErrorMessage } from '@/libs/api/getErrorMessage'

import { useSettlementsStore } from '@/contexts/settlements/settlements.store'

import type { SettlementDto } from '@/types/api/settlements'

import CompleteSettlementDialog from './CompleteSettlementDialog'
import CancelSettlementDialog from './CancelSettlementDialog'
import ProcessSettlementDialog from './ProcessSettlementDialog'
import PrintSettlementDialog from './PrintSettlementDialog'
import { normalizeSettlementStatus } from './SettlementStatusChip'

const wrapDisabled = (element: ReactElement, disabled: boolean) =>
  disabled ? <Box component="span">{element}</Box> : element

type Props = {
  settlement: SettlementDto
  onView?: (settlement: SettlementDto) => void
}

export default function SettlementActions({ settlement, onView }: Props) {
  const {
    selectedSettlement,
    processSettlement,
    completeSettlement,
    cancelSettlement,
    fetchSettlements,
    fetchSettlementById
  } = useSettlementsStore()

  const [processing, setProcessing] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [openProcess, setOpenProcess] = useState(false)
  const [openComplete, setOpenComplete] = useState(false)
  const [openCancel, setOpenCancel] = useState(false)
  const [openPrint, setOpenPrint] = useState(false)
  const [openPrintNotification, setOpenPrintNotification] = useState(false)

  const status = normalizeSettlementStatus(settlement.status)

  const availability = useMemo(
    () => ({
      canProcess: status === 'New',
      canComplete: status === 'InProcess',
      canCancel: status === 'New' || status === 'InProcess',
      canPrintPaymentOrder: status === 'InProcess' || status === 'Completed',
      canPrintNotification: status === 'Completed'
    }),
    [status]
  )

  const actionsDisabled = processing || completing || cancelling

  const shouldRefreshSelected = selectedSettlement?.id === settlement.id

 const handleProcess = useCallback(
  async () => {
    try {
      setProcessing(true)
      await processSettlement(settlement.id)
      toast.success('تم بدء معالجة التسوية بنجاح')
      setOpenProcess(false)
      await Promise.all([
        fetchSettlements(),
        shouldRefreshSelected
          ? fetchSettlementById(settlement.id)
          : Promise.resolve()
      ])
    } catch (error) {
      toast.error(getErrorMessage(error, 'تعذر بدء معالجة التسوية. يرجى المحاولة مرة أخرى.'))
    } finally {
      setProcessing(false)
    }
  },
  [
    fetchSettlements,
    fetchSettlementById,
    processSettlement,
    settlement.id,
    shouldRefreshSelected
  ]
)


  const handleComplete = useCallback(
    async (payload: {
      method: number
      paymentReference: string
      adminNote?: string
    }) => {
      try {
        setCompleting(true)
        await completeSettlement(settlement.id, payload)
        toast.success('تم إكمال التسوية بنجاح')
        setOpenComplete(false)
        await Promise.all([
          fetchSettlements(),
          shouldRefreshSelected ? fetchSettlementById(settlement.id) : Promise.resolve()
        ])
      } catch (error) {
        toast.error(getErrorMessage(error, 'تعذر إكمال التسوية. يرجى المحاولة مرة أخرى.'))
      } finally {
        setCompleting(false)
      }
    },
    [
      completeSettlement,
      fetchSettlements,
      fetchSettlementById,
      settlement.id,
      shouldRefreshSelected
    ]
  )

  const handleCancel = useCallback(
    async (reason: string) => {
      try {
        setCancelling(true)
        await cancelSettlement(settlement.id, { reason })
        toast.success('تم إغلاق التسوية بدون إتمام')
        setOpenCancel(false)
        await Promise.all([
          fetchSettlements(),
          shouldRefreshSelected ? fetchSettlementById(settlement.id) : Promise.resolve()
        ])
      } catch (error) {
        toast.error(getErrorMessage(error, 'تعذر إغلاق التسوية. يرجى المحاولة مرة أخرى.'))
      } finally {
        setCancelling(false)
      }
    },
    [
      cancelSettlement,
      fetchSettlements,
      fetchSettlementById,
      settlement.id,
      shouldRefreshSelected
    ]
  )

  return (
    <>
      <Stack direction="row" spacing={1} justifyContent="center">
        <Tooltip title="عرض التفاصيل">
          <span>
            <IconButton size="small" onClick={() => onView?.(settlement)}>
              <i className="ri-eye-line" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip
          title={
            availability.canProcess
              ? 'بدء المعالجة'
              : 'متاح للتسويات الجديدة فقط'
          }
        >
          {wrapDisabled(
            <IconButton
              size="small"
              disabled={!availability.canProcess || actionsDisabled}
              onClick={() => setOpenProcess(true)}
            >
              <i className="ri-play-line" />
            </IconButton>,
            !availability.canProcess || actionsDisabled
          )}
        </Tooltip>

        <Tooltip
          title={
            availability.canComplete
              ? 'إتمام التسوية'
              : 'متاح عند المعالجة فقط'
          }
        >
          {wrapDisabled(
            <IconButton
              size="small"
              disabled={!availability.canComplete || actionsDisabled}
              onClick={() => setOpenComplete(true)}
            >
              <i className="ri-check-line" />
            </IconButton>,
            !availability.canComplete || actionsDisabled
          )}
        </Tooltip>

        <Tooltip
          title={
            availability.canCancel
              ? 'إغلاق بدون إتمام'
              : 'غير متاح لهذه الحالة'
          }
        >
          {wrapDisabled(
            <IconButton
              size="small"
              disabled={!availability.canCancel || actionsDisabled}
              onClick={() => setOpenCancel(true)}
            >
              <i className="ri-close-line" />
            </IconButton>,
            !availability.canCancel || actionsDisabled
          )}
        </Tooltip>

        <Tooltip
          title={
            availability.canPrintPaymentOrder
              ? 'طباعة أمر صرف'
              : 'متاح بعد بدء المعالجة فقط'
          }
        >
          {wrapDisabled(
            <IconButton
              size="small"
              disabled={!availability.canPrintPaymentOrder || actionsDisabled}
              onClick={() => setOpenPrint(true)}
            >
              <i className="ri-printer-line" />
            </IconButton>,
            !availability.canPrintPaymentOrder || actionsDisabled
          )}
        </Tooltip>

        <Tooltip
          title={
            availability.canPrintNotification
              ? 'طباعة إشعار صرف'
              : 'متاح بعد الإكمال فقط'
          }
        >
          {wrapDisabled(
            <IconButton
              size="small"
              disabled={!availability.canPrintNotification || actionsDisabled}
              onClick={() => setOpenPrintNotification(true)}
            >
              <i className="ri-receipt-line" />
            </IconButton>,
            !availability.canPrintNotification || actionsDisabled
          )}
        </Tooltip>
      </Stack>

      <ProcessSettlementDialog
        open={openProcess}
        loading={processing}
       // defaultCommissionPercentage={settlement.commissionPercentage ?? 0}
        settlement={settlement}
        onClose={() => setOpenProcess(false)}
        onSubmit={handleProcess}
      />

      <CompleteSettlementDialog
        open={openComplete}
        loading={completing}
        onClose={() => setOpenComplete(false)}
        onSubmit={handleComplete}
      />

      <CancelSettlementDialog
        open={openCancel}
        loading={cancelling}
        onClose={() => setOpenCancel(false)}
        onConfirm={handleCancel}
      />

      {availability.canPrintPaymentOrder && (
        <PrintSettlementDialog
          open={openPrint}
          settlement={settlement}
          onClose={() => setOpenPrint(false)}
          onPrinted={() => toast.success('تم طباعة أمر الصرف بنجاح')}
        />
      )}

      {availability.canPrintNotification && (
        <PrintSettlementDialog
          open={openPrintNotification}
          settlement={settlement}
          printType="notification"
          onClose={() => setOpenPrintNotification(false)}
          onPrinted={() => toast.success('تم طباعة إشعار الصرف بنجاح')}
          onPrintError={() =>
            toast.error('تعذر طباعة إشعار الصرف. يرجى المحاولة مرة أخرى.')
          }
        />
      )}
    </>
  )
}
