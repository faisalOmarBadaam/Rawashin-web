'use client'

import { useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tooltip,
  Typography
} from '@mui/material'
import { RiPrinterLine, RiEyeLine } from 'react-icons/ri'

import CardPreviewDialog from './CardPreviewDialog'
import type { ClientDto } from '@/types/api/clients'

type Props = {
  selectedClients: ClientDto[]
}

export default function PrintOptionsDialog({ selectedClients }: Props) {
  const [open, setOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const canPrint = selectedClients.length > 0

  return (
    <>
      <Tooltip title={!canPrint ? 'يرجى تحديد عميل واحد على الأقل' : ''}>
        <span>
          <Button
            variant="outlined"
            startIcon={<RiPrinterLine />}
            disabled={!canPrint}
            onClick={() => setOpen(true)}
          >
            طباعة
          </Button>
        </span>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography fontWeight="bold">معاينة الطباعة</Typography>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            سيتم طباعة {selectedClients.length} بطاقة.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>إلغاء</Button>

          <Button
            variant="contained"
            startIcon={<RiEyeLine />}
            onClick={() => {
              setPreviewOpen(true)
              setOpen(false)
            }}
          >
            معاينة
          </Button>
        </DialogActions>
      </Dialog>

      <CardPreviewDialog
        open={previewOpen}
        clients={selectedClients}
        
        onClose={() => setPreviewOpen(false)}
      />
    </>
  )
}
