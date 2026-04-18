'use client'

import { useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { ClientDto } from '@/types/api/clients'

import CardRenderer from './CardRenderer'
import CardPrintJob from './CardPrintJob'
import type { CardVariant } from './cardConfig'

type Props = {
  clients: ClientDto[]
  variant: CardVariant
  showActions?: boolean
  cardsPerPage?: number
}

export default function CardPrinter({
  clients,
  variant,
  showActions = true,
  cardsPerPage = 1
}: Props) {
  const [job, setJob] = useState<'print' | 'pdf' | null>(null)
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null)

  const totalFaces = clients.length
  const totalPages = Math.ceil(totalFaces / cardsPerPage)

  const isProcessing = job !== null

  const handlePrint = () => {
    if (isProcessing) return
    setJob('print')
  }

  const handleExportPdf = () => {
    if (isProcessing) return
    setExportProgress({ current: 0, total: clients.length })
    setJob('pdf')
  }

  const handleJobComplete = () => {
    setJob(null)
    setExportProgress(null)
  }

  const handleProgress = useMemo(
    () =>
      (progress: { current: number; total: number }) => {
        setExportProgress(progress)
      },
    []
  )

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {showActions && (
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2">
            عدد البطاقات: {totalFaces} • عدد الصفحات: {totalPages}
          </Typography>

          <Button variant="contained" onClick={handlePrint} disabled={isProcessing}>
            طباعة
          </Button>

          <Button variant="outlined" onClick={handleExportPdf} disabled={isProcessing}>
            تصدير PDF
          </Button>

          {exportProgress && (
            <Typography variant="body2" color="text.secondary">
              تم تجهيز {exportProgress.current} من {exportProgress.total}
            </Typography>
          )}
        </Stack>
      )}

      {clients.length > 0 ? (
        <CardRenderer
          clients={clients}
          variant={variant}
          layout="preview"
          cardsPerPage={cardsPerPage}
        />
      ) : (
        <Typography variant="body2" color="text.secondary">
          لا توجد بطاقات للمعاينة.
        </Typography>
      )}

      {job && (
        <CardPrintJob
          clients={clients}
          variant={variant}
          mode={job}
          onComplete={handleJobComplete}
          onProgress={job === 'pdf' ? handleProgress : undefined}
          cardsPerPage={cardsPerPage}
        />
      )}
    </Box>
  )
}
