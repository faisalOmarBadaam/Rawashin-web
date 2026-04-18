import { useMemo, useState } from 'react'

import type { EntityPageMode } from '@/core/engine/action.types'

type ConfirmActionKey = 'delete' | 'undo' | 'cancel'

type UseEntityPageParams = {
  mode: EntityPageMode
  dirty?: boolean
  loading?: boolean
  onDelete?: () => void
  onUndo?: () => void
  onCancel?: () => void
  onAfterSaveRedirect?: () => void
}

export const useEntityPage = ({
  mode,
  dirty,
  loading,
  onDelete,
  onUndo,
  onCancel,
  onAfterSaveRedirect
}: UseEntityPageParams) => {
  const [confirmAction, setConfirmAction] = useState<ConfirmActionKey | null>(null)

  const requestDelete = () => setConfirmAction('delete')
  const requestUndo = () => setConfirmAction('undo')
  const requestCancel = () => setConfirmAction('cancel')

  const closeConfirm = () => {
    if (loading) return
    setConfirmAction(null)
  }

  const confirm = () => {
    if (confirmAction === 'delete') onDelete?.()
    if (confirmAction === 'undo') onUndo?.()
    if (confirmAction === 'cancel') onCancel?.()

    setConfirmAction(null)
  }

  const canSave = mode !== 'view' && Boolean(dirty) && !loading

  const confirmDialogConfig = useMemo(() => {
    if (confirmAction === 'delete') {
      return {
        title: 'تأكيد الحذف',
        description: 'هل أنت متأكد أنك تريد حذف هذا العنصر؟',
        confirmText: 'حذف'
      }
    }

    if (confirmAction === 'undo') {
      return {
        title: 'تأكيد التراجع',
        description: 'هل أنت متأكد أنك تريد التراجع عن التغييرات غير المحفوظة؟',
        confirmText: 'تراجع'
      }
    }

    if (confirmAction === 'cancel') {
      return {
        title: 'تأكيد الإلغاء',
        description: 'هل أنت متأكد أنك تريد الإلغاء؟ قد يتم فقدان التغييرات غير المحفوظة.',
        confirmText: 'تأكيد'
      }
    }

    return null
  }, [confirmAction])

  return {
    confirmAction,
    confirmDialogConfig,
    canSave,
    requestDelete,
    requestUndo,
    requestCancel,
    closeConfirm,
    confirm,
    onAfterSaveRedirect
  }
}
