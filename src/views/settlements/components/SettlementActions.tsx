'use client'

import { useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import { toast } from 'react-toastify'

import { getErrorMessage } from '@/libs/api/getErrorMessage'

import { useSettlementsStore } from '@/contexts/settlements/settlements.store'
import type { SettlementDto } from '@/types/api/settlements'

import ProcessSettlementDialog from './ProcessSettlementDialog'
import CompleteSettlementDialog from './CompleteSettlementDialog'
import CancelSettlementDialog from './CancelSettlementDialog'
import PrintSettlementDialog from './PrintSettlementDialog'
import { normalizeSettlementStatus } from './SettlementStatusChip'

type Props = {
  settlement: SettlementDto
}

export default function SettlementActions({ settlement }: Props) {
  const {
    processSettlement,
    completeSettlement,
    cancelSettlement,
    fetchSettlements,
    fetchSettlementById,
    selectedSettlement,
    loading
  } = useSettlementsStore()

  const status = normalizeSettlementStatus(settlement.status)

  const [openProcess, setOpenProcess] = useState(false)
  const [openComplete, setOpenComplete] = useState(false)
  const [openCancel, setOpenCancel] = useState(false)
  const [openPrint, setOpenPrint] = useState(false)
  const [openPrintNotification, setOpenPrintNotification] = useState(false)

  const refresh = async () =>
    Promise.all([
      fetchSettlements(),
      selectedSettlement?.id === settlement.id
        ? fetchSettlementById(settlement.id)
        : Promise.resolve()
    ])

  const primaryAction = useMemo(() => {
    if (status === 'New') {
      return {
        label: 'بدء معالجة التسوية',
        action: () => setOpenProcess(true)
      }
    }

    if (status === 'InProcess') {
      return {
        label: 'إتمام التسوية',
        action: () => setOpenComplete(true)
      }
    }

    return null
  }, [status])

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" mb={1}>
        الإجراءات المتاحة
      </Typography>

      <Stack spacing={2}>
        {/* Primary Action */}
        {primaryAction && (
          <Button
            variant="contained"
            size="large"
            onClick={primaryAction.action}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : undefined}
          >
            {primaryAction.label}
          </Button>
        )}

        {/* Secondary Actions */}
        {(status === 'New' || status === 'InProcess') && (
          <Button
            variant="outlined"
            color="error"
            disabled={loading}
            onClick={() => setOpenCancel(true)}
          >
            إغلاق التسوية بدون إتمام
          </Button>
        )}

        <Divider />

        {/* Printing */}
        {status !== 'New' && (
          <Stack direction="row" spacing={1}>
            {(status === 'InProcess' || status === 'Completed') && (
              <Button
                variant="outlined"
                disabled={loading}
                onClick={() => setOpenPrint(true)}
              >
                طباعة أمر صرف
              </Button>
            )}

            {status === 'Completed' && (
              <Button
                variant="outlined"
                disabled={loading}
                onClick={() => setOpenPrintNotification(true)}
              >
                طباعة إشعار صرف
              </Button>
            )}
          </Stack>
        )}
      </Stack>

      {/* ===== Dialogs ===== */}

      <ProcessSettlementDialog
  open={openProcess}
  settlement={settlement}
  loading={loading}
  onClose={() => setOpenProcess(false)}
  onSubmit={async () => {
    try {
      await processSettlement(settlement.id)

      toast.success('تم بدء المعالجة')
      setOpenProcess(false)
      await refresh()
    } catch (error) {
      toast.error(getErrorMessage(error, 'تعذر بدء معالجة التسوية'))
    }
  }}
/>


      <CompleteSettlementDialog
        open={openComplete}
        loading={loading}
        onClose={() => setOpenComplete(false)}
        onSubmit={async payload => {
          try {
            await completeSettlement(settlement.id, payload)
            toast.success('تم إتمام التسوية')
            setOpenComplete(false)
            await refresh()
          } catch (error) {
            toast.error(getErrorMessage(error, 'تعذر إتمام التسوية'))
          }
        }}
      />

      <CancelSettlementDialog
        open={openCancel}
        loading={loading}
        onClose={() => setOpenCancel(false)}
        onConfirm={async reason => {
          try {
            await cancelSettlement(settlement.id, { reason })
            toast.success('تم إغلاق التسوية')
            setOpenCancel(false)
            await refresh()
          } catch (error) {
            toast.error(getErrorMessage(error, 'تعذر إغلاق التسوية'))
          }
        }}
      />

      <PrintSettlementDialog
        open={openPrint}
        settlement={settlement}
        onClose={() => setOpenPrint(false)}
      />

      <PrintSettlementDialog
        open={openPrintNotification}
        settlement={settlement}
        printType="notification"
        onClose={() => setOpenPrintNotification(false)}
      />
    </Box>
  )
}
