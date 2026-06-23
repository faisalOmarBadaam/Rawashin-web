import type { ChangeEvent } from 'react'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Switch from '@mui/material/Switch'

import { toast } from 'sonner'

import { useUpdateClientReceiptStatus } from '../hooks'

type CardReceiptStatusSwitchProps = {
  id: string
  value: boolean
  disabled?: boolean
}

export default function CardReceiptStatusSwitch({
  id,
  value,
  disabled = false,
}: CardReceiptStatusSwitchProps) {
  const updateReceiptStatusMutation = useUpdateClientReceiptStatus()

  const checked = updateReceiptStatusMutation.isPending
    ? (updateReceiptStatusMutation.variables?.isReceivedCard ?? value)
    : value

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.checked

    if (nextValue === checked) return


      await updateReceiptStatusMutation.mutateAsync({
        id,
        isReceivedCard: nextValue,
  }) 
    toast.success('تم تحديث حالة استلام البطاقة بنجاح')

}

  return (
    <Box
      sx={{ width: '100%' }}
      onClick={(event) => event.stopPropagation()}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <Switch
          checked={checked}
          color="success"
          disabled={disabled || updateReceiptStatusMutation.isPending}
          onChange={handleChange}
        />

        {updateReceiptStatusMutation.isPending && <CircularProgress size={16} />}
      </Box>
    </Box>
  )
}