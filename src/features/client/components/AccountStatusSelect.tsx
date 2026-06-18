import { useMemo, useState } from 'react'

import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

import type { SelectChangeEvent } from '@mui/material/Select'
import { alpha, useTheme } from '@mui/material/styles'
import { toast } from 'sonner'

import type { AccountStatus } from '../types'
import { accountStatusOptions } from '../constants'
import { useUpdateClientAccountStatus } from '../hooks'

type AccountStatusSelectProps = {
  id: string
  value: AccountStatus
  disabled?: boolean
  onChanged?: (value: AccountStatus) => void
}

export default function AccountStatusSelect({
  id,
  value,
  disabled = false,
  onChanged,
}: AccountStatusSelectProps) {
  const theme = useTheme()

  const [currentValue, setCurrentValue] = useState<AccountStatus>(value)

  const updateAccountStatusMutation = useUpdateClientAccountStatus()

  const isLoading = updateAccountStatusMutation.isPending
  const isDisabled = disabled || isLoading

  const statusStyle = useMemo(() => {
    switch (currentValue) {
      case 1:
        return {
          color: theme.palette.success.main,
          bgColor: alpha(theme.palette.success.main, 0.12),
          borderColor: alpha(theme.palette.success.main, 0.32),
        }

      case 2:
        return {
          color: theme.palette.warning.main,
          bgColor: alpha(theme.palette.warning.main, 0.12),
          borderColor: alpha(theme.palette.warning.main, 0.32),
        }

      case 0:
      default:
        return {
          color: theme.palette.error.main,
          bgColor: alpha(theme.palette.error.main, 0.1),
          borderColor: alpha(theme.palette.error.main, 0.28),
        }
    }
  }, [currentValue, theme])

  const selectedOption = accountStatusOptions.find(
    (option) => option.value === currentValue
  )

  const handleChange = async (event: SelectChangeEvent) => {
    const nextValue = Number(event.target.value) as AccountStatus

    if (nextValue === currentValue) return

    try {
      await updateAccountStatusMutation.mutateAsync({
        id,
        accountStatus: nextValue,
      })

      setCurrentValue(nextValue)
      toast.success('تم تحديث حالة الحساب بنجاح')
      onChanged?.(nextValue)
    } catch {
      toast.error('فشل تحديث حالة الحساب')
    }
  }

  return (
    <Select
      value={String(currentValue)}
      onChange={handleChange}
      onClick={(event) => event.stopPropagation()}
      size="small"
      fullWidth
      disabled={isDisabled}
      displayEmpty
      renderValue={() => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1,
              py: 0.35,
              borderRadius: 999,
              bgcolor: statusStyle.bgColor,
              border: `1px solid ${statusStyle.borderColor}`,
              color: statusStyle.color,
              maxWidth: '100%',
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: statusStyle.color,
                flexShrink: 0,
              }}
            />

            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                lineHeight: 1.4,
                color: 'inherit',
              }}
            >
              {selectedOption?.label ?? 'غير محدد'}
            </Typography>
          </Box>

          {isLoading && (
            <CircularProgress
              size={14}
              sx={{
                color: statusStyle.color,
                flexShrink: 0,
              }}
            />
          )}
        </Box>
      )}
      MenuProps={{
        disableScrollLock: true,
        slotProps: {
          paper: {
            sx: {
              mt: 0.5,
              borderRadius: 2,
              boxShadow: theme.shadows[8],
              border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
            },
          },
        },
      }}
      sx={{
        height: 38,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.82),

        '& .MuiSelect-select': {
          display: 'flex',
          alignItems: 'center',
          py: 0.5,
          pr: '12px !important',
          pl: '32px !important',
        },

        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: alpha(theme.palette.divider, 0.9),
        },

        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: statusStyle.borderColor,
        },

        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: statusStyle.color,
          borderWidth: 1,
        },

        '&.Mui-focused': {
          boxShadow: `0 0 0 3px ${alpha(statusStyle.color, 0.12)}`,
        },

        '&.Mui-disabled': {
          bgcolor: alpha(theme.palette.action.disabledBackground, 0.5),
        },
      }}
    >
      {accountStatusOptions.map((option) => {
        const optionValue = option.value as AccountStatus

        const optionColor =
          optionValue === 1
            ? theme.palette.success.main
            : optionValue === 2
              ? theme.palette.warning.main
              : theme.palette.error.main

        return (
          <MenuItem
            key={String(option.value)}
            value={String(option.value)}
            sx={{
              gap: 1,
              minHeight: 38,
              fontSize: 14,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: optionColor,
              }}
            />

            {option.label}
          </MenuItem>
        )
      })}
    </Select>
  )
}