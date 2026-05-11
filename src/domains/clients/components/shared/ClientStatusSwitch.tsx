'use client'

import { useEffect, useState } from 'react'

import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import { getErrorMessage } from '@/libs/api/getErrorMessage'

import AlertDialog from '@/components/dialogs/AlertDialog'
import { useClientsStore } from '@/contexts/clients/clients.store'
import {
  CLIENT_STATUS_OPTIONS,
  getClientStatus,
  getClientStatusChipColor,
  getClientStatusLabel,
} from '@/domains/clients/utils/clientStatus'
import { ClientStatus, type ClientDto } from '@/types/api/clients'

type ClientStatusSwitchProps = {
  client: ClientDto
}

const ClientStatusSwitch = ({ client }: ClientStatusSwitchProps) => {
  const { changeStatus, fetchClients, loading } = useClientsStore()
  const clientName = client.fullName || client.organizationName || 'هذا الحساب'

  const [open, setOpen] = useState(false)
  const [nextStatus, setNextStatus] = useState<ClientStatus | null>(null)
  const [optimisticStatus, setOptimisticStatus] = useState(() => getClientStatus(client))

  useEffect(() => {
    setOptimisticStatus(getClientStatus(client))
  }, [client])

  const handleChangeStatus = (status: ClientStatus) => {
    if (status === optimisticStatus) return
    setNextStatus(status)
    setOpen(true)
  }

  const handleStatusSelect = (event: SelectChangeEvent<string>) => {
    handleChangeStatus(Number(event.target.value) as ClientStatus)
  }

  const getDialogActionLabel = () => {
    if (nextStatus === ClientStatus.Active && optimisticStatus === ClientStatus.Pending) {
      return 'قبول طلب'
    }

    if (nextStatus === ClientStatus.Active) return 'تفعيل'
    if (nextStatus === ClientStatus.InActive) return 'إيقاف'

    return 'تحديث'
  }

  const handleConfirm = async () => {
    if (nextStatus === null) return

    const previousStatus = optimisticStatus

    try {
      setOptimisticStatus(nextStatus)
      await changeStatus(client.id, nextStatus)
      toast.success('تم تحديث حالة الحساب بنجاح')
    } catch (error) {
      setOptimisticStatus(previousStatus)
      toast.error(getErrorMessage(error, 'فشل تحديث حالة الحساب'))
    } finally {
      await fetchClients()
      setNextStatus(null)
      setOpen(false)
    }
  }

  return (
    <>
      <FormControl size="small" fullWidth>
        <Select<string>
          value={String(optimisticStatus)}
          displayEmpty
          disabled={loading}
          onChange={handleStatusSelect}
          sx={{ minWidth: 150 }}
          renderValue={value => {
            const status = Number(value) as ClientStatus

            return (
              <Chip
                size="small"
                color={getClientStatusChipColor(status)}
                label={getClientStatusLabel(status)}
                sx={{ minWidth: 96 }}
              />
            )
          }}
        >
          {CLIENT_STATUS_OPTIONS.map(option => (
            <MenuItem key={option.value} value={String(option.value)}>
              <Chip
                size="small"
                color={getClientStatusChipColor(option.value)}
                label={option.label}
                variant={option.value === optimisticStatus ? 'filled' : 'outlined'}
              />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <AlertDialog
        open={open}
        title="تأكيد تغيير الحالة"
        loading={loading}
        onClose={() => {
          setOpen(false)
          setNextStatus(null)
        }}
        onConfirm={handleConfirm}
        description={
          <>
            <Typography>
              هل أنت متأكد من <strong>{getDialogActionLabel()}</strong> هذا الحساب؟
            </Typography>

            <Typography mt={1} fontWeight="bold">
              {clientName}
            </Typography>
          </>
        }
      />
    </>
  )
}

export default ClientStatusSwitch
