'use client'

import type { ReactNode } from 'react'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Box } from '@mui/material'
import { RiCloseLine } from 'react-icons/ri'

export type GenericDialogProps = {
  open: boolean
  title: string
  loading?: boolean
  submitText?: string
  cancelText?: string
  submitDisabled?: boolean
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  hideActions?: boolean
  extraActions?: ReactNode
  onClose: () => void
  onSubmit?: () => void
  children: ReactNode
  disablePortal?: boolean
}

const GenericDialog = ({
  open,
  title,
  loading = false,
  submitText = 'حفظ',
  cancelText = 'إلغاء',
  submitDisabled = false,
  maxWidth = 'sm',
  fullWidth = true,
  hideActions = false,
  extraActions,
  onClose,
  onSubmit,
  children,
  disablePortal = false
}: GenericDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth} disablePortal={disablePortal}>
      <DialogTitle>
        <Box className='flex justify-between items-center'>
          {title}
          <IconButton onClick={onClose}>
            <RiCloseLine size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>{children}</DialogContent>

      {!hideActions && (
        <DialogActions sx={{ justifyContent: 'space-between', marginTop: 3 }}>
          <Box>{extraActions}</Box>

          <Box>
            <Button onClick={onClose} disabled={loading}>
              {cancelText}
            </Button>

            {onSubmit && (
              <Button variant='contained' onClick={onSubmit} disabled={loading || submitDisabled}>
                {submitText}
              </Button>
            )}
          </Box>
        </DialogActions>
      )}
    </Dialog>
  )
}

export default GenericDialog
