'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import { getErrorMessage } from '@/libs/api/getErrorMessage'

import AlertDialog from '@/components/dialogs/AlertDialog'
import { useClientsStore } from '@/contexts/clients/clients.store'
import type { ClientDto } from '@/types/api/clients'

type Props = {
  client: ClientDto
}

export default function ClientCardStatusSwitch({ client }: Props) {
  const { chanceReceiveCard, fetchClients, loading } = useClientsStore()

  const [open, setOpen] = useState(false)
  const [nextStatus, setNextStatus] = useState(!!client.isReceivedCard)
  const [optimistic, setOptimistic] = useState(!!client.isReceivedCard)

  const handleToggle = (checked: boolean) => {
    setNextStatus(checked)
    setOpen(true)
  }

  const handleConfirm = async () => {
    const prev = optimistic

    try {
      setOptimistic(nextStatus)
      await chanceReceiveCard(client.id)
      toast.success('تم تحديث حالة البطاقة')
    } catch (error) {
      setOptimistic(prev)
      toast.error(getErrorMessage(error, 'فشل تحديث حالة البطاقة'))
    } finally {
      await fetchClients()
      setOpen(false)
    }
  }

  return (
    <>
      <Box display='flex' alignItems='center' gap={1}>
        <Switch checked={optimistic} disabled={loading} onChange={e => handleToggle(e.target.checked)} />
        <Typography>{optimistic ? 'استلم البطاقة' : 'لم يستلم'}</Typography>
      </Box>

      <AlertDialog
        open={open}
        loading={loading}
        title='تأكيد تغيير حالة البطاقة'
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        description={
          <Typography>
            هل أنت متأكد من <strong>{nextStatus ? 'تأكيد استلام' : 'إلغاء استلام'}</strong> البطاقة؟
          </Typography>
        }
      />
    </>
  )
}
