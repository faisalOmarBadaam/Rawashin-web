'use client'

import type { ReactNode } from 'react'

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { RiAlertLine, RiCloseLine } from 'react-icons/ri'

import SlideUpTransition from '@/components/transitions/SlideUpTransition'

type AlertDialogProps = {
  open: boolean
  title: string
  description?: ReactNode
  confirmText?: string
  cancelText?: string
  loading?: boolean
  confirmDisabled?: boolean
  maxWidth?: 'xs' | 'sm' | 'md'
  sx?: SxProps<Theme>
  onClose: () => void
  onConfirm: () => void
}

const AlertDialog = ({
  open,
  title,
  description,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  loading = false,
  confirmDisabled = false,
  maxWidth = 'xs',
  sx,
  onClose,
  onConfirm,
}: AlertDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      keepMounted
      TransitionComponent={SlideUpTransition}
      sx={sx}
    >
      <DialogTitle>
        <Box className="flex items-center justify-between">
          <Box className="flex items-center gap-2">
            <RiAlertLine size={20} />
            {title}
          </Box>

          <IconButton onClick={onClose} disabled={loading}>
            <RiCloseLine size={18} />
          </IconButton>
        </Box>
      </DialogTitle>

      {description && <DialogContent dividers>{description}</DialogContent>}

      <DialogActions sx={{ marginTop: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={onConfirm}
          disabled={loading || confirmDisabled}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AlertDialog
