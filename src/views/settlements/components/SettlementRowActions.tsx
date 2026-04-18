'use client'

import { useState } from 'react'

import { toast } from 'react-toastify'

import { getErrorMessage } from '@/libs/api/getErrorMessage'

import RowActionsMenu, {
  type RowActionItem
} from '@/components/datagrid/RowActionsMenu'
import { useSettlementsStore } from '@/contexts/settlements/settlements.store'
import type { SettlementDto } from '@/types/api/settlements'

import ProcessSettlementDialog from './ProcessSettlementDialog'
import CompleteSettlementDialog from './CompleteSettlementDialog'
import CancelSettlementDialog from './CancelSettlementDialog'
import { normalizeSettlementStatus } from './SettlementStatusChip'

type Props = {
  settlement: SettlementDto
  onView?: (settlement: SettlementDto) => void
}

export default function SettlementRowActions({ settlement, onView }: Props) {
  const {
  processSettlement,
  completeSettlement,
  cancelSettlement,
  fetchSettlements, // ✅ أضف هذا
  loading
} = useSettlementsStore()

  const status = normalizeSettlementStatus(settlement.status)

  const [openProcess, setOpenProcess] = useState(false)
  const [openComplete, setOpenComplete] = useState(false)
  const [openCancel, setOpenCancel] = useState(false)

  /* ✅ الحل الصحيح: بناء المصفوفة بدون false */
  const actionItems: RowActionItem[] = []

  if (status === 'New') {
    actionItems.push({
      label: 'بدء المعالجة',
      actionKey: 'start_process',
      icon: <i className="ri-play-line" />,
      onClick: () => setOpenProcess(true),
      disabled: loading
    })
  }

  if (status === 'InProcess') {
    actionItems.push({
      label: 'إتمام التسوية',
      actionKey: 'complete_settlement',
      icon: <i className="ri-check-line" />,
      onClick: () => setOpenComplete(true),
      disabled: loading
    })
  }

  if (status === 'New' || status === 'InProcess') {
    actionItems.push({
      label: 'إغلاق بدون إتمام',
      actionKey: 'cancel_settlement',
      icon: <i className="ri-close-line" />,
      onClick: () => setOpenCancel(true),
      color: 'error',
      dividerBefore: true,
      disabled: loading
    })
  }

  return (
    <>
      <RowActionsMenu
        module='settlements'
        entityId={settlement.id}
        onView={onView ? () => onView(settlement) : undefined}
        items={actionItems}
      />

      {/* ===== Dialogs ===== */}

      <ProcessSettlementDialog
  open={openProcess}
  settlement={settlement}
  loading={loading}
  onClose={() => setOpenProcess(false)}
  onSubmit={async () => {
    try {
      await processSettlement(settlement.id)
      await fetchSettlements()
      toast.success('تم بدء المعالجة')
      setOpenProcess(false)
    } catch (error) {
      toast.error(getErrorMessage(error, 'تعذر بدء المعالجة'))
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
            await fetchSettlements()
            toast.success('تم إتمام التسوية')
            setOpenComplete(false)
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
            await fetchSettlements()
            toast.success('تم إغلاق التسوية')
            setOpenCancel(false)
          } catch (error) {
            toast.error(getErrorMessage(error, 'تعذر إغلاق التسوية'))
          }
        }}
      />
    </>
  )
}
