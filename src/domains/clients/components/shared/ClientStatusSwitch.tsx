'use client'

import { useState } from 'react'

import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import { getErrorMessage } from '@/libs/api/getErrorMessage'

import AlertDialog from '@/components/dialogs/AlertDialog'
import { useClientsStore } from '@/contexts/clients/clients.store'
import type { ClientDto } from '@/types/api/clients'

type ClientStatusSwitchProps = {
  client: ClientDto
}

const ClientStatusSwitch = ({ client }: ClientStatusSwitchProps) => {
  const { changeStatus, fetchClients, loading } = useClientsStore()

  const [open, setOpen] = useState(false)
  const [nextStatus, setNextStatus] = useState(client.isActive)
  const [optimisticStatus, setOptimisticStatus] = useState(client.isActive)

  const handleToggle = (checked: boolean) => {
    setNextStatus(checked)
    setOpen(true)
  }

  const handleConfirm = async () => {
    const previousStatus = optimisticStatus

    try {
      setOptimisticStatus(nextStatus)
      await changeStatus(client.id)
      toast.success('تم تحديث حالة الحساب بنجاح')
    } catch (error) {
      setOptimisticStatus(previousStatus)
      toast.error(getErrorMessage(error, 'فشل تحديث حالة الحساب'))
    } finally {
      await fetchClients()
      setOpen(false)
    }
  }

  return (
    <>
      <Switch
        checked={optimisticStatus}
       
        disabled={loading}
        onChange={e => handleToggle(e.target.checked)}
      />

      <AlertDialog
        open={open}
        title="تأكيد تغيير الحالة"
        loading={loading}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        description={
          <>
            <Typography>
              هل أنت متأكد من{' '}
              <strong>
                {nextStatus ? 'تفعيل' : 'إيقاف'}
              </strong>{' '}
              هذا الحساب؟
            </Typography>

            <Typography mt={1} fontWeight="bold">
              {client.fullName}
            </Typography>
          </>
        }
      />
    </>
  )
}

export default ClientStatusSwitch
