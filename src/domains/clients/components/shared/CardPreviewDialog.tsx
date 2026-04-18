'use client'

import { useCallback, useMemo, useRef, useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

import CardPrintJob from '@/components/cards/CardPrintJob'
import PrintCard from '@/components/print/PrintCard'
import usePrintContent from '@/components/print/usePrintContent'
import { trackRechargeCardPrinted } from '@/core/analytics/events'

import type { ClientDto } from '@/types/api/clients'

type Props = {
  open: boolean
  clients: ClientDto[]
  onClose: () => void
  disableActions?: boolean
}

export default function CardPreviewDialog({
  open,
  clients,
  onClose,
  disableActions = false
}: Props) {
  const [job, setJob] = useState<'pdf' | null>(null)
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(
    null
  )
  const printContainerRef = useRef<HTMLDivElement>(null)

  const hasClients = clients.length > 0

  const printableClients = useMemo(
    () => clients.filter(client => Boolean(client.creditAccount?.cardNumber)),
    [clients]
  )

  const isDisabled = disableActions || job !== null || !hasClients || printableClients.length === 0

  const handlePrint = usePrintContent({
    contentRef: printContainerRef,
    documentTitle: 'clients-cards',
  })

  const onPrint = () => {
    if (isDisabled) return
    trackRechargeCardPrinted({
      entityId: printableClients[0]?.id,
      module: 'clients'
    })
    handlePrint?.()
  }

  const handlePdf = () => {
    if (isDisabled) return
    setExportProgress({ current: 0, total: printableClients.length })
    setJob('pdf')
  }

  const handleComplete = () => {
    setJob(null)
    setExportProgress(null)
  }

  const handleProgress = useCallback((progress: { current: number; total: number }) => {
    setExportProgress(progress)
  }, [])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>معاينة البطاقات</DialogTitle>

      <DialogContent dividers>
        <style>{`
          @media print {
            .client-card-print-root {
              display: block !important;
            }

            .client-card-print-page {
              page-break-after: always;
              break-after: page;
              display: flex;
              justify-content: center;
              align-items: center;
            }

            .client-card-print-page:last-child {
              page-break-after: auto;
              break-after: auto;
            }
          }
        `}</style>

        <Stack spacing={3} alignItems="center" ref={printContainerRef} className='client-card-print-root'>
          {printableClients.length > 0 ? (
            printableClients.map(client => (
              <Box key={client.id} className='client-card-print-page'>
                <PrintCard
                  cardNumber={client.creditAccount?.cardNumber ?? ''}
                  backgroundUrl='/images/front.jpg'
                  logoUrl='/images/logo.png'
                />
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              لا توجد بطاقات للمعاينة.
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: 'wrap' }}>
        <Tooltip title={isDisabled ? 'لا يمكن الطباعة' : ''} disableHoverListener={!isDisabled}>
          <span>
            <Button variant="contained" onClick={onPrint} disabled={isDisabled}>
              طباعة
            </Button>
          </span>
        </Tooltip>

        <Tooltip title={isDisabled ? 'لا يمكن التصدير' : ''} disableHoverListener={!isDisabled}>
          <span>
            <Button variant="outlined" onClick={handlePdf} disabled={isDisabled}>
              تصدير PDF
            </Button>
          </span>
        </Tooltip>

        <Button onClick={onClose} disabled={job !== null}>
          إغلاق
        </Button>
      </DialogActions>

      {exportProgress && (
        <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
          <Typography variant="body2" color="text.secondary">
            تم تجهيز {exportProgress.current} من {exportProgress.total}
          </Typography>
        </DialogActions>
      )}


      {job && (
        <CardPrintJob
          clients={printableClients}
          variant="clients"
          mode={job}
          onComplete={handleComplete}
          onProgress={job === 'pdf' ? handleProgress : undefined}
        />
      )}
    </Dialog>
  )
}
