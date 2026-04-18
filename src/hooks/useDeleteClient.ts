'use client'

import { useMemo, useState } from 'react'

import { toast } from 'react-toastify'

import type { ClientVariant } from '@/domains/clients/variants/clientVariants'
import type { ClientDto } from '@/types/api/clients'
import { ClientType } from '@/types/api/clients'
import { useClientsStore } from '@/contexts/clients/clients.store'

type UseDeleteClientResult = {
  deleteTarget: ClientDto | null
  deleteTargetName: string
  deleting: boolean
  requestDelete: (client: ClientDto) => void
  cancelDelete: () => void
  confirmDelete: () => Promise<void>
}

type UseDeleteClientOptions = {
  variant?: ClientVariant
  merchantId?: string
}

export function useDeleteClient(options?: UseDeleteClientOptions): UseDeleteClientResult {
  const [deleteTarget, setDeleteTarget] = useState<ClientDto | null>(null)
  const [deleting, setDeleting] = useState(false)

  const deleteClient = useClientsStore(state => state.deleteClient)
  const deleteSubMerchant = useClientsStore(state => state.deleteSubMerchant)

  const deleteTargetName = useMemo(() => {
    if (!deleteTarget) return ''

    if (deleteTarget.clientType === ClientType.Merchant) {
      return deleteTarget.organizationName || ''
    }

    return deleteTarget.fullName || ''
  }, [deleteTarget])

  const requestDelete = (client: ClientDto) => {
    setDeleteTarget(client)
  }

  const cancelDelete = () => {
    setDeleteTarget(null)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    try {
      setDeleting(true)

      if (options?.variant === 'merchants' && options.merchantId) {
        await deleteSubMerchant(options.merchantId, deleteTarget.id)
      } else {
        await deleteClient(deleteTarget.id)
      }

      toast.success('تم الحذف بنجاح')
      setDeleteTarget(null)
    } catch {
      toast.error('فشل في عملية الحذف')
    } finally {
      setDeleting(false)
    }
  }

  return {
    deleteTarget,
    deleteTargetName,
    deleting,
    requestDelete,
    cancelDelete,
    confirmDelete,
  }
}
