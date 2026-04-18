'use client'

import { useCallback, useState } from 'react'

type UseDialogConfirmFlowOptions = {
  onClose: () => void
  onReset?: () => void
}

export const useDialogConfirmFlow = ({ onClose, onReset }: UseDialogConfirmFlowOptions) => {
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const requestConfirm = useCallback(() => {
    if (loading) return
    setConfirmOpen(true)
  }, [loading])

  const cancelConfirm = useCallback(() => {
    if (loading) return
    setConfirmOpen(false)
  }, [loading])

  const closeFlow = useCallback(() => {
    if (loading) return
    setConfirmOpen(false)
    onReset?.()
    onClose()
  }, [loading, onClose, onReset])

  const confirmAndRun = useCallback(
    async (task: () => Promise<void>) => {
      if (loading) return false

      setLoading(true)
      try {
        await task()
        setConfirmOpen(false)
        onReset?.()
        onClose()
        return true
      } finally {
        setLoading(false)
      }
    },
    [loading, onClose, onReset],
  )

  return {
    loading,
    confirmOpen,
    setConfirmOpen,
    requestConfirm,
    cancelConfirm,
    closeFlow,
    confirmAndRun,
  }
}

export default useDialogConfirmFlow
