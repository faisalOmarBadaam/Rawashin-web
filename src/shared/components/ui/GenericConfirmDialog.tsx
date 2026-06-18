import type { ReactNode } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

import { alpha, useTheme } from '@mui/material/styles'

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'

type ConfirmDialogVariant = 'danger' | 'warning' | 'info' | 'success'

type GenericConfirmDialogProps = {
  open: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
  variant?: ConfirmDialogVariant
  icon?: ReactNode
  onClose: () => void
  onConfirm: () => void | Promise<void>
}

export default function GenericConfirmDialog({
  open,
  title = 'تأكيد العملية',
  message = 'هل أنت متأكد من تنفيذ هذه العملية؟',
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  loading = false,
  variant = 'info',
  icon,
  onClose,
  onConfirm,
}: GenericConfirmDialogProps) {
  const theme = useTheme()

  const variantConfig = {
    danger: {
      color: theme.palette.error.main,
      light: theme.palette.error.light,
      buttonColor: 'error' as const,
      defaultIcon: <DeleteOutlineOutlinedIcon />,
    },
    warning: {
      color: theme.palette.warning.main,
      light: theme.palette.warning.light,
      buttonColor: 'warning' as const,
      defaultIcon: <WarningAmberRoundedIcon />,
    },
    info: {
      color: theme.palette.info.main,
      light: theme.palette.info.light,
      buttonColor: 'primary' as const,
      defaultIcon: <InfoOutlinedIcon />,
    },
    success: {
      color: theme.palette.success.main,
      light: theme.palette.success.light,
      buttonColor: 'success' as const,
      defaultIcon: <CheckCircleOutlineRoundedIcon />,
    },
  }

  const currentVariant = variantConfig[variant]

  return (
    <Dialog
  open={open}
  onClose={loading ? undefined : onClose}
  maxWidth="xs"
  fullWidth
  slotProps={{
    paper: {
      sx: {
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: theme.shadows[12],
        border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
        bgcolor: theme.palette.background.paper,
      },
    },
    backdrop: {
      sx: {
        bgcolor: alpha(theme.palette.common.black, 0.45),
        backdropFilter: 'blur(3px)',
      },
    },
  }}
>
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 1,
          background: `linear-gradient(135deg, ${alpha(
            currentVariant.color,
            0.12
          )}, ${alpha(theme.palette.background.paper, 0.96)})`,
        }}
      >
        <Stack direction="row" sx={{ spacing: 2 ,alignItems:"center" }} >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentVariant.color,
              bgcolor: alpha(currentVariant.color, 0.12),
              border: `1px solid ${alpha(currentVariant.color, 0.22)}`,
              '& svg': {
                fontSize: 28,
              },
            }}
          >
            {icon ?? currentVariant.defaultIcon}
          </Box>

          <Box>
            <DialogTitle
              sx={{
                px:1 ,
                fontWeight: 700,
                fontSize: '1.1rem',
                color: theme.palette.text.primary,
              }}
            >
              {title}
            </DialogTitle>

            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                px: 1,
              }}
            >
              يرجى مراجعة الإجراء قبل التأكيد
            </Typography>
          </Box>
        </Stack>
      </Box>

      <DialogContent
        sx={{
          px: 3,
          pt: 2,
          pb: 2,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            lineHeight: 1.9,
          }}
        >
          {message}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 1,
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          color="inherit"
          sx={{
            minWidth: 100,
            borderRadius: 2,
            color: theme.palette.text.primary,
            borderColor: alpha(theme.palette.text.primary, 0.2),
            '&:hover': {
              borderColor: alpha(theme.palette.text.primary, 0.35),
              bgcolor: alpha(theme.palette.text.primary, 0.04),
            },
          }}
        >
          {cancelText}
        </Button>

        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color={currentVariant.buttonColor}
          sx={{
            minWidth: 120,
            borderRadius: 2,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          }}
          startIcon={
            loading ? (
              <CircularProgress
                size={16}
                sx={{
                  color: 'inherit',
                }}
              />
            ) : undefined
          }
        >
          {loading ? 'جاري التنفيذ...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}